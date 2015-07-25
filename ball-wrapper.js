function BallWrapper (ball) {
	this.ball = ball;
	this.position = {};
}


BallWrapper.prototype.modelViewMatrix = function () {
	var v = this.radius;
	var base = mat4.create();
	mat4.translate(base, [this.position.x, this.position.y, 0]);
	mat4.scale(base, [v, v, v]);
	return base;
}

BallWrapper.prototype.renderFirstLevel = function (gl, mvMatrix, pMatrix, shaderProgram) {
	var v = this.radius;
	var base = mat4.create();
	mat4.identity(base);
	mat4.translate(base, [this.position.x, this.position.y, -35.0]);
	mat4.scale(base, [v, v, v]);

	if (this.attachedRotationBall == undefined) {
		this.balls.children[0].renderFirstLevel(gl, base, pMatrix, shaderProgram);
	}
}

BallWrapper.prototype.update = function () {
	this.ball.update();
	
	for (var child in this.ball.children) {
		this.ball.children[child].update();
	}
}

BallWrapper.prototype.root = function () {
	return this.ball.root;
}
