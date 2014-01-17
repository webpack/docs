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
			// support for jade files
			{ test: /\.jade$/, loader: "jade-loader" },

			// support for less files
			{ test: /\.less$/, loader: "style-loader!css-loader!less-loader" },

			// support for coffeescript files
			{ test: /\.coffee$/, loader: "coffee-loader" }
		]
	}
};