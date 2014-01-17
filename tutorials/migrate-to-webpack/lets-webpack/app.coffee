$ ->
	# Model:
	userAgent = window.navigator.userAgent

	# View:
	view =
		render: (ua) ->
			$("#user-agent").text ua

	# Controller (render the model):
	view.render userAgent
