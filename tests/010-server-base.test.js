const ServerState = require('../src/index');

describe('server state class', () => {
    it('should instantiate', () => {
        expect(new ServerState()).toBeTruthy();
    });

    describe('ServerState::init', () => {
        /**
         * @type {ServerBase}
         */
        let sersta;
        let expressMockApp;

        beforeEach(() => {
            sersta = new ServerState();
            sersta.addModule('a', () => 'a');
            sersta.addModule('b', (b) => b, [], 'b');
            sersta.addModule('c', () => new Promise(resolve =>
                setTimeout(() => resolve('c'), 100)
            ));

            expressMockApp = require('./express.mock')();
        });

        it('should correctly create all routes', () => {
            // Act:
            sersta.init(expressMockApp);

            // Assert:
            const modules = ['a', 'b', 'c'];
            expect(expressMockApp.getRoutes).toHaveProperty('/api/v1/all');

            for (let module of modules) {
                expect(expressMockApp.getRoutes).toHaveProperty(`/api/v1/${module}`);
                expect(expressMockApp.getRoutes).toHaveProperty(`/api/v1/${module}/permissions`);
            }
        });

        describe('route `all`', () => {
            let expressMockApp;

            beforeEach(() => {
                expressMockApp = require('./express.mock')();
                sersta.init(expressMockApp);
            });

            it('should include responses of all modules in the `all` route', async (done) => {
                const result = (await expressMockApp.__executeGET('/api/v1/all'));
                const parsedResult = JSON.parse(result.data);

                expect(result.status).toBe(200);

                expect(parsedResult).toBeTruthy();

                expect(parsedResult).toHaveProperty('a');
                expect(parsedResult).toHaveProperty('b');
                expect(parsedResult).toHaveProperty('c');

                expect(parsedResult.a).toBe('a');
                expect(parsedResult.b).toBe('b');
                expect(parsedResult.c).toBe('c');
                done();
            });

            it('should correctly setup route for simple synchronous module a', async (done) => {
                const result = (await expressMockApp.__executeGET('/api/v1/a'));
                const parsedResult = JSON.parse(result.data);

                expect(result.status).toBe(200);
                expect(parsedResult).toBe('a');
                done();
            });

            it('should correctly setup route for asynchronous module c', async (done) => {
                const result = (await expressMockApp.__executeGET('/api/v1/c'));
                const parsedResult = JSON.parse(result.data);

                expect(result.status).toBe(200);
                expect(parsedResult).toBe('c');
                done();
            });

            describe('passing options to modules', () => {
                it('should correctly pass options to the module if specified', async (done) => {
                    const result = (await expressMockApp.__executeGET('/api/v1/b'));
                    const parsedResult = JSON.parse(result.data);

                    expect(result.status).toBe(200);
                    expect(parsedResult).toBe('b');
                    done();
                });
            });
        });

    });

    describe('adding a module', () => {
        /**
         * @type {ServerBase}
         */
        let sersta;

        beforeEach(() => {
            sersta = new ServerState();
        });

        it('should successfully add a module', () => {
            sersta.addModule('test', () => true);

            expect(sersta['modules']).toHaveProperty('test');
        });

        it('should fail to add a module a second time', () => {
            console.warn = jest.fn();

            sersta.addModule('test', () => true);
            sersta.addModule('test', () => true);

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

        it('should display the correct groups in the /[module]/permissions path', async done => {
            // Act:
            const module1PermissionsResult = await expressAppMock.__executeGET('/api/v1/1/permissions', 'admin');
            const module3PermissionsResult = await expressAppMock.__executeGET('/api/v1/3/permissions', 'admin');

            // Assert:
            expect(module1PermissionsResult.status).toBe(200);
            expect(module3PermissionsResult.status).toBe(200);

            expect(module1PermissionsResult.data).toBe(JSON.stringify(['admin']));
            expect(module3PermissionsResult.data).toBe(JSON.stringify(['admin', 'guest']));

            done();
        });

        it('shouldn\'t display the correct groups in the /[module]/permissions for unauthorized users', async done => {
            const result = (await expressAppMock.__executeGET('/api/v1/1/permissions', 'anonymous'));

            expect(result.status).toBe(403);

            done();
        });

        it('should allow access for authorized users', async done => {
            const result1 = await expressAppMock.__executeGET('/api/v1/1', 'admin');
            const result3 = await expressAppMock.__executeGET('/api/v1/3', 'admin');

            expect(result1).toStrictEqual({data: '1', status: 200});
            expect(result3).toStrictEqual({data: '3', status: 200});

            done();
        });

        it('should deny access for unauthorized users', async done => {
            const result = await expressAppMock.__executeGET('/api/v1/1', 'guest');

            expect(result.status).toBe(403);
            done();
        });

        it('should deny access when no authorizedGroups are passed', async done => {
            const result = await expressAppMock.__executeGET('/api/v1/2', 'admin');

            expect(result.status).toBe(403);
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
            const result = await expressAppMock.__executeGET('/api/v1/1');

            expect(result.status).toBe(500);
        });

        it('should still send 200 for the working module', async () => {
            const result = await expressAppMock.__executeGET('/api/v1/2');

            expect(result.status).toBe(200);
        });

        it('should send HTTP 500 for the /api/all endpoint', async () => {
            const result = await expressAppMock.__executeGET('/api/v1/all');

            expect(result.status).toBe(500);
        });
    });
});
