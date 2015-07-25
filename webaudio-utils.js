// Check for audio context
if (! window.AudioContext) {
	if (! window.webkitAudioContext) 
		alert('no audiocontext found');
	window.AudioContext = window.webkitAudioContext;
}

var context = new AudioContext();

function createAnalyzer(smoothingTimeConstant, fftSize) {
	var analyser = context.createAnalyser();
	analyser.smoothingTimeConstant = smoothingTimeConstant;
	analyser.fftSize = fftSize;
	analyser.maxDecibels=-10;
	return analyser;
}

function loadSound(url, callback) {
	var request = new XMLHttpRequest();
	request.open('GET', url, true);
	request.responseType = 'arraybuffer';

	request.onload = function() {
		context.decodeAudioData(request.response, function(buffer) {
			playSound(buffer);
			callback();
		}, onError);
	}
	request.send();
}

function playSound(buffer) {
	sourceNode.buffer = buffer;
	sourceNode.start(0);
}

function resetMusic(url) {
	sourceNode.stop(0);
	sourceNode.start(0);
	//loadSound(url);
}

function onError(e) {
	//console.log(e);
	var label = document.getElementById("labelClick");
	label.innerHTML = "Initialization error: " + " Error loading audio.";
}

function getAverageVolumeFromFrecuency(analyser) {
	var array = new Uint8Array(analyser.frequencyBinCount);
	analyser.getByteFrequencyData(array);
	return getAverageVolume(array);
}

function getAverageVolume(array) {
	var values = 0, length = array.length;
	for (var i = 0; i < length; i++)
		values += array[i];
	return values / length;
}

function getPunchy() {
	var minAudioValue = 10, maxAudioValue = 100;
	var value = Math.max(0, audioVariableAmplitude - minAudioValue) / maxAudioValue;
	return value * 8.0;
}

// globals
var volume;
  
function gotStream(stream) {
    var inputPoint = audioContext.createGain();
    var audioInput = context.createMediaStreamSource(stream);
	audioInput.connect(inputPoint);
	analyser.connect(inputPoint); 	
}

/*
function gotStream(stream) {
    inputPoint = audioContext.createGain();

    // Create an AudioNode from the stream.
    realAudioInput = audioContext.createMediaStreamSource(stream);
    audioInput = realAudioInput;
    audioInput.connect(inputPoint);

//    audioInput = convertToMono( input );

    analyserNode = audioContext.createAnalyser();
    analyserNode.fftSize = 2048;
    inputPoint.connect( analyserNode );

    audioRecorder = new Recorder( inputPoint );

    zeroGain = audioContext.createGain();
    zeroGain.gain.value = 0.0;
    inputPoint.connect( zeroGain );
    zeroGain.connect( audioContext.destination );
    updateAnalysers();
}*/

function errorGotStream(e) {
	console.log(e);
}
// one-off initialization
//navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;
//navigator.getUserMedia( {video:false, audio:true}, gotStream, errorGotStream);
