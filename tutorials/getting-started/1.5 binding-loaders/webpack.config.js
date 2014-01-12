module.exports = {
	entry: "./entry.js",
	module: {
		loaders: [
			{ test: /\.css$/, loader: "style!css" }
		]
	},
	output: {
		path: __dirname,
		filename: "bundle.js"
	}
};