var extractRegExpFromText = require("../lib/extractRegExpFromText");
var Searcher = require("../lib/fuse.js/Searcher");

function FullTextSearcher(searchString) {
	this.fuseSearchers = this.tokenize(searchString).map(function(item) {
		return new Searcher(item, {
			distance: item.length * 10,
			threshold: 0.8
		});
	});
}

module.exports = FullTextSearcher;

FullTextSearcher.prototype.scanDocument = function(title, md) {
	title = this.tokenize(title);
	md = this.tokenize(md);
	var scores = this.fuseSearchers.map(function() { return 0 });
	scoreItems(title, this.fuseSearchers);
	scores = scores.map(function(s) { return s*10; });
	scoreItems(md, this.fuseSearchers);
	return {
		score: scores.reduce(function(a, b) { return a + b; }, 0) *
			scores.map(function(s) { return s; }, this).reduce(function(a, b) { return Math.min(a, b); }),
		scores: scores
	};

	function scoreItems(items, fuseSearchers) {
		items.forEach(function(item) {
			fuseSearchers.forEach(function(searcher, idx) {
				var result = searcher.search(item);
				if(result.isMatch) {
					scores[idx] += (1 - result.score) / items.length;
				}
			});
		});
	}
}

FullTextSearcher.prototype.tokenize = function(str) {
	return extractRegExpFromText(str, /([\w\d\-\_\.]+)/gi, function(s) { return s; });
};