var renderMarkdown = require("../lib/renderMarkdown");
var titleToLink = require("../lib/titleToLink");
var linkToTitle = require("../lib/linkToTitle");
var extractRegExpFromText = require("../lib/extractRegExpFromText");
var htmlMinifier = require("html-minifier");
var https = require("https");
var http = require("http");
var path = require("path");
var async = require("async");
module.exports = function(grunt) {
	grunt.registerMultiTask("staticwiki", "Generate HTML files from layouts and wiki pages", function() {
		var done = this.async();

		async.forEach(this.files, function(file, callback) {
			var dest = file.dest;
			var src = file.src[0];
			grunt.log.writeln("Generating " + dest + " from " + src + "...");

			var layout = grunt.file.read(src);
			var hasRefs;
			do {
				hasRefs = false;
				layout = layout.replace(/\{\{\s*include\s+([a-z0-9 \-_]+)\s*\}\}/gi, function(token) {
					hasRefs = true;
					var match = /\{\{\s*include\s+([a-z0-9 \-_]+)\s*\}\}/gi.exec(token);
					return grunt.file.read(path.join(path.dirname(src), match[1] + ".html"));
				});
			} while(hasRefs);

			var refs = extraRefsFromLayout(layout);
			var recusiveMode = (refs.indexOf(undefined) >= 0);
			var minify = this.options().minify;

			var wikis = {};
			async.forEach(refs.filter(Boolean), function(wikiPath, callback) {
				downloadWikiContent(wikiPath, function(err, md) {
					if(err) return callback(err);
					var html = renderMarkdown(md, true);
					wikis["$"+wikiPath] = html;
					callback();
				});
			}, function(err) {
				if(err) return callback(err);
				if(!recusiveMode) {
					writeLayout();
					return callback();
				}

				var doneWikis = {};

				var queue = async.queue(function(wikiPath, callback) {
					if(doneWikis["$"+wikiPath]) return callback(); // Already loaded
					doneWikis["$"+wikiPath] = true;
					downloadWikiContent(wikiPath, function(err, md) {
						if(err) {
							grunt.log.error(wikiPath + ": " + err.message);
							return callback();
						}
						var title = /^#[^#]/.test(md) ? /^#\s*(.+)/.exec(md)[1] : null;
						var html = renderMarkdown(md);
						writeLayout(wikiPath, title, html);
						queue.push(extractIntraLinksFromMarkdown(md), function() {});
						callback();
					});
				}, 6);

				queue.drain = function() {
					grunt.log.ok("All found wikis processed.");
					callback();
				};

				queue.push(refs.filter(Boolean), function() {});
			}.bind(this));

			function writeLayout(link, title, wikiHtml) {
				var file = dest.replace(/\[title\]/gi, link);
				grunt.log.ok("Writing " + file + "...");
				var html = layout
					.replace(/\{\{\s*title\s*\}\}/gi, title || linkToTitle(link))
					.replace(/\{\{\s*url\s*\}\}/gi, link)
					.replace(/\{\{\s*wiki(?:\s+([a-z0-9 \-_]+))?\s*\}\}/gi, function(fragment) {
						var match = /\{\{\s*wiki(?:\s+([a-z0-9 \-_]+))?\s*\}\}/gi.exec(fragment);
						var wikiPath = titleToLink(match[1]);
						if(!wikiPath) return wikiHtml;
						return wikis["$"+wikiPath];
					}
				);
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
				grunt.file.write(file, html);
			}

		}.bind(this), done);
	});

	function extraRefsFromLayout(layout) {
		return extractRegExpFromText(layout, /\{\{\s*wiki(?:\s+([a-z0-9 \-_\.]+))?\s*\}\}/gi, titleToLink);
	}

	function extractIntraLinksFromMarkdown(md) {
		return extractRegExpFromText(md, /\[\[(?:[^\]\|]+\|\s*)?([a-z0-9 \-_\.]+)\]\]/gi, titleToLink);
	}

	function downloadWikiContent(wikiPath, callback) {
		https.get("https://raw.github.com/wiki/webpack/docs/" + wikiPath + ".md", function(res) {
			grunt.log.writeln("[" + res.statusCode + "] wiki page " + wikiPath);
			if(res.statusCode !== 200) {
				res.resume();
				callback(new Error("Github statuscode: " + res.statusCode));
				callback = function(){};
				return;
			}
			var bufs = [];
			res.on("data", function(buf) {
				bufs.push(buf);
			});
			res.on("end", function() {
				process.nextTick(function() {
					callback(null, Buffer.concat(bufs).toString("utf-8"));
					callback = function(){};
				});
			});
		}).on("error", function(err) {
			grunt.log.writeln("[ERR] wiki page " + wikiPath);
			callback(err);
			callback = function(){};
		}).on("timeout", function() {
			grunt.log.writeln("[TIM] wiki page " + wikiPath);
			callback(new Error("Github request timeout"));
			callback = function(){};
		});
	}
};
