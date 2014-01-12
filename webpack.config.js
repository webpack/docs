module.exports = {
	cache: true,
	entry: {
		doc: "./app/doc.js",
		landing: "./app/landing.js",
		tutorial: "./app/tutorial.js"
	},
	output: {
		path: __dirname + "/dist",
		publicPath: "",
		filename: "js/[name].js",
		chunkFilename: "js/[id].js"
	},
	module: {
		loaders: [
			{ test: /\.styl$/,   loader: "style-loader!css-loader!stylus-loader" },
			{ test: /\.css$/,    loader: "style-loader!css-loader" },
			{ test: /\.woff$/,   loader: "url-loader?prefix=font/&limit=5000&minetype=application/font-woff" },
			{ test: /\.ttf$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.eot$/,    loader: "file-loader?prefix=font/" },
			{ test: /\.svg$/,    loader: "file-loader?prefix=font/" },
		]
	}
};