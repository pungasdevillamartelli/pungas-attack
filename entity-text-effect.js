
var globalTextEffectAngle = 0.0;

// Sequencer
function TextSequencer () {
	this.parts = {};
	this.addPart = function (part) {};
}

this.render = function () {
	
};

// Text effects and properties
function TextEffect() {
	
}

function MovementEffect() {
}

function DisplacementEffect(xValue, yValue, deltaPerSeconds) {
	this.prototype = MovementEffect;
	this.xValue = xValue;
	this.yValue = yValue;
	this.deltaPerSeconds = deltaPerSeconds;
}

DisplacementEffect.prototype.apply = function (object) {
	var value = timerValue() / this.deltaPerSeconds;
	object.animation.x += value * this.xValue;
	object.animation.y += value * this.yValue;
}

function FromOutsideEffect() {
	this.prototype = MovementEffect;
}

function Centered () {
	this.prototype = MovementEffect;
	this.execute = function () {};
}

function Fader (startStart, startEnd, endStart, endEnd) {
	this.startStart = startStart;
	this.startEnd = startEnd;
	this.endStart = endStart;
	this.endEnd = endEnd;
}

Fader.prototype.apply = function (object) {
	var time = timerValue();
	
	if (time < this.startStart)
		object.transparencyValue = 0.0;
	else if (time < this.startEnd)
		object.transparencyValue = clamp(0.0, 1.0, (time - this.startStart) / (this.startEnd - this.startStart)); 
	else if (time < this.endStart)
		object.transparencyValue = 1.0;
	else if (time < this.endEnd)
		object.transparencyValue = clamp(0.0, 1.0, 1.0 - (time - this.endStart) / (this.endEnd - this.endStart));
	else
		object.transparencyValue = 0.0;
}

// #TODO: Move to PVM framework module
function MovingFader (startStart, startEnd, endStart, endEnd) {
	this.startStart = startStart;
	this.startEnd = startEnd;
	this.endStart = endStart;
	this.endEnd = endEnd;
}

MovingFader.prototype.apply = function (object) {
	var time = timerValue();
	var displacement;
	
	object.transparencyValue = 1.0;
	
	if (time < this.startStart)
		displacement = 1.0;
	else if (time < this.startEnd)
		displacement = 1.0 - 1.0 * (time - this.startStart) / (this.startEnd - this.startStart); 
	else if (time < this.endStart)
		displacement = 0.0;
	else if (time < this.endEnd)
		displacement = 0.0 - 1.0 * (time - this.endStart) / (this.endEnd - this.endStart); 
	else
		displacement = -1.0;
	
	if (object.animation.originalX == undefined) {
		object.animation.originalX = object.animation.x;
	}
	
	object.animation.x = object.animation.originalX + displacement * 3.0;
}

// Animation
function AnimationProperties(x, y, sizeX, sizeY) {
	this.x = x;
	this.y = y;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
}
	
// Part
function TextObject(font, text, shaderX, shaderY, texture, textureBorder, effects, animation, textureCanvas, glContext, fontShader) {
	this.text = text;
	this.font = font;
	this.shaderX = shaderX;
	this.shaderY = shaderY;
	this.texture = texture;
	this.textureBorder = textureBorder;
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	this.effects = effects;
	this.animation = animation;
	
	this.globalScale = 10.0;
	this.globalXRef = 0.0;
	this.globalYRef = 0.0;
	this.shadowEffectLayers = 0;
	this.displacementCompression = 1.0;
	
	this.initialize(textureCanvas, glContext, fontShader);
}

// Text logo 
var TextLogoFragmentShaderSrc =	
	"precision mediump float; " + 
	"varying vec2 vTextureCoord; " +
	"uniform sampler2D uSampler; " +
	"uniform highp float faderValue; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"uniform float va; " + 
