module.exports = {
	// the entry point
	entry: "./app.coffee",

	output: {
		// the output path
		path: __dirname,

		// the output filename
		filename: "bundle.js"
	},

	module: {
		loaders: [
			// support for coffeescript files
			{ test: /\.coffee$/, loader: "coffee-loader" }
		]
	}
};