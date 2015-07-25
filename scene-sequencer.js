  
function SceneSequencer () {
	this.scenes = [];
} 


function TimeStepsSceneSequencer (timeSteps) {
	this.scenes = [];
	this.timeSteps = timeSteps;
	
	TimeStepsSceneSequencer.prototype = SceneSequencer;
} 

TimeStepsSceneSequencer.prototype.getSceneNumber = function () {
	for (var i=0; i< this.timeSteps.length; i++) {
		if (timerValue() < this.timeSteps[i][0]) {
			return this.timeSteps[i][1];
		}
	}
	
	return this.scenes.length - 1;
};

TimeStepsSceneSequencer.prototype.addScene = function (scene) {
	this.scenes[this.scenes.length] = scene;
};

TimeStepsSceneSequencer.prototype.render = function (context) {
	var sceneNumber = this.getSceneNumber();
	this.scenes[sceneNumber].render(context);
};
