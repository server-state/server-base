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
            s.addModule('b', (b) => b, 'b');
            s.addModule('c', () => new Promise(resolve =>
                setTimeout(() => resolve('c'), 100)
            ));

            expressAppMock = {
                get: jest.fn()
            }
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
            }

            beforeEach(() => {
                routes = {};
                expressAppMock = {
                    get: (route, cb) => {
                        routes[route] = cb;
                    },
                    _run: (route) => {
                        return routes[route](req, res);
                    }
                }

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
                })
            })
        });

    });

    describe('adding a module', () => {
        /**
         * @type {ServerState}
         */
        let s;

        beforeEach(() => {
            s = new ServerState();
        })

        it('should successfully add a module', () => {
            s.addModule('test', () => true);
            expect(s.modules).toHaveProperty('test');
        });

        it('should fail to add a module a second time', () => {
            s.addModule('test', () => true);
            console.error = jest.fn();
            s.addModule('test', () => true);
            expect(console.error).toHaveBeenCalled();
        })
    })
});
