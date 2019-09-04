const nodeModuleName = require('../src/util/module-name');

describe('module name resolution', () => {
	it('should correctly convert a raw module name', () => {
		expect(nodeModuleName('abc')).toBe('@server-state/abc-module');
	});
});