/*	"uniform float vb; " + 
	"uniform float vc; " + 
	"uniform float vd; " + */
	"uniform float time; " + 
	"vec3 veccos(in vec3 a) { return vec3(cos(a.x), cos(a.y), cos(a.z)); } " + 
	"vec3 vecsin(in vec3 a) { return vec3(sin(a.x), sin(a.y), sin(a.z)); } " + 
	"vec3 vectan(in vec3 a) { return vec3(tan(a.x), tan(a.y), tan(a.z)); } " + 
	"vec3 vecabs(in vec3 a) { return vec3(abs(a.x), abs(a.y), abs(a.z)); } " + 
	"vec3 vecsqr(in vec3 a) { return vec3(a.x * a.x, a.y * a.y, a.z * a.z); } " + 
	"vec3 vecadd(in vec3 a, in vec3 b) { return vec3(a.x + b.x, a.y + b.y, a.z + b.z); } " + 
	"vec3 vecsubstract(in vec3 a, in vec3 b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); } " + 
	"vec3 vecmultiply(in vec3 a, in vec3 b) { return vec3(a.x * b.x, a.y * b.y, a.z * b.z); } " + 
	"vec3 vecdiv(in vec3 a, in vec3 b) { return vec3(a.x / b.x, a.y / b.y, a.z / b.z); } " + 
	"vec3 createvector(in float a, in float b, in float c) { return vec3(a, b, c); } " + 
	"vec3 veccolormap(in vec3 a, in vec3 b, in vec3 c) { return createvector(a.x / 10.0, b.x / 10.0, c.x / 10.0); } " + 			
	"float divideprotected(in float x, in float y) { if (abs(y) < 0.001) return 0.0; return x / y; }" + 
	"float sqr(in float x) { return x * x; }" +  	
	"void main(void) { " + 
	"	highp vec2 wiggledTexCoord = vTextureCoord; " + 
	"	float x = wiggledTexCoord.s, y = wiggledTexCoord.t; " +
	"	wiggledTexCoord.s += VALUEPA; " + 
	"	wiggledTexCoord.t += VALUEPB; " + 
	"   vec4 textureColor = texture2D(uSampler, vec2(wiggledTexCoord.s, wiggledTexCoord.t)); " + 
	"	if (textureColor.r < 0.6) {" + 
	"		float x = wiggledTexCoord.s * 10.0, y = wiggledTexCoord.t * 10.0;" + 
	"		vec3 v = VALUE; " + 
	"		float fillBorder = 0.0; " + 
	"		if (texture2D(uSampler, vec2(wiggledTexCoord.s, wiggledTexCoord.t)).r > 0.0) fillBorder = 1.0; " + 
	"		if (fillBorder < 0.01) " + 
	" 			gl_FragColor = vec4(v.x, v.y, v.z, faderValue); " + 
	"		else { " + 
	"			vec4 vb = vec4(VALUEBORDER, faderValue); " + 
	" 			gl_FragColor = vb; }" + 
	"	} " + 
	" 	else " + 
	"		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);" + 
	"}" ;
				
var TextLogoVertexShaderSrc =  		
	"attribute vec3 aVertexPosition; " + 
	"attribute vec2 aTextureCoord; " + 
	"uniform mat4 uMVMatrix; " + 
	"uniform mat4 uPMatrix; " + 
	"varying vec2 vTextureCoord; " + 
	"varying vec3 vLightWeighting; " + 
	"void main(void) { " + 
	"	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); " + 
	"	vTextureCoord = aTextureCoord; " + 
	"	vLightWeighting = vec3(1.0, 1.0, 1.0); " + 
	"}";

// Text logo 2 
var TextLogoFragmentShaderSrc2 =	
	"precision mediump float; " + 
	"varying vec2 vTextureCoord; " +
	"uniform sampler2D uSampler; " +
	"uniform highp float faderValue; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"uniform float va; " + 
