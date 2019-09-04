/**
 * Convert short-based module name to full-specificed module name, 
 * e.g., `[module]` => `@server-state/[module]-module`.
 * 
 * If module name begins with "c-", custom module import are used, 
 * e.g. `c-[module]` => `[module]`.
 * @param {string} moduleName shortname module name
 * @returns {string} Node module name, as requirable
 */
module.exports = function nodeModuleName(moduleName) {
	if (moduleName.startsWith('c-')) {
		return moduleName.substr(2, moduleName.length - 2);
	}
	return `@server-state/${moduleName}-module`;
};