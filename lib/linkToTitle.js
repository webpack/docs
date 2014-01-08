module.exports = function linkToTitle(link) {
	if(!link) return link;
	return link.toLowerCase().replace(/[^a-z0-9\.]/g, " ");
}