/*	"uniform float vb; " + 
	"uniform float vc; " + 
	"uniform float vd; " + */
	"uniform float time; " + 
	"vec3 veccos(in vec3 a) { return vec3(cos(a.x), cos(a.y), cos(a.z)); } " + 
	"vec3 vecsin(in vec3 a) { return vec3(sin(a.x), sin(a.y), sin(a.z)); } " + 
	"vec3 vectan(in vec3 a) { return vec3(tan(a.x), tan(a.y), tan(a.z)); } " + 
	"vec3 vecabs(in vec3 a) { return vec3(abs(a.x), abs(a.y), abs(a.z)); } " + 
	"vec3 vecsqr(in vec3 a) { return vec3(a.x * a.x, a.y * a.y, a.z * a.z); } " + 
	"vec3 vecadd(in vec3 a, in vec3 b) { return vec3(a.x + b.x, a.y + b.y, a.z + b.z); } " + 
	"vec3 vecsubstract(in vec3 a, in vec3 b) { return vec3(a.x - b.x, a.y - b.y, a.z - b.z); } " + 
	"vec3 vecmultiply(in vec3 a, in vec3 b) { return vec3(a.x * b.x, a.y * b.y, a.z * b.z); } " + 
	"vec3 vecdiv(in vec3 a, in vec3 b) { return vec3(a.x / b.x, a.y / b.y, a.z / b.z); } " + 
	"vec3 createvector(in float a, in float b, in float c) { return vec3(a, b, c); } " + 
	"vec3 veccolormap(in vec3 a, in vec3 b, in vec3 c) { return createvector(a.x / 10.0, b.x / 10.0, c.x / 10.0); } " + 			
	"float divideprotected(in float x, in float y) { if (abs(y) < 0.001) return 0.0; return x / y; }" + 
	"float sqr(in float x) { return x * x; }" +  	
	"void main(void) { " + 
	"	highp vec2 wiggledTexCoord = vTextureCoord; " + 
	"	float x = wiggledTexCoord.s, y = wiggledTexCoord.t; " +
	"	wiggledTexCoord.s += VALUEPA; " + 
	"	wiggledTexCoord.t += VALUEPB; " + 
	"   vec4 textureColor = texture2D(uSampler, vec2(wiggledTexCoord.s, wiggledTexCoord.t)); " + 
	"	if (textureColor.r + textureColor.g + textureColor.b >= 0.02) {" + 
	"		float x = wiggledTexCoord.s * 10.0, y = wiggledTexCoord.t * 10.0;" + 
	"		vec4 v = textureColor; " + 
	"		gl_FragColor = vec4(v.x, v.y, v.z, faderValue); " + 
	"	} " + 
	" 	else " + 
	"		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);" + 
	"}" ;

TextObject.prototype.initialize = function (textureCanvasName, gl, fontShader) {
	this.fontShader = fontShader == undefined ? TextLogoFragmentShaderSrc : fontShader;
	this.initializeVertexBuffer(gl);
	this.initShadersTextLogo(gl);
	this.scale = 1.0;
}

TextObject.prototype.initializeVertexBuffer = function (gl) {
	this.squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	var vertices = [
		 1.0,  1.0,  0.0,
		 0.0,  1.0,  0.0,
		 1.0,  0.0,  0.0,
		 0.0,  0.0,  0.0
	];				
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.itemSize = 3;
	this.numItems = 4;		
}

TextObject.prototype.initShadersTextLogo = function (gl) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, TextLogoVertexShaderSrc);
	gl.compileShader(vertexShader);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

	var result = this.fontShader;
	result = result.replace("VALUESCALE", this.globalScale.toFixed(2).toString());
	result = result.replace("VALUEXREF", this.globalXRef.toFixed(2).toString());
	result = result.replace("VALUEYREF", this.globalYRef.toFixed(2).toString());
	result = result.replace("VALUEPA", this.shaderX.toLowerCase());
	result = result.replace("VALUEPB", this.shaderY.toLowerCase());
	result = result.replace("VALUEBORDER", this.textureBorder.toLowerCase());
	result = result.replace("VALUEBORDER", this.textureBorder.toLowerCase());
	result = result.replace("VALUE", this.texture.toLowerCase());
			
	gl.shaderSource(fragmentShader, result);
	gl.compileShader(fragmentShader);
	this.shaderProgram = gl.createProgram();
	var shaderProgram = this.shaderProgram;
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		handleInitError("Could not initialize text shaders.");
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.faderValue = gl.getUniformLocation(shaderProgram, "faderValue");
}

