module.exports = function(grunt) {
	require("matchdep").filterAll("grunt-*").forEach(grunt.loadNpmTasks);
	grunt.loadTasks("tasks");
	var webpack = require("webpack");
	grunt.initConfig({
		webpack: {
			options: require("./webpack.config.js"),
			development: {
				devtool: "eval",
				plugins: [
				]
			},
			production: {
				plugins: [
					new webpack.optimize.OccurenceOrderPlugin(),
					new webpack.optimize.UglifyJsPlugin()
				]
			}
		},
		staticwiki: {
			development: {
				files: {
					"index.html": "layouts/landing.html",
					"[title].html": "layouts/doc.html"
				},
			},
			production: {
				files: {
					"index.html": "layouts/landing.html",
					"[title].html": "layouts/doc.html"
				},
				options: {
					minify: true
				}
			}
		},
		connect: {
			development: {
				options: {
					port: 8088
				}
			}
		},
		"gh-pages": {
			options: {
				message: "Publish"
			},
			src: ["js/**", "*.html", "font/**"]
		},
		clean: ["js/**", , "*.html", "font/**"],
		watch: {
			lr: {
				options: { livereload: true },
				files: ["js/**/*", "*.html"],
			},
			app: {
				files: ["app/**/*.{js,less,css,styl}", "lib/**/*.js"],
				tasks: ["webpack:development"],
			},
			html: {
				files: ["layouts/**/*.html", "lib/**/*.js"],
				tasks: ["staticwiki:development"],
			},
		},
	});
	grunt.registerTask("development", ["webpack:development", "staticwiki:development", "connect", "watch"]);
	grunt.registerTask("production", ["webpack:production", "staticwiki:production"]);
	grunt.registerTask("deploy", ["webpack:production", "staticwiki:production", "gh-pages"]);
	grunt.registerTask("dev", ["development"]);
	grunt.registerTask("default", ["production"]);
};