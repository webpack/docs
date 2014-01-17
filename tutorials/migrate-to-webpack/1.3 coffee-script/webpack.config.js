module.exports = {
	entry: "./app.coffee",
	output: {
		path: __dirname,
		filename: "bundle.js"
	},
	module: {
		loaders: [
			{ test: /\.coffee$/, loader: "coffee-loader" }
		]
	}
};