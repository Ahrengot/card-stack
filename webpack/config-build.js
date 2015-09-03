var path = require("path");
var webpack = require("webpack");
var paths = require('../paths');

module.exports = {
	debug: false,
	output: {
		filename: 'combined.min.js'
	},
	resolveLoader: {
		modulesDirectories: ['node_modules']
	},
    resolve: {
    	extensions: ['', '.js', '.jsx']
    },
    module: {
    	loaders: [
			{
				test: /\.jsx$/,
				loaders: ['babel'],
				exclude: /node_modules/
			},
			{ test: /\.css$/, loaders: ['style', 'css']}
    	]
    },
	plugins: [
		new webpack.optimize.DedupePlugin(),
		new webpack.optimize.UglifyJsPlugin({
			compress: {
				warnings: false
			}
		}),
		new webpack.IgnorePlugin(/vertx/), // https://github.com/webpack/webpack/issues/353
    ]
};