window.disqus_shortname = "webpack";

var dsq = document.createElement("script");
dsq.type = "text/javascript";
dsq.async = true;
dsq.src = "//" + window.disqus_shortname + ".disqus.com/embed.js";
(document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);

exports.update = function updatePage(identifier) {
	if(typeof DISQUS === "undefined") {
		setTimeout(function() {
			updatePage(identifier);
		}, 1000);
		return;
	}
	DISQUS.reset({
		reload: true,
		config: function() {
			this.page.identifier = identifier;
			this.page.url = location + "";
			this.page.title = document.title;
		}
	});
};
