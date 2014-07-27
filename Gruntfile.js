var path = require("path");
module.exports = function(grunt) {
	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
	grunt.loadTasks("tasks");
	var webpack = require("webpack");
	function buildTutorial(p, callback) {
		p = path.resolve(p);
		try {
			var config = require(p + "/webpack.config.js");
		} catch(e) { return callback(null, "") }
		config.context = p;
		webpack(config, function(err, stats) {
			if(err) throw err;
			grunt.log.writeln("webpack executed from " + path.basename(p));
			grunt.log.writeln(stats.toString({
				context: path.join(__dirname, "dist"),
				chunks: false,
				modules: true,
				hash: false,
				assets: true,
				colors: true
			}));
			callback(null, "<pre><code>" + stats.toString({
				context: path.join(__dirname, "dist"),
				hash: false
			}) + "</code></pre>");
		});
	}
	var tutorials = {
		"dist/tutorials/getting-started": ["layouts/tutorial.html", "tutorials/getting-started"],
		"dist/tutorials/migrate-to-webpack": ["layouts/tutorial.html", "tutorials/migrate-to-webpack"]
	};
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
					"dist/404.html": "layouts/404.html",
					"dist/[title].html": "layouts/doc.html"
				},
			},
			production: {
				files: {
					"dist/index.html": "layouts/landing.html",
					"dist/404.html": "layouts/404.html",
					"dist/[title].html": "layouts/doc.html"
				},
				options: {
					minify: true
				}
			}
		},
		statictutorial: {
			options: {
				command: buildTutorial
			},
			development: {
				files: tutorials
			},
			production: {
				files: tutorials,
				options: {
					minify: true
				}
			}
		},
		"webpack-dev-server": {
			development: {
				contentBase: "dist",
				port: 8088, // http://localhost:8088/webpack-dev-server/webpack-getting-started.html
				webpack: merge(require("./webpack.config.js"), {
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
			wiki: {
				files: ["layouts/**/*.html", "lib/**/*.js"],
				tasks: ["staticwiki:development"],
			},
			tutorial: {
				files: ["layouts/**/*.html", "tutorials/**/*"],
				tasks: ["statictutorial:development"],
			},
		},
	});
	grunt.registerTask("development", ["staticwiki:development", "statictutorial:development", "webpack-dev-server:development", "watch"]);
	grunt.registerTask("production", ["webpack:production", "staticwiki:production", "statictutorial:production"]);
	grunt.registerTask("deploy", ["clean", "production", "gh-pages"]);
	grunt.registerTask("tutorial-development", ["statictutorial:development", "webpack-dev-server:development", "watch:tutorial"]);
	grunt.registerTask("wiki-development", ["staticwiki:development", "webpack-dev-server:development", "watch:wiki"]);

	grunt.registerTask("dev", ["development"]);
	grunt.registerTask("tutdev", ["tutorial-development"]);
	grunt.registerTask("wikidev", ["wiki-development"]);
	grunt.registerTask("default", ["production"]);
};

function merge(a, b) {
	var o = {};
	for(var key in a) {
		o[key] = a[key];
	}
	for(var key in b) {
		o[key] = b[key];
	}
	return o;
}