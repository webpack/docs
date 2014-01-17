module.exports = function downloadWiki(wiki, callback) {
	var request = new XMLHttpRequest();
	request.open("GET", "http://github-wiki.herokuapp.com/webpack/docs/" + wiki, true);
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