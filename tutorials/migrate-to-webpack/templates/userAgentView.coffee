require "./styles.less"
$ = require("jquery")
template = require "./userAgentView.jade"
exports.render = (model) ->
  $("body").html template
    model: model
