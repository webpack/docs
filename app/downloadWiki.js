module.exports = function downloadWiki(wiki, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", "https://github.com/XUEJS/webpack-docs/wiki" + wiki, true);
	// request.open("GET", "//github-wiki.herokuapp.com/webpack/docs/" + wiki, true);
	request.onreadystatechange = function() {
		if(request.readyState === 4) {
			if(request.status !== 200) {
				return callback(new Error("Statuscode is " + request.status));
			} else {
				return callback(null, request.responseText);
			}
		}
	};
	request.send(null);
};
