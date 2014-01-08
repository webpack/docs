module.exports = function titleToLink(title) {
	if(!title) return title;
	return title.replace(/[ _]/g, "-").toLowerCase();
}
