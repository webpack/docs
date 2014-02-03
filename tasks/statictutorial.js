var renderMarkdown = require("../lib/renderMarkdown");
var htmlMinifier = require("html-minifier");
var path = require("path");
var async = require("async");
var fs = require("fs");
var diff = require("../lib/diff.js/diff");
var hljs = require("../lib/highlight.js");
module.exports = function(grunt) {
	grunt.registerMultiTask("statictutorial", "Generate HTML files from layout and folders", function() {
		var done = this.async();
		
		var command = this.options().command || function(path, callback) {
			return callback(null, "");
		};
		var minify = this.options("minify");

		async.forEach(this.files, function(file, callback) {
			var dest = file.dest;
			if(file.src.length !== 2) throw new Error("[statictutorial] Pass two arguments as source: layout, content folder");
			var src = file.src[0];
			var folder = file.src[1];
			grunt.log.writeln("Generating " + dest + " from " + src + "...");

			var layout = grunt.file.read(src);
			layout = layout.replace(/\{\{\s*include\s+([a-z0-9 \-_]+)\s*\}\}/gi, function(token) {
				hasRefs = true;
				var match = /\{\{\s*include\s+([a-z0-9 \-_]+)\s*\}\}/gi.exec(token);
				return grunt.file.read(path.join(path.dirname(src), match[1] + ".html"));
			})
			var steps = grunt.file.expand({ cwd: folder }, ["*"]);
			steps = steps.filter(function(x) {
				return /^[0-9\.]+ /.test(x);
			}).map(function(x) {
				return {
					path: x,
					url: x.replace(/^[0-9\.]+ /, ""),
					pos: /^([0-9\.]+) /.exec(x)[1].split(".").map(Number)
				};
			}).sort(function(a, b) {
				for(var i = 0; i < a.pos.length && i < b.pos.length; i++) {
					if(a.pos[i] < b.pos[i]) return -1;
					if(a.pos[i] > b.pos[i]) return 1;
				}
				if(a.pos.length < b.pos.length) return -1;
				if(a.pos.length > b.pos.length) return 1;
				throw new Error("[statictutorial] conflicting position on " + a.path + " and " + b.path);
			});
			var byUrl = {};
			steps.forEach(function(step) {
				if(byUrl["$" + step.url]) throw new Error("[statictutorial] conflicting url on " + byUrl["$" + step.url].path + " and " + step.path);
				byUrl["$" + step.url] = step;
			});
			for(var i = 0; i < steps.length; i++) {
				var step = steps[i];
				var fullPath = step.fullPath = path.join(folder, step.path);
				var url = step.url;
				var content = grunt.file.read(path.join(fullPath, "README.md"));
				var ignoredFiles = step.ignoredFiles = grunt.file.exists(path.join(fullPath, ".tutorialignore")) ?
					grunt.file.read(path.join(fullPath, ".tutorialignore")).split(/[\r\n]/).filter(Boolean) :
					[];
				step.files = [];
				grunt.file.recurse(fullPath, function(abspath, rootdir, subdir, filename) {
					var name = subdir ? subdir + "/" + filename : filename;
					name = name.replace(/\\/g, "/");
					if(name[0] !== "." && filename[0] !== "." && (["README.md"].indexOf(name) < 0) && (ignoredFiles.indexOf(name) < 0))
						step.files.push(name);
				});

				var title = /#\s+(.+)/.exec(content);
				step.title = title && title[1] || url;

				step.content = renderMarkdown(content, true);
			}
			var currentFiles = {};
			async.timesSeries(steps.length, function(i, callback) {
				var step = steps[i];
				var fullPath = step.fullPath;
				var url = step.url;
				var destPath = path.join(dest, url);

				var fileUpdates = {};
				step.files.forEach(function(filename) {
					var oldFile = currentFiles[filename];
					currentFiles[filename] = grunt.file.read(path.join(fullPath, filename));
					if(!oldFile) {
						fileUpdates[filename] = {
							type: "added",
							content: currentFiles[filename],
						}
					} else if(oldFile !== currentFiles[filename]) {
						fileUpdates[filename] = {
							type: "updated",
							oldContent: oldFile,
							newContent: currentFiles[filename],
						}
					}
				});
				step.ignoredFiles.forEach(function(filename) {
					var oldFile = currentFiles[filename];
					delete currentFiles[filename];
					if(oldFile) {
						fileUpdates[filename] = {
							type: "removed",
							content: oldFile
						};
					}
				});
				grunt.log.writeln("Files:");
				Object.keys(currentFiles).forEach(function(filename) {
					grunt.log.writeln("* " + url + "/" + filename);
					grunt.file.write(path.join(destPath, filename), currentFiles[filename]);
				});
				grunt.file.recurse(fullPath, function(abspath, rootdir, subdir, filename) {
					var name = subdir ? subdir + "/" + filename : filename;
					if(name[0] !== "." && filename[0] !== ".") {
						if(Object.prototype.hasOwnProperty.call(currentFiles, name)) return;
						grunt.log.writeln("* " + url + "/" + name);
						grunt.file.copy(path.join(fullPath, name), path.join(destPath, name));
					}
				});
				grunt.log.writeln("Executing command for " + url + "...");
				command(destPath, function(err, output) {
					grunt.log.writeln("Generating file for " + url + "...");
					step.html = step.content.replace(/\<p\>\$\$\$\s+([^\<]+)\<\/p\>/g, function(match, cmd) {
						if(cmd === "files") {
							return Object.keys(fileUpdates).sort(function(a, b) {
								var aa = fileUpdates[a];
								var bb = fileUpdates[b];
								if(aa.type < bb.type) return -1;
								if(aa.type > bb.type) return 1;
								if(a < b) return -1;
								if(a > b) return 1;
								return 0;
							}).map(function(filename) {
								var data = fileUpdates[filename];
								switch(data.type) {
								case "added":
									return '<div class="panel panel-success"><div class="panel-heading"><h3 class="panel-title">' +
										"add <code>" + filename + "</code>" +
										'</h3></div><div class="panel-body">' + 
										renderMarkdown("```\n" + data.content.trim() + "\n```") +
										'</div></div>';
								case "removed": 
									return '<div class="alert alert-danger">' +
										"remove <code>" + filename + "</code>" +
										'</div>'
								case "updated":
									return '<div class="panel panel-info"><div class="panel-heading"><h3 class="panel-title">' +
										"update <code>" + filename + "</code>" +
										'</h3></div><div class="panel-body">' + 
										diffFiles(data.oldContent, data.newContent) +
										'</div></div>';
								}
							}).join("\n\n");
						} else if(cmd === "output") {
							return output;
						} else {
							// Display a file in a iframe
							if(!Object.prototype.hasOwnProperty.call(currentFiles, cmd))
								grunt.file.copy(path.join(fullPath, cmd), path.join(dest, url, cmd));
							return "<iframe class=\"tutorial-iframe\" seamless src=\"" + folder + "/" + url + "/" + cmd + "\"></iframe>";
						}
					});
					callback();
				});
			}, function(err) {
				if(err) return callback(err);
				
				var sidebar = "<ul>" + steps.map(function(sstep, idx) {
					return "<li><a href=\"" + folder + "/#" + sstep.url + "\">" + (idx+1) + ". " +
						sstep.title + "</a></li>";
				}).join("\n") + "</ul>";
				
				var content = steps.map(function(sstep) {
					return "<a id=\"" + sstep.url + "\" class=\"anchor\"></a>" + sstep.html;
				}).join("<hr />");

				var html = layout
					.replace(/\{\{title\}\}/gi, folder)
					.replace(/\{\{sidebar\}\}/gi, sidebar)
					.replace(/\{\{content\}\}/gi, content);

				if(minify) html = htmlMinifier.minify(html, {
					removeComment: true,
					collapseWhitespace: true,
					collapseBooleanAttributes: true,
					removeAttributeQuotes: true,
					removeRedundantAttributes: true,
					useShortDoctype: true,
					removeEmptyAttributes: true,
					removeOptionalTags: true
				});
				grunt.log.writeln("Writing file...");
				grunt.file.write(path.join(dest, "index.html"), html);
				callback();
			});
		}.bind(this), done);
	});
};

function diffFiles(oldContent, newContent) {
	var language = hljs.highlightAuto(newContent).language;
	var d = "<pre><code>" + diff(oldContent.split("\n"), newContent.split("\n")).map(function(action) {
		var code = (language ? hljs.highlight(language, action.atom).value : action.atom)
		switch(action.operation) {
		case "none": return "<div>  " + code + "</div>";
		case "add": return '<div class="addition">+ ' + code + "</div>";
		case "delete": return '<div class="deletion">- ' + code + "</div>";
		}
	}).join("") + "</code></pre>";
	return d;
}