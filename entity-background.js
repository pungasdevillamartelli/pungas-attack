 
// RGB animated
var RGBBackgroundVertextShaderSrc = 
	"attribute vec3 aVertexPosition; " +
	"attribute vec2 aTextureCoord; " + 
	"uniform mat4 uMVMatrix; " + 
	"uniform mat4 uPMatrix; " + 
	"varying float xx, yy; " + 
	"void main(void) { " + 
	"	vec2 coord = aTextureCoord; " + 
	"	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 2.0); " + 
	"	xx = clamp(aVertexPosition.x,0.0,1.0); " + 
	"	yy = clamp(aVertexPosition.y,0.0,1.0); " + 
	"}";

var RGBBackgroundFragmentShaderSrc =
	"precision mediump float; " + 
	"uniform float time; " + 
	"uniform float faderValue; " + 
	"varying float xx; " + 
	"varying float yy; " + 
	"uniform float va; " + 
/*	"uniform float vb; " + 
	"uniform float vc; " + 
	"uniform float vd; " + 	*/
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
	"void main(void) { " + 
	//"	float ra = va, rb = vb, rc = vc, rd = vd; " + 
	"	float ra = va; " + 
	"	float x = xx * 10.0, y = yy * 10.0; " + 	
	"	vec3 v = VALUE; " +
	"	gl_FragColor = vec4(v.x * faderValue, v.y * faderValue, v.z * faderValue, 1.0); " + 
	"}";
	
function BackgroundObject (entity, effects) {
	this.entity = entity;
	this.effects = effects;
	this.globalScale = 1.0;
	this.globalXRef = 1.0;
	this.globalYRef = 1.0;	
} 
	
BackgroundObject.prototype.initialize = function (gl) {
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	this.initBuffersRGB(gl);
	this.initShadersRGBAnimate(gl);
}

BackgroundObject.prototype.render = function (gl) {
	var globalVa = timerValue();
	gl.useProgram(this.shaderProgram);
	
	// Update animation effects
	for (var effect in this.effects) {
		this.effects[effect].apply(this);
	}
	
	var location = gl.getUniformLocation(this.shaderProgram, "va");
    gl.uniform1f(location, globalVa);	
/*	location = gl.getUniformLocation(this.shaderProgram, "vb");
    gl.uniform1f(location, globalVb);	
	location = gl.getUniformLocation(this.shaderProgram, "vc");
    gl.uniform1f(location, globalVc);	
	location = gl.getUniformLocation(this.shaderProgram, "vd");
	gl.uniform1f(location, globalVd);	*/
	location = gl.getUniformLocation(this.shaderProgram, "time");
    gl.uniform1f(location, timerValue());	
	location = gl.getUniformLocation(this.shaderProgram, "faderValue");
    gl.uniform1f(location, this.transparencyValue);	
	
	gl.disable(gl.DEPTH_TEST);
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	
	mat4.identity(this.pMatrix);
	mat4.ortho(0, 1, 0, 1, 0.1, 100.0, this.pMatrix);
	
	mat4.identity(this.mvMatrix);
	mat4.translate(this.mvMatrix, [0.0, 0.0, -10.0]);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.itemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.itemSize, gl.FLOAT, false, 0, 0);
	this.setMatrixUniforms(gl);
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.numItems);
}

BackgroundObject.prototype.initBuffersRGB = function (gl) {
	this.squareVertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.squareVertexPositionBuffer);
	var vertices = [
		 2.0,  2.0,  0.0,
		 0.0,  2.0,  0.0,
		 2.0,  0.0,  0.0,
		 0.0,  0.0,  0.0
	];	
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
	this.itemSize = 3;
	this.numItems = 4;
}

BackgroundObject.prototype.initShadersRGBAnimate = function (gl) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, RGBBackgroundVertextShaderSrc);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var result = RGBBackgroundFragmentShaderSrc;
	result = result.replace("VALUESCALE", this.globalScale.toFixed(2).toString());
	result = result.replace("VALUEXREF", this.globalXRef.toFixed(2).toString());
	result = result.replace("VALUEYREF", this.globalYRef.toFixed(2).toString());
	result = result.replace("VALUE", this.entity.toLowerCase());
	gl.shaderSource(fragmentShader, result);
	gl.compileShader(fragmentShader);

	this.shaderProgram = gl.createProgram();
	var shaderProgram = this.shaderProgram;
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		handleInitError("Could not initialize background shaders.");
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

BackgroundObject.prototype.setMatrixUniforms = function (gl) {
	gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.pMatrix);
	gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.mvMatrix);
}