TextObject.prototype.setMatrixUniformsText = function (gl) {
	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
}

TextObject.prototype.render = function (gl) {
	var textLines = this.animation.sizeY, textColumns = this.animation.sizeX;
	gl.useProgram(this.shaderProgram);
	
	// Update animation
	for (var effect in this.effects) {
		this.effects[effect].apply(this);
	}
	
	// Set blend mode for drawing text
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	// Prepare to draw text
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	mat4.identity(this.pMatrix);
	mat4.ortho(0, textColumns, 0, textLines, 0.1, 100.0, this.pMatrix);
	
	var time = timerValue();
	var location = gl.getUniformLocation(this.shaderProgram, "va");
	gl.uniform1f(location, time);	
	location = gl.getUniformLocation(this.shaderProgram, "time");
    gl.uniform1f(location, timerValue());		
	location = gl.getUniformLocation(this.shaderProgram, "faderValue");
	gl.uniform1f(location, this.transparencyValue);
/*	location = gl.getUniformLocation(this.shaderProgram, "vb");
	gl.uniform1f(location, globalVb);	
	location = gl.getUniformLocation(this.shaderProgram, "vc");
	gl.uniform1f(location, globalVc);	
	location = gl.getUniformLocation(this.shaderProgram, "vd");
	gl.uniform1f(location, globalVd);	*/
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	
	// Call character by character rendering
	var vx = this.animation.x, vy = this.animation.y;
	location = gl.getUniformLocation(this.shaderProgram, "faderValue");
	gl.disable(gl.DEPTH_TEST);

	if (this.shadowEffectLayers > 0) {
		var factor = 60.0 * delta / 1000.0;		
		globalTextEffectAngle += 0.001 * factor;
		var xd = Math.cos(globalTextEffectAngle), yd = Math.sin(globalTextEffectAngle);
		
		for (var s=0; s< this.shadowEffectLayers; s++) {
			mat4.identity(this.mvMatrix);
			var v = 0.025 * (s + 1);
			mat4.translate(this.mvMatrix, [v * xd, v * yd, -0.1]);
			gl.uniform1f(location, this.transparencyValue / (s * s + 2.0));
			this.drawText(this.text, vx, vy, 1.0, gl, this.animation.charactersAnimation);
		}
	}
		
	mat4.identity(this.mvMatrix);
	mat4.translate(this.mvMatrix, [0.0, 0.0, -0.5]);
	gl.uniform1f(location, this.transparencyValue);
	this.drawText(this.text, vx, vy, 1.0, gl, this.animation.charactersAnimation);
}

TextObject.prototype.drawText = function (text, baseX, baseY, size, gl, charactersAnimation) {
	var x = baseX;
	mat4.translate(this.mvMatrix, [baseX, baseY, 0.0]);
	this.setMatrixUniformsText(gl);

	var n = this.mvMatrix;
	n = mat4.create();	
	mat4.set(this.mvMatrix, n);
	
	for (var i=0; i< text.length; i++) {
		gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, n);
		this.renderCharacter(text[i], x, baseY, size, gl);
		var xDisplacement = charactersAnimation ? charactersAnimation.x : 0.0;
		var yDisplacement = charactersAnimation ? charactersAnimation.y : 0.0;

		mat4.translate(n, [size / this.displacementCompression + xDisplacement, yDisplacement, 0.0]);
	}	
}

TextObject.prototype.renderCharacter = function (character, x, y, size, gl) {
	gl.bindTexture(gl.TEXTURE_2D, this.font.characterTextures[character]);
	gl.uniform1i(this.shaderProgram.samplerUniform, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numItems);
}
