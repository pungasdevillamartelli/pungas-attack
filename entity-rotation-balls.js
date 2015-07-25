var BallsVertexShaderSrc = 
    "attribute vec3 aVertexPosition; " +
    "attribute vec2 aTextureCoord; " +
	"attribute vec3 aVertexNormal; " +
    "uniform mat4 uMVMatrix; " +
    "uniform mat4 uPMatrix; " +
	"uniform mat3 uNMatrix; " + 
    "uniform vec3 uAmbientColor; " +
    "uniform vec3 uLightingDirection; " +
    "uniform vec3 uDirectionalColor; " +
    "varying vec2 vTextureCoord; " +
    "varying vec3 vLightWeighting; " +
    "void main(void) {" +
	"   gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); " +
    "   vTextureCoord = aTextureCoord; " +
	"	vec3 transformedNormal = uNMatrix * aVertexNormal; " + 
    "	float directionalLightWeighting = max(dot(transformedNormal, uLightingDirection), 0.0); " + 
    "	vLightWeighting = uAmbientColor + uDirectionalColor * directionalLightWeighting; " +	
	"	float ax = gl_Position.x, ay = gl_Position.y, az = gl_Position.z; " + 
	"	float v = 1.0 + (ax * ax + ay * ay + (az * (az + 35.0))) / 1000.0; " +
	"	vLightWeighting = vec3(vLightWeighting.r / v, vLightWeighting.g / v, vLightWeighting.b / v); " + 
    "}";
	
var BallsFragmentShaderSrc =
    "precision mediump float;" +
    "varying vec2 vTextureCoord;" +
    "varying vec3 vLightWeighting;" +
    "uniform sampler2D uSampler;" +
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
	"void main(void) {" +
	"	 float x = vTextureCoord.s * 10.0, y = vTextureCoord.t * 10.0; " +
	"  	 vec3 t = TEXTUREFUNCTION; " +
	"  	 gl_FragColor = vec4(t.rgb * vLightWeighting, 1.0); " + 
    "}";


function RotationBalls (childrenTable, radiusTable, distancesTable, valueFunction, texture) {
	this.root = {};
	this.children = {};
	
	this.vertexPositionBuffer;
	this.vertexTextureCoordBuffer;
	this.vertexIndexBuffer;

	this.childrenses = childrenTable;
	this.radiuses = radiusTable;
	this.distances = distancesTable;
	
	this.valueFunction = valueFunction;
	this.texture = texture;
	
	this.ballDetail = 8;
}

RotationBalls.prototype.initialize = function (gl) {
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	
	var value = this.calculateChildren(0, 0);
	var da = 360.0 / value;
	this.selfRotation = { x: 0, y: 0, z: 0.1 };	
	
	this.children[0] = new RotationBallsNode(this);		
	this.children[0].angle = {x: 0, y: 0, z: 0};
	this.children[0].initializeNode(0, 0);
	
	this.initializeLists(gl, this.ballDetail, this.ballDetail, 1.0);
	this.initShaders(gl, BallsVertexShaderSrc);
}

RotationBalls.prototype.initialize2 = function (gl, shaderProgram) {
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	
	var value = this.calculateChildren(0, 0);
	var da = 360.0 / value;
	this.selfRotation = { x: 0, y: 0, z: 0.1 };	
	
	this.children[0] = new RotationBallsNode(this);		
	this.children[0].angle = {x: 0, y: 0, z: 0};
	this.children[0].initializeNode(0, 0);
	this.initializeLists(gl, 8, 8, 1.0);
	this.shaderProgram = shaderProgram;
}

