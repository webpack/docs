var linkToTitle = require("../lib/linkToTitle");
var downloadWiki = require("./downloadWiki");

var LRU = require("lru-cache");

var INTRA_LINK = /^([a-z0-9\-\.]+)\.html$/i;

function bindIntraLinks() {
	document.body.addEventListener("click", function(event) {
		if(event.target.tagName === "A" && INTRA_LINK.test(event.target.getAttribute("href"))) {
			var href = event.target.getAttribute("href");
			INTRA_LINK.lastIndex = 0;
			var wiki = INTRA_LINK.exec(href)[1];
			document.title = linkToTitle(wiki);
			currentPage = wiki;
			history.pushState(null, null, href);
			loadPage(wiki, false);
			event.preventDefault();
		}
	}, false);
}

function highlightIntraLinks() {
	if(document.querySelectorAll) {
		var elements = document.querySelectorAll('a[href$=".html"]');
		for(var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var href = element.getAttribute("href");
			if(element.classList && INTRA_LINK.test(href)) {
				INTRA_LINK.lastIndex = 0;
				var wiki = INTRA_LINK.exec(href)[1];
				if((currentPage === wiki) ^ (element.classList.contains("active"))) {
					element.classList.toggle("active");
				}
			}
		}
	}
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

highlightIntraLinks();
loadCurrentPage(true);

function loadCurrentPage(initial) {
	var match = /\/([a-z0-9\-\.]+)\.html$/i.exec(location.pathname);
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

function updateDisqus() {
	var disqus = require("./disqus");
	disqus.update(currentPage);
}

var EDIT_LINK = "https://github.com/webpack/docs/wiki/XXX/_edit";

function loadPage(wiki, initial) {
	var cacheEntry = pagesCache.get(wiki);
	if(cacheEntry) {
		editElement.setAttribute("href", EDIT_LINK.replace(/XXX/g, wiki));
		titleElement.innerHTML = linkToTitle(wiki);
		contentElement.innerHTML = cacheEntry;
		if(!initial) {
			if(!window.location.hash) window.scrollTo(0, 0);
			reportAnalytics();
			updateDisqus();
		}
		highlightIntraLinks();
		return;
	}

	if(!initial && document.body.classList) document.body.classList.add("loading");

	downloadWiki(wiki, function(err, result) {
		if(err) {
			if(initial) {
				if(document.body.classList) document.body.classList.remove("loading");
				return;
			}
			window.location.reload();
		} else {
			require(["../lib/renderMarkdown"], function(renderMarkdown) {
				next(renderMarkdown(result));
			});
		}
		function next(result) {
			pagesCache.set(wiki, result);
			if(document.body.classList) document.body.classList.remove("loading");
			editElement.setAttribute("href", EDIT_LINK.replace(/XXX/g, wiki));
			titleElement.innerHTML = linkToTitle(wiki);
			contentElement.innerHTML = result;
			if(!initial) {
				if(!window.location.hash) window.scrollTo(0, 0);
				reportAnalytics();
				updateDisqus();
			}
			if(initial) bindIntraLinks();
			highlightIntraLinks();
		}
	});
	require(["../lib/renderMarkdown"]); // Start loading in parallel
}
