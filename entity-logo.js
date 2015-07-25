
// Shaders text
var LogoObjectFragmentShaderSrc =	
	"precision mediump float; " + 
	"varying vec2 vTextureCoord; " +
	"uniform sampler2D uSampler; " +
	"uniform highp float faderValue; " + 
	"uniform float time; " + 
	"uniform float wiggle; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"void main(void) { " + 
	"	vec2 wiggledTexCoord = vTextureCoord; " + 
	"	float x = wiggledTexCoord.s, y = wiggledTexCoord.t; " +
	"	wiggledTexCoord.s += VALUEPA; " + 
	"	wiggledTexCoord.t += VALUEPB; " + 
	"   vec4 textureColor = texture2D(uSampler, vec2(wiggledTexCoord.s, wiggledTexCoord.t)); " + 
	"	if (textureColor.r + textureColor.g + textureColor.b >= 0.02) {" + 
	"		float x = wiggledTexCoord.s * wiggle, y = wiggledTexCoord.t * wiggle;" + 
	"		vec4 v = textureColor; " + 
	"		gl_FragColor = vec4(v.x, v.y, v.z, faderValue); " + 
	"	} " + 
	" 	else " + 
	"		gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);" + 
	"}" ;
				
var LogoObjectVertexShaderSrc =  		
	"attribute vec3 aVertexPosition; " + 
	"attribute vec2 aTextureCoord; " + 
	"uniform mat4 uMVMatrix; " + 
	"uniform mat4 uPMatrix; " + 
	"uniform mat3 uNMatrix; " + 
	"varying vec2 vTextureCoord; " + 
	"varying vec3 vLightWeighting; " + 
	"void main(void) { " + 
	"	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); " + 
	"	vTextureCoord = aTextureCoord; " + 
	"	vLightWeighting = vec3(1.0, 1.0, 1.0); " + 
	"}";
	
// Part
function LogoObject(logo, shaderX, shaderY, effects, animation, textureCanvas, canvasSize, glContext, wiggle, shadowEffectLayers) {
	this.logo = logo;
	this.shaderX = shaderX;
	this.shaderY = shaderY;
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	this.effects = effects;
	this.animation = animation;
	this.wiggle = (wiggle == undefined) ? 10.0 : wiggle;
	this.shadowEffectLayers = shadowEffectLayers == undefined ? 0 : shadowEffectLayers;
	
	this.initialize(textureCanvas, glContext, canvasSize);
}

LogoObject.prototype.initialize = function (textureCanvasName, gl, canvasSize) {
	this.initializeVertexBuffer(gl);
	this.initShadersLogoObject(gl);
	this.setMatrixUniformsText(gl);
	this.canvasSize = canvasSize;
	this.initializeLogoTexture(textureCanvasName, gl);
}

LogoObject.prototype.initializeLogoTexture = function (htmlCanvas, glContext) {	
	var canvas = document.getElementById(htmlCanvas);
	var ctx = canvas.getContext('2d');
	canvas.width = this.canvasSize;
	canvas.height = this.canvasSize;
	this.createTexture(ctx, canvas, this.font, glContext);
}

LogoObject.prototype.createTexture = function (ctx, canvas, font, glContext) {
	ctx.fillStyle = "#FFFFFF"; 
	ctx.fillRect(0, 0, this.canvasSize, this.canvasSize);
	var img = document.getElementById(this.logo);
	ctx.drawImage(img, 0, 0);	
	this.logoTexture = glContext.createTexture();
    handleLoadedTexture(this.logoTexture, canvas, glContext);
}

LogoObject.prototype.initializeVertexBuffer = function (gl) {
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

LogoObject.prototype.initShadersLogoObject = function (gl) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, LogoObjectVertexShaderSrc);
	gl.compileShader(vertexShader);
	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var result = LogoObjectFragmentShaderSrc;
	result = result.replace("VALUEPA", this.shaderX.toLowerCase());
	result = result.replace("VALUEPB", this.shaderY.toLowerCase());
	gl.shaderSource(fragmentShader, result);
	gl.compileShader(fragmentShader);
	this.shaderProgram = gl.createProgram();
	var shaderProgram = this.shaderProgram;
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		handleInitError("Could not initialise shaders.");
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
	shaderProgram.faderValue = gl.getUniformLocation(shaderProgram, "faderValue");
	shaderProgram.time = gl.getUniformLocation(shaderProgram, "time");
	shaderProgram.wiggle = gl.getUniformLocation(shaderProgram, "wiggle");
}

LogoObject.prototype.setMatrixUniformsText = function (gl) {
	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
}

LogoObject.prototype.render = function (gl) {
	var time = timerValue();
	gl.useProgram(this.shaderProgram);

	// Update animation
	for (var effect in this.effects) {
		this.effects[effect].apply(this);
	}
	
	// Set blend mode for drawing text
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	
	// Prepare to draw logo
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	mat4.identity(this.pMatrix);
	mat4.ortho(0, this.animation.sizeX, 0, this.animation.sizeY, 0.1, 100.0, this.pMatrix);
	mat4.identity(this.mvMatrix);
	mat4.translate(this.mvMatrix, [0.0, 0.0, -1.0]);
	
	var location = gl.getUniformLocation(this.shaderProgram, "time");
    gl.uniform1f(location, timerValue());		
	location = gl.getUniformLocation(this.shaderProgram, "faderValue");
	gl.uniform1f(location, this.transparencyValue);
	location = gl.getUniformLocation(this.shaderProgram, "wiggle");
	gl.uniform1f(location, this.wiggle);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.itemSize, gl.FLOAT, false, 0, 0);
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.logoTexture);
	
	if (this.shadowEffectLayers > 0) {
		var factor = 60.0 * delta / 1000.0;
		globalTextEffectAngle += 0.001 * factor;
		var xd = Math.cos(globalTextEffectAngle), yd = Math.sin(globalTextEffectAngle);
		
		for (var s=0; s< this.shadowEffectLayers; s++) {
			mat4.identity(this.mvMatrix);
			var v = 0.025 * (s + 1);
			mat4.translate(this.mvMatrix, [v * xd, v * yd, -0.1]);
			gl.uniform1i(this.shaderProgram.samplerUniform, 0);
			gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numItems);
		}
	}
	
	mat4.translate(this.mvMatrix, [this.animation.x, this.animation.y, 0.0]);
	this.setMatrixUniformsText(gl);
	gl.bindTexture(gl.TEXTURE_2D, this.logoTexture);
	gl.uniform1i(this.shaderProgram.samplerUniform, 0);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numItems);
}
