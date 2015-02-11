window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();


var scriptProcessor = audioContext.createScriptProcessor(256, 1, 1);
scriptProcessor.onprocess = function(evt){
	console.log("onprocess");
}
scriptProcessor.connect(audioContext.destination)
