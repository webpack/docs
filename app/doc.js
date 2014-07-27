require("./css/doc.styl");
require("./googleAnalytics");

require("./onContentLoaded")(function(event) {
	require("./bindToIntraLinks");
});
