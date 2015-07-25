// Scene
function Scene (objects) {
	this.objects = objects;
}

Scene.prototype.render = function (context) {
	for (var object in this.objects) {
		this.objects[object].render(context);
	}
	
	this.keepDelta(context);
}

//var fpsObject, last, frames=0, framesDelta=20, delta = 1 / 60.0, frameCounter=0;
var last, delta = 1 / 60.0;


// #DEBUG function purpose only
Scene.prototype.keepDelta = function (gl) {
	var now = performance.now();
	if (last != undefined) {
		delta = now - last;
	}
	
	last = now;
} 

/*		
// #DEBUG function purpose only
Scene.prototype.renderFps = function (gl) {
	if (this.fpsObject == undefined) {
		var effectX = "0.0";
		var effectY = "0.0";	
		var fontTexture = "CREATEVECTOR(0.0, 0.0, 0.0)";
		var fontBorderTexture = "CREATEVECTOR(0.0, 0.0, 0.8)";
		var fontStyle = new FontStyle("Verdana", 128);
		
		fontStyle.initialize(gl, "textureCanvas");
	
		this.fpsObject = new TextObject(fontStyle, "", effectX, effectY, fontTexture, fontBorderTexture, 
							 [ ], new AnimationProperties(14.0, 19.0, 20.0, 20.0),
							 "textureCanvas", gl);
		this.fpsObject.transparencyValue = 1.0;
	}

	frames++;
	frameCounter++;
	if (frames >= framesDelta) {
		var now = performance.now();
		if (last != undefined) {
		delta = now - last;
		}
		
		last = now;
		frames = 0;
		this.fpsObject.text = 1000.0 / delta + " fps";
	}
	
	this.fpsObject.render(gl);
} */

// Texto (templates de escenas
function LogoCommentScene(logo, comment, background) {
	LogoCommentScene.prototype = Scene;
	this.logo = logo;
	this.comment = comment;
	this.background = background;
}

LogoCommentScene.prototype.render = function(gl) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);	
	this.background.render(gl);
	this.logo.render(gl);
	this.comment.render(gl);
	//this.renderFps(gl);
};

//LogoCommentScene.prototype.renderFps = Scene.prototype.renderFps;

function LogoCommentsScene(logo, comments, background) {
	LogoCommentScene.prototype = Scene;
	this.logo = logo;
	this.comments = comments;
	this.background = background;
}

LogoCommentsScene.prototype.render = function(gl) {
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);	
	this.background.render(gl);
	this.logo.render(gl);
	for (var comment in this.comments) {
		this.comments[comment].render(gl);
	}
	//this.renderFps(gl);
};

//LogoCommentsScene.prototype.renderFps = Scene.prototype.renderFps;

function LogoTwoTextScene(logo, textUp, textDown) {
	LogoCommentScene.prototype = Scene;
	this.logo = logo;
	this.textUp = textUp;
	this.textDown = textDown;
}

LogoTwoTextScene.prototype.render = function(gl) {
	gl.clear(gl.COLOR_BUFFER_BIT);
	this.logo.render(gl);
	this.textUp.render(gl);
	this.textDown.render(gl);	
};


// Scene object (abstract)
function SceneObject (parts) {
}
