var ExtractTextPlugins = require("extract-text-webpack-plugin");
var ExtractTextPlugin = new ExtractTextPlugins("css/[name].css");
var webpack = require('webpack');
var minifyPlugin = new webpack.optimize.MinChunkSizePlugin({
    compress: {
        warnings: false
    }
});
module.exports = {
	entry: {
		doc: "./app/doc.js",
		landing: "./app/landing.js",
		tutorial: "./app/tutorial.js",
		"404": "./app/404.js"
	},
	output: {
		path: __dirname + "/dist",
		publicPath: "",
		filename: "js/[name].js",
		chunkFilename: "js/[id].js"
	},
	module: {
		loaders: [
			{ test: /\.styl$/,   loader: ExtractTextPlugin.extract("style-loader", "css-loader!autoprefixer-loader?browsers=last 2 versions!stylus-loader") },
			{ test: /\.css$/,    loader: "style-loader!css-loader!autoprefixer-loader?browsers=last 2 versions" },
			{ test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&minetype=application/font-woff" },
			{ test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.eot$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,    loader: "file-loader?prefix=font/" },
		]
	},
	plugins: [
		ExtractTextPlugin,
		minifyPlugin
	]
};