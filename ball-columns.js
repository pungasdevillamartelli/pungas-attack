
function BallColumns(count, movement, posx, range, program) {
	this.column = [];
	this.movement = movement;
	this.program = program;
	this.posx = posx;
	this.range = range;
	this.count = count;
	this.ballDetail = 8.0;
	this.texture = program;
	this.minY = -20.0;
	this.maxY = 20.0;
}


BallColumns.prototype.initialize = function(gl) {
	this.initShaders(gl, BallsVertexShaderSrc);
}

BallColumns.prototype.drawNodeSphere = function (gl, mvMatrix, pMatrix, program) {	
	setMatrixUniforms(gl, program, mvMatrix, pMatrix);
	gl.drawElements(gl.TRIANGLES, this.balls.vertexIndexBufferNumItems, gl.UNSIGNED_SHORT, 0);
}

BallColumns.prototype.generateRandomSpeed = function() {
	return Math.random() * 0.1;
}

BallColumns.prototype.generateInitialPositionX = function() {
	return this.posx + Math.random() * 5.0 - 2.5;
}

BallColumns.prototype.generateInitialPositionY = function() {
	//return this.minY + (this.maxY - this.minY) * Math.random();
	return this.minY;
}

/*
BallColumns.prototype.generateRadius = function() {
	var minR = 0.25, maxR = 0.50;
	return this.minR + (this.maxR - this.minR) * Math.random();
}
*/

BallColumns.prototype.generateInitialBalls = function() {
	for (var i=0; i< this.count; i++) {
		var ball = new BallWrapper();
		ball.balls = this.balls;
		ball.position.x = this.generateInitialPositionX();
		ball.position.y = this.minY;
		ball.speed = this.generateRandomSpeed();
		ball.radius = Math.random() * 0.4 + 0.1;
		this.column.push(ball);
	}
}

BallColumns.prototype.update = function() {
	this.move();
	this.checkMargins();
}

BallColumns.prototype.increment = function() {
	return 2.0 * getPunchy();
}

BallColumns.prototype.move = function() {
	for (var ball in this.column) {
		this.column[ball].position.y += this.increment() * this.column[ball].speed;
	}
}

BallColumns.prototype.checkMargins = function() {
	for (var ball in this.column) {
		if (this.column[ball].position.y > this.maxY) {
			this.column[ball].position.x = this.generateInitialPositionX();
			this.column[ball].position.y = this.generateInitialPositionY();
			this.column[ball].speed = this.generateRandomSpeed();
		}
	}
}

BallColumns.prototype.render = function(gl) {
	// Set perspective
	gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
	mat4.perspective(45, gl.drawingBufferWidth / gl.drawingBufferHeight, 0.1, 200.0, this.balls.pMatrix);
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
	gl.clear(gl.DEPTH_BUFFER_BIT);
	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	// Positionate, rotate
	var vec = mat4.create();
	mat4.identity(vec);
	mat4.translate(vec, [0.0, 0.0, -35.0]);
	
	// Set drawing primitive
	gl.bindBuffer(gl.ARRAY_BUFFER, this.balls.vertexPositionBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexPositionAttribute, this.balls.vertexPositionBufferItemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.balls.vertexTextureCoordBuffer);
	gl.vertexAttribPointer(this.shaderProgram.textureCoordAttribute, this.balls.vertexTextureCoordBufferItemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.balls.vertexNormalBuffer);
	gl.vertexAttribPointer(this.shaderProgram.vertexNormalAttribute, this.balls.vertexNormalBufferItemSize, gl.FLOAT, false, 0, 0);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.balls.vertexIndexBuffer);	
	gl.enableVertexAttribArray(this.shaderProgram.textureCoordAttribute);
	gl.enableVertexAttribArray(this.shaderProgram.vertexNormalAttribute);

	// test
	//this.balls.children[0].render(gl, vec, this.balls.pMatrix, this.shaderProgram);
	//this.balls.children[0].renderFirstLevel(gl, vec, this.balls.pMatrix, this.shaderProgram);
	
/*	var v = this.radius();
	var base = mat4.create();
	mat4.set(this.balls.mvMatrix, base);
	mat4.scale(base, [v, v, v]);
	this.drawNodeSphere(gl, base, this.balls.pMatrix, this.balls.shaderProgram);	*/
	
	for (var ball in this.column) {
		this.column[ball].renderFirstLevel(gl, vec, this.balls.pMatrix, this.shaderProgram);		
	}
	
	this.update();
}

RotationBallsNode.prototype.renderFirstLevel = function (gl, mvMatrix, pMatrix, shaderProgram) {
	var v = this.radius();
	var base = mat4.create();
	mat4.set(mvMatrix, base);
	mat4.scale(base, [v, v, v]);
	this.drawNodeSphere(gl, base, pMatrix, shaderProgram);
}

BallColumns.prototype.drawChild = function (gl, ball) {
	if (this.attachedRotationBall == undefined) {
		var v = ball.radius;
		var base = mat4.create();
		mat4.set(this.balls.mvMatrix, base);
		mat4.translate(base, [0, ball.position.y, 0]);
		mat4.scale(base, [v, v, v]);
		this.drawNodeSphere(gl, base, this.balls.pMatrix, this.shaderProgram);
	}
}

BallColumns.prototype.initShaders = function (gl, shader) {
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
		handleInitError("Could not initialize ball columns shaders.");
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

BallColumns.prototype.select = function (balls, number) {
	var ballsUnsorted = [];
	var result = [];
	
	for (var i=0; i< balls.length; i++) {
		ballsUnsorted.push(balls[i]);
	}
	
	for (var i=0; i< balls.length; i++) {
		var indexA = Math.floor(Math.random() * balls.length);
		var indexB = Math.floor(Math.random() * balls.length);
		var aux = ballsUnsorted[indexA];
		ballsUnsorted[indexA] = ballsUnsorted[indexB];
		ballsUnsorted[indexB] = aux;
	}

	for (var i=0; i< number; i++) {
		result.push(ballsUnsorted[i]);
	}
	
	return result;
}

BallColumns.prototype.connect = function (balls, number) {
	this.balls = balls;
	this.generateInitialBalls(this.count);
	
/*	var lastOrbitBalls = balls.getLastOrbitBalls();
	var selected = this.select(this.column, number);
	var selectedBalls = this.select(lastOrbitBalls, number);
	
	for (var i=0; i< selected.length; i++) {
		selectedBalls[i].attachedBallCenter = selected[i];
		selected[i].attachedRotationBall = selectedBalls[i];		
	}	*/
}
