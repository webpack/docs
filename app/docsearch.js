require("./onContentLoaded")(function(event) {
  var search = docsearch({
    inputSelector: '#docsearch',
    apiKey: '93950c6eda05068a6f0649e4a7f7546e',
    indexName: 'webpack',
    debug: false,
    enhancedSearchInput: true
  });
})