RotationBalls.prototype.initializeLists = function (gl, latitudeBands, longitudeBands, radius) {
	var vertexPositionData = [];
	var normalData = [];
	var textureCoordData = [];
	var indexData = [];
	
	for (var latNumber = 0; latNumber <= latitudeBands; latNumber++) {
		var theta = latNumber * Math.PI / latitudeBands;
		var sinTheta = Math.sin(theta);
		var cosTheta = Math.cos(theta);
		for (var longNumber = 0; longNumber <= longitudeBands; longNumber++) {
			var phi = longNumber * 2 * Math.PI / longitudeBands;
			var sinPhi = Math.sin(phi);
			var cosPhi = Math.cos(phi);
			
			var x = cosPhi * sinTheta;
			var y = cosTheta;
			var z = sinPhi * sinTheta;
			
			var u = 1- (longNumber / longitudeBands);
			var v = latNumber / latitudeBands;
			normalData.push(x);
			normalData.push(y);
			normalData.push(z);
			textureCoordData.push(u);
			textureCoordData.push(v);
			vertexPositionData.push(radius * x);
			vertexPositionData.push(radius * y);
			vertexPositionData.push(radius * z);
		}
	}

	for (var latNumber = 0; latNumber < latitudeBands; latNumber++) {
		for (var longNumber = 0; longNumber < longitudeBands; longNumber++) {
			var first = (latNumber * (longitudeBands + 1)) + longNumber;
			var second = first + longitudeBands + 1;
			indexData.push(first);
			indexData.push(second);
			indexData.push(first + 1);
			indexData.push(second);
			indexData.push(second + 1);
			indexData.push(first + 1);
		}
	}
	
	this.vertexNormalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
	this.vertexNormalBufferItemSize = 3;
	this.vertexNormalBufferNumItems = normalData.length / 3;
	
	this.vertexTextureCoordBuffer = gl.createBuffer();	
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
	this.vertexTextureCoordBufferItemSize = 2;
	this.vertexTextureCoordBufferNumItems = textureCoordData.length / 2;
	
	this.vertexPositionBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
	this.vertexPositionBufferItemSize = 3;
	this.vertexPositionBufferNumItems = vertexPositionData.length / 3;
	
	this.vertexIndexBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
	this.vertexIndexBufferItemSize = 1;
	this.vertexIndexBufferNumItems = indexData.length;
}

RotationBalls.prototype.update = function () {
	//if (frameCounter % 2) {
	this.selfRotation.z += 0.01;	
	for (var child in this.children)	{
		this.children[child].update();
	}
	//}
}

function RotationBallsNode (root) {
	this.root = root;
	this.angle = {};
	this.rot = {};
	this.children = {};
	this.level;
	this.child;
}

RotationBallsNode.prototype.initializeNode = function (level, child) {
	var value = this.root.calculateChildren(level, 0);
	var da = 360.0 / value;

	this.level = level;
	this.child = child;
	
	for (var i=0; i< value; i++) {
		this.children[i] = new RotationBallsNode(this.root);
		this.children[i].angle = {};
		this.children[i].angle.x = 0.0;
		this.children[i].angle.y = 0.0;
		this.children[i].angle.z = i * da;
		this.children[i].initializeNode(level + 1, i);
	}
}

RotationBalls.prototype.initShaders = function (gl, shader) {
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, shader);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	var source = BallsFragmentShaderSrc.replace("TEXTUREFUNCTION", this.texture);
	
	gl.shaderSource(fragmentShader, source);
	gl.compileShader(fragmentShader);

	this.shaderProgram = gl.createProgram();
	var shaderProgram = this.shaderProgram;
	gl.attachShader(shaderProgram, vertexShader);
	gl.attachShader(shaderProgram, fragmentShader);
	gl.linkProgram(shaderProgram);

	if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
		handleInitError("Could not initialize balls shaders.");
	}

	gl.useProgram(shaderProgram);
	shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
	gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
	shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "aTextureCoord");
	gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);
	shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);
		
	shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
	shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
	shaderProgram.nMatrixUniform = gl.getUniformLocation(shaderProgram, "uNMatrix");
	shaderProgram.samplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
    shaderProgram.ambientColorUniform = gl.getUniformLocation(shaderProgram, "uAmbientColor");
    shaderProgram.lightingDirectionUniform = gl.getUniformLocation(shaderProgram, "uLightingDirection");
    shaderProgram.directionalColorUniform = gl.getUniformLocation(shaderProgram, "uDirectionalColor");	
	
	gl.disableVertexAttribArray(shaderProgram.textureCoordAttribute);
    gl.disableVertexAttribArray(shaderProgram.vertexNormalAttribute);
}

RotationBalls.prototype.render = function (gl) {	
	// Set perspective
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	mat4.perspective(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 200.0, this.pMatrix);

	// Setting shader
	gl.useProgram(this.shaderProgram);
	
	// Set ligthing
	gl.uniform3f(this.shaderProgram.ambientColorUniform, 0.5, 0.5, 0.5);
	var lightingDirection = [ -1.0, 0.5, -0.5 ];
	var adjustedLD = vec3.create();
	vec3.normalize(lightingDirection, adjustedLD);
	vec3.scale(adjustedLD, -1);
	gl.uniform3fv(this.shaderProgram.lightingDirectionUniform, adjustedLD);
	gl.uniform3f(this.shaderProgram.directionalColorUniform, 0.99, 0.99, 0.99);
		
	// Set time
	var time = timerValue();
	var location = gl.getUniformLocation(this.shaderProgram, "time");
    gl.uniform1f(location, timerValue());
	
	// Clear buffers
/*	gl.clear(gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.depthMask(true);
	gl.disable(gl.BLEND);
	gl.depthFunc(gl.LESS);		*/
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	
	// Positionate, rotate
	var vec = mat4.create();
	mat4.identity(vec);
	mat4.translate(vec, [0.0, 0.0, -35.0]);
	mat4.rotate(vec, this.selfRotation.z, [0.0, 0.0, 1.0]);
	
	// Set drawing primitive
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.vertexPositionBufferItemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexTextureCoordBuffer);
	gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.vertexTextureCoordBufferItemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexNormalBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.vertexNormalBufferItemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.vertexIndexBuffer);	
	
	gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
	gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);
	
	this.children[0].render(gl, vec, this.pMatrix, this.shaderProgram);
	
	this.update();
}

