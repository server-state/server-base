const ServerState = require('../src/index');

describe('server state class', () => {
    it('should instantiate', () => {
        expect(new ServerState()).toBeTruthy();
    });

    describe('ServerState::init', () => {
        /**
         * @type {ServerState}
         */
        let s;

        let expressAppMock;

        beforeEach(() => {
            s = new ServerState();
            s.addModule('a', () => 'a');
            s.addModule('b', (b) => b, [], 'b');
            s.addModule('c', () => new Promise(resolve =>
                setTimeout(() => resolve('c'), 100)
            ));

            expressAppMock = {
                get: jest.fn()
            };
        });

        it('should correctly create all routes', () => {
            s.init(expressAppMock);
            expect(expressAppMock.get).toHaveBeenCalledTimes(4);
        });

        describe('route `all`', () => {
            let routes = {};
            const req = {};
            const res = {
                json: JSON.stringify
            };

            beforeEach(() => {
                routes = {};
                expressAppMock = {
                    get: (route, cb) => {
                        routes[route] = cb;
                    },
                    _run: (route) => {
                        return routes[route](req, res);
                    }
                };

                s.init(expressAppMock);
            });

            it('should include responses of all modules in the `all` route', async (done) => {
                expect(await expressAppMock._run('/api/v1/all')).toBeTruthy();
                const result = JSON.parse(await expressAppMock._run('/api/v1/all'));
                expect(result).toHaveProperty('a');
                expect(result).toHaveProperty('b');
                expect(result).toHaveProperty('c');

                expect(result.a).toBe('a');
                expect(result.b).toBe('b');
                expect(result.c).toBe('c');
                done();
            });

            it('should correctly setup route for simple synchronous module a', async (done) => {
                const resA = JSON.parse(await expressAppMock._run('/api/v1/a'));
                expect(resA).toBe('a');
                done();
            });

            it('should correctly setup route for asynchronous module c', async (done) => {
                const resC = JSON.parse(await expressAppMock._run('/api/v1/c'));
                expect(resC).toBe('c');
                done();
            });

            describe('passing options to modules', () => {
                it('should correctly pass options to the module if specified', async (done) => {
                    const resB = JSON.parse(await expressAppMock._run('/api/v1/b'));
                    expect(resB).toBe('b');
                    done();
                });
            });
        });

    });

    describe('adding a module', () => {
        /**
         * @type {ServerState}
         */
        let s;

        beforeEach(() => {
            s = new ServerState();
        });

        it('should successfully add a module', () => {
            s.addModule('test', () => true);
            expect(s.modules).toHaveProperty('test');
        });

        it('should fail to add a module a second time', () => {
            s.addModule('test', () => true);
            console.warn = jest.fn();
            s.addModule('test', () => true);
            expect(console.warn).toHaveBeenCalled();
        });
    });

    describe('authentication system', () => {
        let expressAppMock;

        beforeAll(() => {
            expressAppMock = require('./express.mock')();

            const sersta = new ServerState({
                isAuthorized: (req, authorizedGroups) => {
                    return (authorizedGroups.includes(req.user));
                }
            });
            sersta.addModule('1', () => 1, ['admin']);
            sersta.addModule('2', () => 2, []);
            sersta.addModule('3', () => 3, ['admin', 'guest']);
            sersta.init(expressAppMock);
        });

        it('should allow access for authorized users', async done => {
            expect(await expressAppMock.__executeGET('/api/v1/1', 'admin')).toStrictEqual({data: '1', status: 200});
            expect(await expressAppMock.__executeGET('/api/v1/3', 'admin')).toStrictEqual({data: '3', status: 200});

            done();
        });

        it('should deny access for unauthorized users', async done => {
            expect(await expressAppMock.__executeGET('/api/v1/1', 'guest')).toHaveProperty('status', 403);
            done();
        });

        it('should deny access when no authorizedGroups are passed', async done => {
            expect(await expressAppMock.__executeGET('/api/v1/2', 'admin')).toHaveProperty('status', 403);
            done();
        });

        it('should only show authorized modules for /api/v1/all', async done => {
            const adminResults = await expressAppMock.__executeGET('/api/v1/all', 'admin');
            const guestResults = await expressAppMock.__executeGET('/api/v1/all', 'guest');

            expect(adminResults).toHaveProperty('status', 200);
            expect(guestResults).toHaveProperty('status', 200);

            expect(Object.keys(JSON.parse(adminResults.data))).toHaveLength(2);

            done();
        });
    });

    describe('malconfigured modules / errors in modules', () => {
        let expressAppMock;

        beforeAll(() => {
            expressAppMock = require('./express.mock')();
            const sersta = new ServerState({logToConsole: false, logToFile: false});
            sersta.addModule('1', () => {throw new Error('A willingly malconfigured module');});
            sersta.addModule('2', () => 2);
            sersta.init(expressAppMock);
        });

        it('should send HTTP 500 for the malconfigured module', async () => {
            expect(await expressAppMock.__executeGET('/api/v1/1')).toHaveProperty('status', 500);
        });

        it('should still send 200 for the working module', async () => {
            expect(await expressAppMock.__executeGET('/api/v1/2')).toHaveProperty('status', 200);
        });

        it('should send HTTP 500 for the /api/all endpoint', async () => {
            expect(await expressAppMock.__executeGET('/api/v1/all')).toHaveProperty('status', 500);
        });
    });
});
