
function MovementUpTo(start, end, minSpeed, maxSpeed) {
	this.start = start;
	this.end = end;
	this.minSpeed = minSpeed;
	this.maxSpeed = maxSpeed;
}


MovementUpTo.prototype.value = function (ball, time) {
	ball.y += ball.speed * globalDeltaTime;
}
