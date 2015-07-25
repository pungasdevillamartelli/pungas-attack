
// STRING UTILS
function replaceAll(find, replace, str) {
  return str.replace(new RegExp(find, 'g'), replace);
}

// TIME
var globalStartTime = 0.0;
var globalTime = 0.0, globalVa = 0.0, globalVb = 0.0, globalVc = 0.0, globalVd = 0.0;
var deltaTime = 0.1;

function resetTimer() {
	globalStartTime = Date.now();
}

function timerValue() {
	return (Date.now() - globalStartTime) / 1000.0;
}

// MATH
function degToRad (angle) {
	return Math.PI * angle / 180;
}

// OTHER
function handleLoadedTexture(texture, textureCanvas, gl) {
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, textureCanvas); 
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function clamp (min, max, value) {
	if (value < min)
		return min;
	if (value > max)
		return max;
	return value;
}
	
function createFramebuffer(gl, size) {
	var buffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
	buffer.width = 512;
	buffer.height = 512;
	var texture = createTexture(gl, size);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	return {
		texture: texture,
		buffer: buffer
	};
}

function createTexture(gl, size) {
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.offsetWidth, size.offsetHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	return texture;
}

function handleInitError(str) {
	throw new Error(str);
}