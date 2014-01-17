module.exports = function extractRegExpFromText(text, regExp, postprocessFn) {
	var array = [];

	var match;
	while(match = regExp.exec(text)) {
		var link = postprocessFn(match[1]);
		if(array.indexOf(link) < 0)
			array.push(link);
	}

	return array;
}
