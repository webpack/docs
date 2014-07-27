require("./css/404.styl");
require("./googleAnalytics");

require("./onContentLoaded")(function(event) {
	var titleToLink = require("../lib/titleToLink");
	var linkToTitle = require("../lib/linkToTitle");

	var titleElement = document.getElementById("title");
	var resultsElement = document.getElementById("results");
	
	var pathname = location.pathname.substr(1);
	if(/404(\.html)?$/.test(pathname))
		pathname = location.search.substr(2);
	var searchString = linkToTitle(pathname.replace(/\.html$/i, "")).trim();
	document.title = titleElement.textContent = "Search '" + searchString + "'";
	
	require(["../lib/extractRegExpFromText", "./downloadWiki", "./FullTextSearcher"], function(extractRegExpFromText, downloadWiki, FullTextSearcher) {
		var searcher = new FullTextSearcher(searchString);
		
		var processedWikis = {};
		var matches = [];
		processWiki("contents");

		function processWiki(name) {
			if(processedWikis["$"+name]) return;
			processedWikis["$"+name] = true;
			downloadWiki(name, function(err, md) {
				if(err) return;
				console.log("Searching in " + name);
				var links = extractRegExpFromText(md, /\[\[(?:[^\]\|]+\|\s*)?([a-z0-9 \-_\.]+)\]\]/gi, titleToLink);
				links.forEach(processWiki);
				if(name === "contents") return;
				var result = searcher.scanDocument(linkToTitle(name), md);
				var score = result.score;
				if(score > 0) {
					var element = document.createElement("li");
					var linkElement = document.createElement("a");
					linkElement.setAttribute("href", name + ".html");
					linkElement.textContent = linkToTitle(name);
					element.appendChild(linkElement);
					for(var i = 0; i < matches.length; i++) {
						if(matches[i].score < score) {
							resultsElement.insertBefore(element, matches[i].element);
							matches.splice(i, 0, { score: score, element: element });
							return;
						}
					}
					resultsElement.appendChild(element);
					matches.push({ score: score, element: element });
				}
			});
		}
	});
});
