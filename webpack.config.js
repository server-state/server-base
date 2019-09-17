module.exports = {
    entry: './src/index.js',
    target: 'node',
    module: {
    },
    output: {
        path: __dirname,
        filename: 'index.js',
        libraryTarget: 'commonjs2'
    },
    externals: {
        'express': 'express'
    }
};
