module.exports = {
	entry: './src/index.js',
	target: 'node',
	module: {
		exprContextCritical: false
	},
	output: {
		path: __dirname,
		filename: 'index.js',
		libraryTarget: 'commonjs2'
	},
};
