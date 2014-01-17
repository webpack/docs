require "./styles.less"
$ = require("jquery")
exports.render = (model) ->
  $("#user-agent").text model
