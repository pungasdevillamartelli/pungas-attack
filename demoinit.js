		var context, intro, gl, full=false, loaded=false;
		var sourceNode, javascriptNode;
		var audioVariableAmplitude;

		
		function setupAudioNodes() {
			javascriptNode = context.createScriptProcessor(4096, 1, 1);
			javascriptNode.connect(context.destination);
			analyser = createAnalyzer(0.0, 2048);
			analyser2 = createAnalyzer(0.0, 2048);			
			sourceNode = context.createBufferSource();
			splitter = context.createChannelSplitter();
			sourceNode.connect(splitter);
			splitter.connect(analyser, 0, 0);
			splitter.connect(analyser2, 1, 0);
			analyser.connect(javascriptNode);
			sourceNode.connect(context.destination);
			
			javascriptNode.onaudioprocess = function() {
				getAverageAmplitude();
			}
		} 
		
		function loadSoundFromUrl(callback) {
			loadSound("luz.mp3", callback);
		}
		
		function getAverageAmplitude() { 
			var array =  new Uint8Array(analyser.frequencyBinCount);
			analyser.getByteFrequencyData(array);
			var average = getAverageVolume(array);
			audioVariableAmplitude = average;
		}
		
		function toggleFullscreen() {
			if (!loaded) {
				return;
			}
			
			if (full == true) {
				takeOutFull();
				full = false;
			}
			else {
				makeFullscreen();
				full = true;
			}
		}

		function takeOutFull() {
			if (document.exitFullscreen) {			  document.exitFullscreen();		} 
			else if (document.msExitFullscreen) {	  document.msExitFullscreen();		} 
			else if (document.mozCancelFullScreen) {  document.mozCancelFullScreen();	} 
			else if (document.webkitExitFullscreen) { document.webkitExitFullscreen();	}
			
			// #TODO: Attach to back to normal screen event
			setCanvasWithoutFullscreen();
		} 
		
		function setCanvasWithoutFullscreen() {
			var canvas = document.getElementById("glCanvas"), style = canvas.style;
			style.width = Math.floor(window.screen.availWidth / 2);
			style.height = Math.floor(window.screen.availHeight / 2);
		}
		
		function makeFullscreen() {
			var canvas = document.getElementById("glCanvas"), style = canvas.style;
			canvas.width = window.screen.availWidth;
			canvas.height = window.screen.availHeight;
			style.width = window.screen.availWidth + "px";
			style.height = window.screen.availHeight + "px"; 
			
			if (canvas.requestFullscreen) {				canvas.requestFullscreen();			}
			else if (canvas.msRequestFullscreen) {		canvas.msRequestFullscreen();		}
			else if (canvas.mozRequestFullScreen) {		canvas.mozRequestFullScreen();		}
			else if (canvas.webkitRequestFullscreen) {	canvas.webkitRequestFullscreen();	}
		}

		function startupDraw () {
			var label = document.getElementById("labelClick");
			
			try {
				var canvas = document.getElementById("glCanvas");
				var gl = initGL(canvas);
				intro = new Intro();
				resetTimer();	
				intro.initialize(gl, "textureCanvas");
				setupAudioNodes();
			}
			catch(err) {
				label.innerHTML = "Initialization error: " + err.message;
				return;
			}
			
			loadSoundFromUrl(
				function () {
					loaded = true;
					label.innerHTML = "Click canvas for fullscreen";
					setCanvasWithoutFullscreen();
					resetTimer();	
					requestFrame(intro, gl);				
				}
			);
		}
		
		function requestFrame(intro, gl) {
			intro.render(gl);
			last = performance.now();
			window.requestAnimationFrame(function () { 
				requestFrame(intro, gl); 
				});
		}

		function initGL(canvas) {
			try {
				var gl = canvas.getContext("experimental-webgl", { alpha: true, depth: true });
				var canvas = document.getElementById("glCanvas"), style = canvas.style;
				style.width = window.screen.availWidth;
				style.height = window.screen.availHeight;
				return gl;
			}
			catch (e) {
				console.log("Error in WebGL initialization.");
			}
			if (!gl) {
				alert("Could not initialize WebGL");
				return null;
			}
		}
	
		document.addEventListener("DOMContentLoaded", function(event) { 
			makeFullscreen();
		}); 