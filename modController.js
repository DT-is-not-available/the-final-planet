global.tfe2 = window
ModTools.onLoadStart(function(city) {
	global.tfe2.game = city.game
})
require(decodeURI(document.currentScript.src.replace("modController.js", "dontAutoLoad/main.js").replace("file:///", "")))