RotationBalls.prototype.calculateChildren = function (level, child) {
	return this.childrenses[level];
}

RotationBallsNode.prototype.radius = function () {
	return this.root.radiuses[this.level];
}

RotationBallsNode.prototype.distance = function () {
	return this.root.distances[this.level];
}

var ballCounter = 0;

RotationBallsNode.prototype.render = function (gl, mvMatrix, pMatrix, shaderProgram) {
	var v = this.radius();
	var base = mat4.create();
	mat4.set(mvMatrix, base);
	mat4.scale(base, [v, v, v]);
	this.drawNodeSphere(gl, base, pMatrix, shaderProgram);
	
	var distance = this.distance();
	
	for (var child in this.children) {
		var angle = this.children[child].angle;
		
		var base = mat4.create();
		mat4.set(mvMatrix, base);
		mat4.rotate(base, degToRad(angle.x), [1, 0, 0]);
		mat4.rotate(base, degToRad(angle.y), [0, 1, 0]);
		mat4.rotate(base, degToRad(angle.z), [0, 0, 1]);
		mat4.translate(base, [distance, 0, 0]);

		this.children[child].render(gl, base, pMatrix, shaderProgram);
	}
}

RotationBallsNode.prototype.update = function () {
	var value = this.root.valueFunction(this);
	var factor = 60.0 * delta / 1000.0;
	this.angle.x += value.x * factor;
	this.angle.y += value.y * factor;
	this.angle.z += value.z * factor;
	
	for (var child in this.children)	{
		this.children[child].update();
	}
}

RotationBallsNode.prototype.drawNodeSphere = function (gl, mvMatrix, pMatrix, program) {	
	setMatrixUniforms(gl, program, mvMatrix, pMatrix);
	gl.drawElements(gl.TRIANGLES, this.root.vertexIndexBufferNumItems, gl.UNSIGNED_SHORT, 0);
}

function setMatrixUniforms(gl, shaderProgram, mvMatrix, pMatrix) {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
	
	var normalMatrix = mat3.create();
    mat4.toInverseMat3(mvMatrix, normalMatrix);
    mat3.transpose(normalMatrix);
    gl.uniformMatrix3fv(shaderProgram.nMatrixUniform, false, normalMatrix);
}


var BallsVertexConstantLightShaderSrc = 
    "attribute vec3 aVertexPosition; " +
    "attribute vec2 aTextureCoord; " +
	"attribute vec3 aVertexNormal; " +
    "uniform mat4 uMVMatrix; " +
    "uniform mat4 uPMatrix; " +
	"uniform mat3 uNMatrix; " + 
    "uniform vec3 uAmbientColor; " +
    "uniform vec3 uLightingDirection; " +
    "uniform vec3 uDirectionalColor; " +
    "varying vec2 vTextureCoord; " +
    "varying vec3 vLightWeighting; " +
    "void main(void) {" +
	"   gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0); " +
    "   vTextureCoord = aTextureCoord; " +
	"	vLightWeighting = vec3(1.0, 1.0, 1.0); " + 
    "}";
	
function RotationBallsNoLight (childrenTable, radiusTable, distancesTable, valueFunction, texture) {
	this.root = {};
	this.children = {};
	
	this.vertexPositionBuffer;
	this.vertexTextureCoordBuffer;
	this.vertexIndexBuffer;

	this.childrenses = childrenTable;
	this.radiuses = radiusTable;
	this.distances = distancesTable;
	
	this.valueFunction = valueFunction;
	this.texture = texture;
}

RotationBallsNoLight.prototype = RotationBalls;

RotationBallsNoLight.prototype.initialize = function (gl) {
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	
	var value = this.calculateChildren(0, 0);
	var da = 360.0 / value;
	this.selfRotation = { x: 0, y: 0, z: 0.1 };	
	
	this.children[0] = new RotationBallsNode(this);		
	this.children[0].angle = {x: 0, y: 0, z: 0};
	this.children[0].initializeNode(0, 0);
	
	this.initializeLists(gl, 8, 8, 1.0);
	this.initShaders(gl, BallsVertexConstantLightShaderSrc);
}