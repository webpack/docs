module.exports = function(grunt) {
	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
	grunt.loadTasks("tasks");
	var webpack = require("webpack");
	grunt.initConfig({
		webpack: {
			options: require("./webpack.config.js"),
			development: {
				devtool: "eval",
			},
			production: {
				plugins: [
					new webpack.DefinePlugin({
						GA_TRACKING_CODE: JSON.stringify('UA-46921629-1'),
						GA_TRACKING_CONFIG: JSON.stringify('webpack.github.io')
					}),
					new webpack.optimize.OccurenceOrderPlugin(),
					new webpack.optimize.UglifyJsPlugin()
				]
			}
		},
		staticwiki: {
			development: {
				files: {
					"dist/index.html": "layouts/landing.html",
					"dist/[title].html": "layouts/doc.html"
				},
			},
			production: {
				files: {
					"dist/index.html": "layouts/landing.html",
					"dist/[title].html": "layouts/doc.html"
				},
				options: {
					minify: true
				}
			}
		},
		"webpack-dev-server": {
			development: {
				contentBase: "dist",
				port: 8088, // http://localhost:8088/webpack-dev-server/webpack-getting-started.html
				webpack: grunt.util._.merge(require("./webpack.config.js"), {
					devtool: "eval"
				})
			}
		},
		"gh-pages": {
			options: {
				message: "Publish",
				base: "dist"
			},
			src: ["**"]
		},
		clean: ["dist"],
		watch: {
			lr: {
				options: { livereload: true },
				files: ["dist"],
			},
			html: {
				files: ["layouts/**/*.html", "lib/**/*.js"],
				tasks: ["staticwiki:development"],
			},
		},
	});
	grunt.registerTask("development", ["webpack-dev-server:development", "staticwiki:development", "watch"]);
	grunt.registerTask("production", ["webpack:production", "staticwiki:production"]);
	grunt.registerTask("deploy", ["clean", "webpack:production", "staticwiki:production", "gh-pages"]);
	grunt.registerTask("dev", ["development"]);
	grunt.registerTask("default", ["production"]);
};