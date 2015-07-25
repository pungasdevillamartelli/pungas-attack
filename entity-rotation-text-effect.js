
function RotationTextEffect (childrenTable, radiusTable, distancesTable, valueFunction, texts) {
	this.root = {};
	this.children = {};
	this.texts = texts;
	
	this.vertexPositionBuffer;
	this.vertexTextureCoordBuffer;
	this.vertexIndexBuffer;

	this.childrenses = childrenTable;
	this.radiuses = radiusTable;
	this.distances = distancesTable;
	
	this.valueFunction = valueFunction;
}

RotationTextEffect.prototype.initialize = function (gl) {
	this.mvMatrix = mat4.create();
	this.pMatrix = mat4.create();
	
	var value = this.calculateChildren(0, 0);
	var da = 360.0 / value;
	this.selfRotation = { x: 0, y: 0, z: 0.1 };	
	
	this.children[0] = new RotationTextEffectNode(this);		
	this.children[0].angle = {x: 0, y: 0, z: 0};
	this.children[0].initializeNode(0, 0);
}

RotationTextEffect.prototype.update = function () {
	this.selfRotation.z += 0.01;	
	for (var child in this.children)	{
		this.children[child].update();
	}
}

function RotationTextEffectNode (root) {
	this.root = root;
	this.angle = {};
	this.rot = {};
	this.children = {};
	this.level;
	this.child;
}

RotationTextEffectNode.prototype.initializeNode = function (level, child) {
	var value = this.root.calculateChildren(level, 0);
	var da = 360.0 / value;

	this.level = level;
	this.child = child;
	
	for (var i=0; i< value; i++) {
		this.children[i] = new RotationTextEffectNode(this.root);
		this.children[i].angle = {};
		this.children[i].angle.x = 0.0;
		this.children[i].angle.y = 0.0;
		this.children[i].angle.z = i * da;
		this.children[i].initializeNode(level + 1, i);
	}
}

RotationTextEffect.prototype.render = function (gl) {	
	// Set blend mode for drawing text
	gl.enable(gl.BLEND);
	gl.blendEquation(gl.FUNC_ADD);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		
	// Set perspective
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	mat4.perspective(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 200.0, this.pMatrix);
	
	// Clear buffers
	gl.clearColor(0.5, 0.5, 0.1, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	gl.disable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	
	// Positionate, rotate
	var vec = mat4.create();
	mat4.identity(vec);
	mat4.translate(vec, [0.0, 0.0, -35.0]);
	mat4.rotate(vec, this.selfRotation.z, [0.0, 0.0, 1.0]);
	
	this.children[0].render(gl, vec, this.pMatrix);
	this.update();
}

RotationTextEffect.prototype.calculateChildren = function (level, child) {
	return this.childrenses[level];
}

RotationTextEffectNode.prototype.radius = function () {
	return this.root.radiuses[this.level];
}

RotationTextEffectNode.prototype.distance = function () {
	return this.root.distances[this.level];
}

RotationTextEffectNode.prototype.render = function (gl, mvMatrix, pMatrix) {
	var v = this.radius();
	var base = mat4.create();
	mat4.set(mvMatrix, base);
	mat4.scale(base, [v, v, v]);
	
	this.drawNodeLogo(gl, base, pMatrix);
	
	for (var child in this.children) {
		var base = mat4.create();
		var angle = this.children[child].angle;
		var distance = this.distance();
		
		mat4.set(mvMatrix, base);
		mat4.rotate(base, degToRad(angle.x), [1, 0, 0]);
		mat4.rotate(base, degToRad(angle.y), [0, 1, 0]);
		mat4.rotate(base, degToRad(angle.z), [0, 0, 1]);
		mat4.translate(base, [distance, 0, 0]);

		this.children[child].render(gl, base, pMatrix);
	}
}

RotationTextEffectNode.prototype.update = function () {
	var value = this.root.valueFunction(this);
	this.angle.x += value.x;
	this.angle.y += value.y;
	this.angle.z += value.z;
	
	for (var child in this.children)	{
		this.children[child].update();
	}
}

RotationTextEffectNode.prototype.drawNodeLogo = function (gl, mvMatrix, pMatrix) {	
	setMatrixUniforms(gl, this.root.texts[0].shaderProgram, mvMatrix, pMatrix);
	this.root.texts[0].render(gl, mvMatrix, pMatrix);
}

function setMatrixUniforms(gl, shaderProgram, mvMatrix, pMatrix) {
	gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
	gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

function degToRad (angle) {
	return Math.PI * angle / 180;
}
