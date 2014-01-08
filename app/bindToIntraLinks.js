var linkToTitle = require("../lib/linkToTitle");

var LRU = require("lru-cache");

function bindIntraLinks() {
	document.body.addEventListener("click", function(event) {
		if(event.target.tagName === "A" && /^([a-z0-9\-\.]+)\.html$/i.test(event.target.getAttribute("href"))) {
			var href = event.target.getAttribute("href");
			var wiki = /^([a-z0-9\-\.]+)\.html$/i.exec(href)[1];
			document.title = linkToTitle(wiki);
			history.pushState(null, null, href);
			loadPage(wiki, false);
			event.preventDefault();
		}
	}, false);
}

var contentElement = document.getElementById("wiki");
var titleElement = document.getElementById("wikititle");
var editElement = document.getElementById("wikieditlink");

var pagesCache = LRU({
	max: 10,
	maxAge: 5 * 60 * 1000 // 5m
});
var currentPage = "";

window.addEventListener("popstate", function() {
	loadCurrentPage(false);
});

loadCurrentPage(true);

function loadCurrentPage(initial) {
	var match = /\/([a-z0-9\-]+)\.html$/i.exec(location.pathname);
	if(match) {
		var wiki = match[1];
		if(wiki !== currentPage || initial) {
			currentPage = wiki;
			loadPage(wiki, initial);
		}
	}
}

function reportAnalytics() {
	var ga = require("./googleAnalytics");
	var location = window.location.protocol +
		'//' + window.location.hostname +
		window.location.pathname +
		window.location.search;
	ga('set', 'location', location);
	ga('set', 'title', document.title);
	ga('send', 'pageview');
}

var EDIT_LINK = "https://github.com/webpack/docs/wiki/XXX/_edit";

function loadPage(wiki, initial) {
	var cacheEntry = pagesCache.get(wiki);
	if(cacheEntry) {
		editElement.setAttribute("href", EDIT_LINK.replace(/XXX/g, wiki));
		titleElement.innerHTML = linkToTitle(wiki);
		contentElement.innerHTML = cacheEntry;
		if(!initial) reportAnalytics();
		return;
	}

	if(document.body.classList) document.body.classList.add("loading");

	var request = new XMLHttpRequest();
	request.open("GET", "http://github-wiki.herokuapp.com/webpack/docs/" + wiki, true);
	request.onreadystatechange = function() {
		if(request.readyState === 4) {
			if(request.status !== 200) {
				if(initial) {
					if(document.body.classList) document.body.classList.remove("loading");
					return;
				}
				next(request.status + " " + request.statusText);
			} else {
				require(["../lib/renderMarkdown"], function(renderMarkdown) {
					next(renderMarkdown(request.responseText));
				});
			}
			function next(result) {
				pagesCache.set(wiki, result);
				if(document.body.classList) document.body.classList.remove("loading");
				editElement.setAttribute("href", EDIT_LINK.replace(/XXX/g, wiki));
				titleElement.innerHTML = linkToTitle(wiki);
				contentElement.innerHTML = result;
				window.scrollTo(0, 0);
				if(!initial) reportAnalytics();
				if(initial) bindIntraLinks();
			}
		}
	};
	request.send(null);
	require(["../lib/renderMarkdown"]); // Start loading in parallel
}