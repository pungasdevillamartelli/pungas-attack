
var fontSizeLeyendaX = 7.15, fontSizeLeyendaY = 5.4;
var fontTextureEffect1 = 
"VECDIV(CREATEVECTOR(Y*4.0,Y*4.0,Y*4.0),VECADD(VECABS(CREATEVECTOR(X*4.0,0.9347,Y*4.0)),VECSUBSTRACT(CREATEVECTOR(0.6904,X*4.0,0.8712),VECADD(CREATEVECTOR(0.6295,Y*4.0,Y*4.0),VECSQR(VECADD(VECTAN(CREATEVECTOR(Y*4.0,X*4.0,X*4.0)),VECTAN(CREATEVECTOR(X*4.0,Y*4.0,Y*4.0))))))))";
var fontBorderTextureEffect1 = "CREATEVECTOR(0.00,0.0, 0.0)";
var fontTextureEffect2 = "CREATEVECTOR(0.0,0.0,0.1)";
var fontBorderTextureEffect2 = "CREATEVECTOR(0.8,0.8, 0.8)";

var balls7, balls13, ballColumn1, ballColumn2;

var sceneSequencesTable = 
	[	
		[23, 0], 		// pvm presents
		[27.5, 1], 		
		[39, 2], 	
		[45, 3], 	
		[62, 12], 		// balls 1
		[72.0, 4],		// we salute 
		[92, 11],		// balls 2
		[115.1, 5], 	// ansi lsd
		[145.65, 8],  	// ball araña	
		[156.5, 7], 	// simple
		[176.35, 13],	// balls random
		[197.5, 14],	// donna ball
		[235, 10], 		// greetings, fade out
		[999999, 15]
	];

// Helpers
function getStart(index) {
	if (index==0) return 0.0;

	// Answer start of the first occurrence
	for (var i=0; i< sceneSequencesTable.length; i++) {
		if (sceneSequencesTable[i][1] == index)
			return sceneSequencesTable[i-1][0];
	}
}

function getEnd(index) {
	// Answer end of the last occurrence
	var last = 0.0;
	for (var i=0; i< sceneSequencesTable.length; i++) {
		if (sceneSequencesTable[i][1] == index)
			last = sceneSequencesTable[i][0];
	}
	
	return last;
}

function Intro() {
	this.fontStyles = {};
	this.firstTimes = {};
}


Intro.prototype.render = function (glContext) {
	this.sequencer.render(glContext);
}

Intro.prototype.addTexts = function (glContext, textCanvas, start, sizex, sizey, effectX, effectY, timetable, texttable, delta, displacement, list) {
	for (var index=0; index< texttable.length; index++) {
		var s = start + timetable[index] - timetable[0];
		var ee = s + delta;
		var textObject = new TextObject(this.fontStyles["comment"], texttable[index], effectX, effectY, fontTextureEffect1, fontBorderTextureEffect1, 
						 [ new Fader(s, s + 0.1, ee, ee + 0.8) ], 
						 new AnimationProperties(
							sizex / 2 - texttable[index].length * 0.3, 
							(index % 2 == 0) ? sizey / 2 : sizey / 6, 
							sizex, sizey),
						 textCanvas, glContext);
		textObject.shadowEffectLayers = 15;
		textObject.displacementCompression = displacement;
		textObject.scale = 1.0;
		list.push(textObject);
	}
}

Intro.prototype.addTextsGreets = function (glContext, textCanvas, start, sizex, sizey, effectX, effectY, timetable, texttable, delta, displacement, list) {
	for (var index=0; index< texttable.length; index++) {
		var s = start + timetable[index] - timetable[0];
		var ee = s + delta;
		var textObject = new TextObject(this.fontStyles["comment"], texttable[index], effectX, effectY, fontTextureEffect2, fontBorderTextureEffect2, 
						 [ new Fader(s, s + 0.5, ee, ee + 0.5) ], 
						 new AnimationProperties(
							sizex / 2 - texttable[index].length * 0.3, 
							sizey / 2, 
							sizex, sizey),
						 textCanvas, glContext);
		textObject.displacementCompression = displacement;
		textObject.scale = 1.0;
		list.push(textObject);
	}
}

Intro.prototype.addTextsGreetsDiz = function (glContext, textCanvas, start, sizex, sizey, effectX, effectY, timetable, texttable, delta, displacement, list) {
	for (var index=0; index< texttable.length; index++) {
		var s = start + timetable[index] - timetable[0];
		var e = s + delta;
		var object = new LogoObject("diz-" + texttable[index], effectX, effectY,
							[ new MovingFader(s, s + 0.5, e, e + 0.5) ], 
 							  new AnimationProperties(1.0, 0.5, 3.0, 4.0),
							  textCanvas, 
							  256,
							  glContext,
							  0.0,
							  0,
							  0.0);
		list.push(object);
	}
}

// Initialization
Intro.prototype.initialize = function (glContext, textCanvas) {
	// Scene sequencer
	this.sequencer = new TimeStepsSceneSequencer(sceneSequencesTable);
	// Font styles: logos
	var fontStyle = new FontStyle3(["pvm-letter-P", "pvm-letter-V", "pvm-letter-M"], 256);
	fontStyle.initialize(glContext, textCanvas);
	this.fontStyles["logo"] = fontStyle;
	// Font styles: name
	var fontStyleName = new FontStyle3(["pvm-name-p", "pvm-name-u", "pvm-name-n", "pvm-name-g", "pvm-name-a", "pvm-name-s", "pvm-name-h", "pvm-name-t", "pvm-name-z", "pvm-name-x", "pvm-name-c", "pvm-name-k"], 128);
	fontStyleName.initialize(glContext, textCanvas);
	this.fontStyles["demoname"] = fontStyleName;
	// Font styles: comments and title
	var fontStyleComment = new FontStyle2("Verdana", 128);
	fontStyleComment.initialize(glContext, textCanvas);	
	this.fontStyles["comment"] = fontStyleComment;
	
	// Scenes
	this.initializeScene1(glContext, textCanvas);
	this.initializeScene2(glContext, textCanvas);
	this.initializeScene3(glContext, textCanvas);
	this.initializeScene4(glContext, textCanvas);
	this.initializeScene5(glContext, textCanvas);
	this.initializeScene6(glContext, textCanvas);
	this.initializeScene7(glContext, textCanvas);
	this.initializeBallColumns(glContext);
	this.initializeScene8(glContext, textCanvas);
	this.initializeScene9(glContext, textCanvas);
	this.initializeScene10(glContext, textCanvas);
	this.initializeScene11(glContext, textCanvas);
	this.initializeScene12(glContext, textCanvas);
	this.initializeScene13(glContext, textCanvas);
	this.initializeScene14(glContext, textCanvas);
	this.initializeScene15(glContext, textCanvas);
	this.initializeScene16(glContext, textCanvas);
}	

Intro.prototype.initializeBallColumns = function(glContext) {
	var movement = new MovementUpTo(-2.0, 4.0, 0.1, 5.0);
	ballColumn1 = new BallColumns(
		20, movement, 20.0, 0.1,"vecadd(vectan(createvector(0.7337,0.2008,0.2437)),vecmultiply(vecmultiply(vectan(vecsubstract(vecmultiply(vectan(vecsubstract(vecsqr(createvector(x,y,y)),vecsin(vecabs(createvector(y,x,x))))),vecsin(createvector(0.0748,0.0758,0.0612))),vecsin(veccos(createvector(0.8157,y,0.7878))))),vecabs(veccos(createvector(y,time,0.4963)))),vecsin(veccos(vecabs(createvector(y,x,x))))))");

	ballColumn2 = new BallColumns(
		20, movement, -20.0, 0.1,"vecadd(vectan(createvector(0.7337,0.2008,0.2437)),vecmultiply(vecmultiply(vectan(vecsubstract(vecmultiply(vectan(vecsubstract(vecsqr(createvector(x,y,y)),vecsin(vecabs(createvector(y,x,x))))),vecsin(createvector(0.0748,0.0758,0.0612))),vecsin(veccos(createvector(0.8157,y,0.7878))))),vecabs(veccos(createvector(y,time,0.4963)))),vecsin(veccos(vecabs(createvector(y,x,x))))))");
	
	ballColumn1.initialize(glContext);
	ballColumn2.initialize(glContext);
	ballColumn1.connect(balls7, 50);
	ballColumn2.connect(balls7, 50);
}

Intro.prototype.initializeScene1 = function (glContext, textCanvas) {
	var comments = [];
	
	// Logo
	var timeVar = "TIME * 3.0";
	var effectX = "DIVIDEPROTECTED(DIVIDEPROTECTED((DIVIDEPROTECTED(" + timeVar + ",((SIN(7.0000)-Y)-X))*5.0000),SQR(" + timeVar + "))," + timeVar + ")";
	var effectY = "2.0";
	var fontTexture = "vecdiv(createvector(y,0.4960,x),vecsubstract(createvector(x,y,x),vecdiv(createvector(0.6722,x,x),vecdiv(veccos(vecsqr(createvector(y,y,y))),vecdiv(vectan(vecsubstract(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))),vecabs(vecsin(vecsqr(createvector(x,x,x)))))))))";
	var fontBorderTexture = "vecsubstract(createvector(0.4348,0.3668,0.7623),vecdiv(vecsin(createvector(y,x,x)),vecadd(veccos(vecabs(createvector(x,x,x))),vecadd(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))))) ";
	var logo = new TextObject(this.fontStyles["logo"], "PVM", effectX, effectY, fontTexture, fontBorderTexture, 
							  [ new Fader(1.95, 5.0, 11.50, 11.60) ], 
							  new AnimationProperties(0, 2, 3, 3), 
							  textCanvas, glContext, TextLogoFragmentShaderSrc2);
	// Comment 1
	effectX = "sin(time * 4.0 + 4.0 * 3.141592653589 * y) * 0.02";
	effectY = "sin(time * 4.0 + 4.0 * 3.141592653589 * x) * 0.02";	
	fontTexture = "vecdiv(createvector(y,0.4960,x),vecsubstract(createvector(x,y,x),vecdiv(createvector(0.6722,x,x),vecdiv(veccos(vecsqr(createvector(y,y,y))),vecdiv(vectan(vecsubstract(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))),vecabs(vecsin(vecsqr(createvector(x,x,x)))))))))";
	fontBorderTexture = "vecsubstract(createvector(0.4348,0.3668,0.7623),vecdiv(vecsin(createvector(y,x,x)),vecadd(veccos(vecabs(createvector(x,x,x))),vecadd(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))))) ";
	comments.push(new TextObject(this.fontStyles["comment"], "presents", effectX, effectY, fontTexture, fontBorderTexture, 
								 [ new Fader(7.65, 8.25, 9.7, 10.5) ], 
								 new AnimationProperties(1.0, 2.2, 10, 10),
								 textCanvas, glContext));
	// Comment 2
	effectX = "ABS(COS(SIN(DIVIDEPROTECTED(3.0000,DIVIDEPROTECTED(COS(Y),((Y-(((SQR(DIVIDEPROTECTED(7.0000,SQR(COS(TIME))))-Y)-COS(X))-COS(1.0000)))+(COS(SIN(X))+0.0000)))))))";
	effectY = "3.0";	
	fontTexture = "vecdiv(createvector(y,0.4960,x),vecsubstract(createvector(x,y,x),vecdiv(createvector(0.6722,x,x),vecdiv(veccos(vecsqr(createvector(y,y,y))),vecdiv(vectan(vecsubstract(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))),vecabs(vecsin(vecsqr(createvector(x,x,x)))))))))";
	fontBorderTexture = "vecsubstract(createvector(0.4348,0.3668,0.7623),vecdiv(vecsin(createvector(y,x,x)),vecadd(veccos(vecabs(createvector(x,x,x))),vecadd(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))))) ";
	comments.push(new TextObject(this.fontStyles["demoname"], "pungas", effectX, effectY, fontTexture, fontBorderTexture, 
								 [ new Fader(13.45, 13.95, 22.0, 22.5)], 
								 new AnimationProperties(0.5, 2.5, 8.0, 5.0),
								 textCanvas, glContext, TextLogoFragmentShaderSrc2));
	comments.push(new TextObject(this.fontStyles["demoname"], "xtzhck", effectX, effectY, fontTexture, fontBorderTexture, 
								 [ new Fader(15.9, 16.5, 22.0, 22.5)], 
								 new AnimationProperties(0.5, 1.0, 8.0, 5.0),
								 textCanvas, glContext, TextLogoFragmentShaderSrc2));								 

	// Background
	var start = getStart(0);
	var end = getEnd(0);	
	var background = new BackgroundObject(
		"VECMULTIPLY(VECMULTIPLY(VECMULTIPLY(VECCOS(CREATEVECTOR(X,TIME,X)),VECSIN(CREATEVECTOR(Y,X,Y))),VECSIN(VECTAN(CREATEVECTOR(Y,Y,0.3119)))),VECSIN(CREATEVECTOR(TIME,Y,Y)))",
		[ new Fader(start, start + 2.50, end - 0.5, end) ]);
	background.initialize(glContext);

	var scene = new LogoCommentsScene(logo, comments, background, textCanvas, glContext);
	this.sequencer.addScene(scene);
}

Intro.prototype.initializeScene2 = function (glContext, textCanvas) {		
	var start = getStart(1);
	var end = getEnd(1);
	
	var background = new BackgroundInterpolationObject(
		[
		"VECDIV(CREATEVECTOR(0.4762,0.2805,0.5222),VECADD(VECCOS(VECSQR(VECADD(CREATEVECTOR(Y,0.4019,VA),VECSQR(VECSQR(VECDIV(CREATEVECTOR(Y,Y,X),VECCOS(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECTAN(VECSIN(VECADD(VECSIN(CREATEVECTOR(0.5033,X,Y)),VECABS(VECSUBSTRACT(CREATEVECTOR(TIME,TIME,TIME),CREATEVECTOR(Y,Y,X))))))))",
		"VECCOS(VECADD(VECSIN(VECTAN(VECTAN(CREATEVECTOR(0.5435,X,0.0763)))),VECDIV(VECSQR(VECCOS(CREATEVECTOR(0.7337,0.6061,0.9804))),VECMULTIPLY(VECCOS(CREATEVECTOR(X,Y,Y)),VECCOS(VECABS(CREATEVECTOR(Y,X,X)))))))"
		],
		4.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]); 
		
	background.initialize(glContext);
	var effectX = "ABS((X-TIME / 15.0))";
	var effectY = "ABS(COS (X))";
	var fontTexture = "VECTAN(VECABS(VECMULTIPLY(VECCOS(VECMULTIPLY(VECSUBSTRACT(CREATEVECTOR(0.8047,TIME-11.0,0.3076),CREATEVECTOR(0.0111,0.3683,0.7230)),CREATEVECTOR(Y,Y,Y))),VECCOS(CREATEVECTOR(0.1449,Y,Y)))))";
	var fontBorderTexture = "vecsubstract(createvector(0.4348,0.3668,0.7623),vecdiv(vecsin(createvector(y,x,x)),vecadd(veccos(vecabs(createvector(x,x,x))),vecadd(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))))) ";

	var c1 = new TextObject(this.fontStyles["comment"], "M", effectX, effectY, fontTexture, fontBorderTexture, 
							 [ new Fader(start, start + 2.0, end - 0.5, end) ], 
							 new AnimationProperties(0.0, 0.0, 1.0, 1.0),
							 textCanvas, glContext);

	var list = [ background, c1 ];	
	
	this.addTexts(
		glContext, textCanvas, start, fontSizeLeyendaX, fontSizeLeyendaY, 
		"sin(time * 4.0 + 4.0 * 3.141592653589 * y) * 0.02",
		"sin(time * 4.0 + 4.0 * 3.141592653589 * x) * 0.02",
		[6.55, 8.65],
		["after", "19 years"],
		1.0,
		1.8,
		list);
		
	var scene = new Scene(list, textCanvas, glContext);
	this.sequencer.addScene(scene);
}

Intro.prototype.initializeScene3 = function (glContext, textCanvas) {		
	var start = getStart(2);
	var end = getEnd(2);
	var a = "VECDIV(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECMULTIPLY(VECCOS(VECSQR(VECADD(CREATEVECTOR(0.2230,X,0.1844),VECSQR(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECSQR(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECTAN(VECSIN(VECADD(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var b = "VECCOS(VECADD(VECSIN(VECTAN(VECTAN(CREATEVECTOR(0.5435,X,0.0763)))),VECDIV(VECSQR(VECCOS(CREATEVECTOR(0.7337,0.6061,0.9804))),VECMULTIPLY(VECCOS(CREATEVECTOR(X,Y,Y)),VECCOS(VECABS(CREATEVECTOR(Y,X,X)))))))";
	var c = "VECADD(VECMULTIPLY(VECMULTIPLY(VECSIN(CREATEVECTOR(X,Y,0.5138)),VECSIN(VECSIN(CREATEVECTOR(Y,Y,X)))),VECMULTIPLY(VECSUBSTRACT(VECCOS(CREATEVECTOR(X,Y,Y)),VECSUBSTRACT(CREATEVECTOR(X,X,X),VECSIN(VECSQR(CREATEVECTOR(Y,Y,0.7301))))),VECSUBSTRACT(VECCOS(VECSQR(CREATEVECTOR(X,X,X))),VECMULTIPLY(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y)))))),VECSIN(CREATEVECTOR(X,X,0.2810)))";
	
	var background = new BackgroundInterpolationObject(
		[a, b, c],
		1.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
	
	background.initialize(glContext);
	
	var list = [ background ];
	
	this.addTexts(
		glContext, textCanvas, start, fontSizeLeyendaX, fontSizeLeyendaY, 
		"sin(time * 4.0 + 4.0 * 3.141592653589 * y) * 0.02",
		"sin(time * 4.0 + 4.0 * 3.141592653589 * x) * 0.02",
		[4.6, 6.8, 8.60, 10.2, 12.22, 14.35],
		["finally", "its", "all", "about", "ascii", "code"],
		1.0,
		1.8,
		list);
		
	var scene = new Scene(list, textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeScene4 = function (glContext, textCanvas) {		
	var start = getStart(3);
	var end = getEnd(3);
	var a = "VECCOS(VECADD(VECSIN(VECTAN(VECTAN(CREATEVECTOR(0.5435,X,0.0763)))),VECDIV(VECSQR(VECCOS(VECSQR(CREATEVECTOR(0.9249,0.3733,0.7626)))),VECMULTIPLY(VECCOS(CREATEVECTOR(X,Y,Y)),VECCOS(VECABS(CREATEVECTOR(Y,X,X)))))))";
	var b = "VECSQR(VECADD(VECSIN(CREATEVECTOR(0.0858,0.2451,0.7434)),VECDIV(VECSQR(VECABS(CREATEVECTOR(0.4328,0.2288,0.3219))),VECMULTIPLY(VECCOS(CREATEVECTOR(X,Y,Y)),VECCOS(VECABS(CREATEVECTOR(Y,X,X)))))))";
	var c = "VECMULTIPLY(VECTAN(VECSUBSTRACT(VECCOS(VECADD(CREATEVECTOR(X,X,X),CREATEVECTOR(Y,Y,Y))),CREATEVECTOR(0.8120,0.7272,0.6734))),VECTAN(VECADD(VECSIN(CREATEVECTOR(X,X,X)),VECABS(VECCOS(CREATEVECTOR(Y,Y,Y))))))";
	
	var background = new BackgroundInterpolationObject(
		[ a, a, b, b, c, c, a, a, b, b, a, b, a, b],
		0.5,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);

	var effectX = "ABS((X-TIME / 15.0))";
	var effectY = "ABS(COS (X))";
	var fontTexture = "VECTAN(VECABS(VECMULTIPLY(VECCOS(VECMULTIPLY(VECSUBSTRACT(CREATEVECTOR(0.8047,TIME-11.0,0.3076),CREATEVECTOR(0.0111,0.3683,0.7230)),CREATEVECTOR(Y,Y,Y))),VECCOS(CREATEVECTOR(0.1449,Y,Y)))))";
	var fontBorderTexture = "vecsubstract(createvector(0.4348,0.3668,0.7623),vecdiv(vecsin(createvector(y,x,x)),vecadd(veccos(vecabs(createvector(x,x,x))),vecadd(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))))) ";
	var c1 = new TextObject(this.fontStyles["comment"], "M", effectX, effectY, fontTexture, fontBorderTexture, 
							[ new Fader(start, start + 2.0, end - 0.5, end) ], 
							new AnimationProperties(0.0, 0.0, 1.0, 1.0),
							textCanvas, glContext);

	var list = [ background, c1 ];
	
	this.addTexts(
		glContext, textCanvas, start, fontSizeLeyendaX, fontSizeLeyendaY, 
		"sin(time * 4.0 + 4.0 * 3.141592653589 * y) * 0.02",
		"sin(time * 4.0 + 4.0 * 3.141592653589 * x) * 0.02",
		[0.20, 2.0],
		["and", "chiptunes"],
		1.2,
		1.6,
		list); 
		
	background.initialize(glContext);
	var scene = new Scene(list, textCanvas, glContext);
	this.sequencer.addScene(scene);	
}

Intro.prototype.initializeScene5 = function (glContext, textCanvas) {		
	var start = getStart(4);
	var end = getEnd(4);
	var a = "VECDIV(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECMULTIPLY(VECCOS(VECSQR(VECADD(VECCOS(VECCOS(VECSQR(CREATEVECTOR(Y,X,0.5408)))),VECSIN(VECCOS(CREATEVECTOR(Y,X,Y)))))),VECSIN(VECCOS(VECABS(CREATEVECTOR(X,Y,X))))))";
	var b = "VECMULTIPLY(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECSUBSTRACT(VECCOS(VECSQR(VECADD(CREATEVECTOR(X,0.1579,0.1870),VECSQR(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECSQR(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECTAN(VECTAN(VECADD(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X)))))))) ";
	var c = "VECDIV(CREATEVECTOR(Y,0.3843,0.1653),VECADD(VECCOS(VECSQR(VECADD(VECADD(CREATEVECTOR(Y,Y,X),VECSQR(VECCOS(CREATEVECTOR(X,X,Y)))),VECSQR(VECTAN(CREATEVECTOR(X,X,X)))))),VECTAN(VECTAN(VECMULTIPLY(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var d = "VECDIV(CREATEVECTOR(Y,0.4960,X),VECSUBSTRACT(CREATEVECTOR(0.3089,0.3865,X),VECDIV(CREATEVECTOR(0.6229,0.5024,Y),VECDIV(VECCOS(VECSQR(CREATEVECTOR(0.1493,Y,0.9701))),VECDIV(VECTAN(VECSUBSTRACT(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y)))),VECABS(VECSIN(VECSQR(CREATEVECTOR(X,X,X)))))))))";
	var e = "VECADD(VECMULTIPLY(VECSUBSTRACT(VECCOS(CREATEVECTOR(X,Y,Y)),VECSUBSTRACT(CREATEVECTOR(X,0.8655,0.2657),VECTAN(CREATEVECTOR(0.0106,X,X)))),VECSQR(VECTAN(VECSQR(CREATEVECTOR(0.4360,X,X))))),VECSIN(CREATEVECTOR(X,X,0.2810)))";
	var f = "VECDIV(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECSUBSTRACT(VECCOS(VECSQR(VECADD(CREATEVECTOR(X,0.1579,0.1870),VECSQR(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECSQR(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECTAN(VECTAN(VECADD(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var g = "VECMULTIPLY(CREATEVECTOR(0.4762,0.2805,0.5222),VECADD(VECCOS(VECSQR(VECADD(CREATEVECTOR(0.3897,0.0352,Y),VECSQR(VECSQR(VECDIV(CREATEVECTOR(Y,Y,X),VECSQR(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECTAN(VECSQR(VECADD(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECCOS(CREATEVECTOR(Y,X,X))))))))";
	var h = "VECADD(VECDIV(VECCOS(CREATEVECTOR(Y,X,X)),VECSUBSTRACT(VECCOS(VECABS(CREATEVECTOR(Y,Y,X))),VECSUBSTRACT(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y))))),VECSQR(CREATEVECTOR(0.2807,0.5310,0.7941)))";
	var w = "VECMULTIPLY(VECADD(VECCOS(CREATEVECTOR(X,Y,Y)),VECDIV(VECSUBSTRACT(VECCOS(VECCOLORMAP(CREATEVECTOR(X,Y,0.5092),CREATEVECTOR(X,0.8838,Y),CREATEVECTOR(Y,Y,Y))),VECSUBSTRACT(CREATEVECTOR(X,0.8655,0.2657),VECCOS(VECSQR(CREATEVECTOR(Y,Y,0.7301))))),VECSUBSTRACT(VECCOS(VECSQR(CREATEVECTOR(X,X,X))),VECMULTIPLY(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y)))))),VECSIN(CREATEVECTOR(0.5298,0.6165,0.7772)))";
	var i = "VECMULTIPLY(CREATEVECTOR(Y,0.9766,X),VECMULTIPLY(VECCOS(VECSQR(VECADD(CREATEVECTOR(0.3897,0.0352,Y),VECSQR(VECSQR(VECDIV(CREATEVECTOR(Y,Y,X),VECSIN(VECADD(VECABS(CREATEVECTOR(X,Y,Y)),VECTAN(VECCOS(CREATEVECTOR(Y,X,X))))))))))),VECSIN(VECSIN(VECSUBSTRACT(VECABS(CREATEVECTOR(X,Y,Y)),VECTAN(VECCOS(CREATEVECTOR(Y,X,X))))))))";
	var ii = "VECMULTIPLY(CREATEVECTOR(X,0.2385,0.7130),VECDIV(VECCOS(CREATEVECTOR(Y,X,X)),VECSUBSTRACT(VECCOS(VECABS(CREATEVECTOR(Y,Y,X))),VECADD(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y))))))";
	var j = "VECDIV(VECDIV(VECSQR(CREATEVECTOR(0.6564,0.8339,0.9091)),VECADD(VECCOS(CREATEVECTOR(Y,X,0.9622)),VECABS(VECABS(VECCOS(CREATEVECTOR(X,Y,X)))))),VECSUBSTRACT(VECCOS(CREATEVECTOR(Y,X,Y)),VECABS(VECABS(VECSIN(CREATEVECTOR(X,Y,X))))))";
	var x = "VECMULTIPLY(VECMULTIPLY(VECMULTIPLY(VECCOS(CREATEVECTOR(X,TIME * 2.0,X)),VECSIN(CREATEVECTOR(Y,X,Y))),VECABS(VECTAN(CREATEVECTOR(X,X,X)))),VECSIN(CREATEVECTOR(TIME * 2.0,Y,Y)))"; 
	var t = "VECMULTIPLY(VECADD(VECCOS(CREATEVECTOR(X,Y,Y)),VECDIV(VECADD(VECCOS(VECCOLORMAP(CREATEVECTOR(X,Y,0.5092),CREATEVECTOR(X,0.8838,Y),CREATEVECTOR(Y,Y,Y))),VECSUBSTRACT(CREATEVECTOR(X,0.8464,Y),VECCOS(VECSQR(CREATEVECTOR(Y,Y,0.7301))))),VECSUBSTRACT(VECCOS(VECSQR(CREATEVECTOR(X,X,X))),VECMULTIPLY(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y)))))),VECSIN(CREATEVECTOR(0.5298,0.6165,0.7772)))";
	var rr = "VECDIV(CREATEVECTOR(0.5563,0.3002,X),VECDIV(VECCOS(VECSQR(VECTAN(CREATEVECTOR(Y,X,Y)))),VECTAN(VECSIN(VECSUBSTRACT(VECSIN(CREATEVECTOR(X,Y,X)),VECSIN(VECABS(CREATEVECTOR(0.7565,0.8848,Y))))))))";
	var xx = "VECADD(VECMULTIPLY(VECSUBSTRACT(VECCOS(CREATEVECTOR(X,Y,Y)),VECSUBSTRACT(CREATEVECTOR(X,0.8655,0.2657),VECSIN(CREATEVECTOR(0.0106,X,X)))),VECSQR(VECTAN(VECSQR(CREATEVECTOR(Y,X,Y))))),VECSIN(CREATEVECTOR(Y,X,Y)))";
	var tt = "VECMULTIPLY(VECMULTIPLY(VECMULTIPLY(VECCOS(CREATEVECTOR(X,TIME * 2.0,X)),VECSIN(CREATEVECTOR(Y,X,Y))),VECABS(VECTAN(CREATEVECTOR(X,X,X)))),VECSIN(CREATEVECTOR(TIME * 2.0,Y,Y)))";
		
	// #NOTE: Max size limit reached :(
	var background = new BackgroundInterpolationObject(
		[c, b, f, d, a, rr, e, xx, i, ii,  h, j, g, t, t, tt, t, tt, t, tt, tt],
		1.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
	
	background.initialize(glContext);

	var list = [ background ];	
	
	this.addTexts(
		glContext, textCanvas, start, fontSizeLeyendaX, fontSizeLeyendaY, 
		"sin(time * 4.0 + 4.0 * 3.14159 * y) * 0.02",
		"sin(time * 4.0 + 4.0 * 3.14159 * x) * 0.02",
		[0.0, 1.35, 2.7, 4.05, 5.4, 6.75, 8.10],
		["we", "proudly", "salute", "our", "old", "dead", "friends"],
		1.25,
		1.8,
		list);

	var scene = new Scene(list, textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeScene6 = function (glContext, textCanvas) {		
	var start = getStart(5);
	var end = getEnd(5);
	var a = "VECMULTIPLY(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECSUBSTRACT(VECCOS(VECSQR(VECADD(CREATEVECTOR(X,0.1579,0.1870),VECSQR(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECTAN(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECSQR(VECTAN(VECSUBSTRACT(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var b = "VECMULTIPLY(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECSUBSTRACT(VECCOS(VECSQR(VECADD(CREATEVECTOR(Y,0.9574,0.3637),VECTAN(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECTAN(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECSQR(VECTAN(VECSUBSTRACT(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var d = "VECMULTIPLY(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECSUBSTRACT(VECCOS(VECSQR(VECADD(CREATEVECTOR(0.7337,0.2008,0.2437),VECSQR(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECTAN(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECSQR(VECTAN(VECSUBSTRACT(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var e = "VECDIV(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECSUBSTRACT(VECCOS(VECSQR(VECADD(CREATEVECTOR(Y,Y,X),VECSQR(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECTAN(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECSQR(VECTAN(VECSUBSTRACT(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var dd = "VECDIV(VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437)),VECSUBSTRACT(VECCOS(VECSQR(VECADD(CREATEVECTOR(0.7337,0.2008,0.2437),VECSQR(VECCOS(VECADD(CREATEVECTOR(Y,Y,X),VECTAN(VECCOS(CREATEVECTOR(X,X,Y))))))))),VECSQR(VECTAN(VECSUBSTRACT(VECSIN(CREATEVECTOR(X,Y,Y)),VECSIN(VECABS(CREATEVECTOR(Y,X,X))))))))";
	var f = "VECMULTIPLY(CREATEVECTOR(X,0.2385,0.7130),VECDIV(CREATEVECTOR(0.5576,X,X),VECSUBSTRACT(CREATEVECTOR(X,Y,Y),VECSUBSTRACT(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y))))))";
	var ff = "VECMULTIPLY(CREATEVECTOR(X,0.2385,0.7130),VECDIV(CREATEVECTOR(0.5576,X,X),VECSUBSTRACT(CREATEVECTOR(X,Y,Y),VECSUBSTRACT(VECSQR(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y))))))";

	var effectX = "sin(time * 4.0 + 4.0 * 3.14159 * y) * 0.02";
	var effectY = "sin(time * 4.0 + 4.0 * 3.14159 * x) * 0.02";	
	var ansi = new LogoObject("logo-one-pwr2", effectX, effectY,
							 [ new Fader(start + 4.0, start + 6.5, end - 0.5, end) ], 
 							  new AnimationProperties(0.0, 0.0, 1.0, 1.0),
							  textCanvas, 
							  1024,
							  glContext,
							  0.0,
							  0);
	
	var background = new BackgroundInterpolationObject(
		[b, a, b, a, b, a, b, d, dd],
		0.5,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
	
	background.initialize(glContext);

	var scene = new Scene([ background, ansi ], textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeScene7 = function (glContext, textCanvas) {		
	var start = getStart(6);
	var end = getEnd(6);
	
	var balls = new RotationBalls(
		[5, 4, 5, 3, 6, 0],
		[3.0, 1.0, 0.5, 0.25, 0.10, 0.05, 0.02, 0.01],
		[8.5, 3.3, 1.2, 0.45, 0.25, 0.11, 0.05],
		function (node) {
			var result = {};
			result.x = 0.0;
			result.y = 1.5 * node.level;
			result.z = 0.1 * (1 + node.level * 4);
			return result;
		},
		"vecadd(vectan(createvector(0.7337,0.2008,0.2437)),vecmultiply(vecmultiply(vectan(vecsubstract(vecmultiply(vectan(vecsubstract(vecsqr(createvector(x,y,y)),vecsin(vecabs(createvector(y,x,x))))),vecsin(createvector(0.0748,0.0758,0.0612))),vecsin(veccos(createvector(0.8157,y,0.7878))))),vecabs(veccos(createvector(y,time,0.4963)))),vecsin(veccos(vecabs(createvector(y,x,x))))))"
		);
	balls7 = balls; 
	
	var background = new BackgroundInterpolationObject(
		["VECADD(VECCOS(CREATEVECTOR(X,Y,0.2621)),VECSUBSTRACT(VECSIN(CREATEVECTOR(Y,Y,X)),VECSUBSTRACT(VECCOS(VECSQR(CREATEVECTOR(Y,Y,0.8839))),VECMULTIPLY(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y))))))",
		 "VECMULTIPLY(VECCOS(VECSUBSTRACT(VECCOS(VECSUBSTRACT(CREATEVECTOR(X,X,X),VECSQR(CREATEVECTOR(0.6954,0.4549,0.1528)))),CREATEVECTOR(Y,Y,Y))),VECTAN(VECDIV(CREATEVECTOR(0.8998,X,Y),CREATEVECTOR(0.6947,0.1799,Y))))"
		],
		3.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
	background.globalXRef = 8.6;
	background.globalYRef = 0.8;
	background.globalScale = 1.6;
	
	background.initialize(glContext);
	balls.initialize(glContext);
	
	var scene = new Scene([ background, balls ], textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeScene8 = function (glContext, textCanvas) {		
	var start = getStart(7);
	var end = getEnd(7);

	var balls = new RotationBalls(
		[3, 12, 3, 3, 3, 0],
		[0.0, 1.0, 0.5, 0.25, 0.10, 0.05, 0.02, 0.01],
		[8.5, 3.3, 1.2, 0.45, 0.25, 0.11, 0.05],
		function (node) {
			var result = {};
			result.x = Math.sin(1.5 * node.level);
			result.y = 0.0;
			result.z = 0.1 * (1 + node.level * 4);
			return result;
		},
		"vecadd(vectan(createvector(0.7337,0.2008,0.2437)),vecmultiply(vecmultiply(vectan(vecsubstract(vecmultiply(vectan(vecsubstract(vecsqr(createvector(x,y,y)),vecsin(vecabs(createvector(y,x,x))))),vecsin(createvector(0.0748,0.0758,0.0612))),vecsin(veccos(createvector(0.8157,y,0.7878))))),vecabs(veccos(createvector(y,time,0.4963)))),vecsin(veccos(vecabs(createvector(y,x,x))))))"
		);

	var background = new BackgroundInterpolationObject(
		[	"VECDIV(CREATEVECTOR(Y,0.4960,X),VECSUBSTRACT(CREATEVECTOR(0.3089,0.3865,X),VECDIV(CREATEVECTOR(0.6229,0.5024,Y),VECDIV(VECCOS(VECSQR(CREATEVECTOR(Y,Y,X))),VECDIV(VECTAN(VECSUBSTRACT(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y)))),VECABS(VECSIN(VECSQR(CREATEVECTOR(X,X,X)))))))))"
		],
		1.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
	background.globalXRef = 8.6;
	background.globalYRef = 0.8;
	background.globalScale = 1.6;
						 
	background.initialize(glContext);
	balls.initialize2(glContext, balls7.shaderProgram);

	var scene = new Scene([ background, balls, ballColumn1, ballColumn2 ], textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeScene9 = function (glContext, textCanvas) {		
	var start = getStart(8);
	var end = getEnd(8);

	var balls = new RotationBalls(
		[7, 6, 3, 3, 3, 0],
		[0.0, 1.0, 0.5, 0.25, 0.10, 0.05, 0.02, 0.01],
		[8.5, 3.3, 1.2, 0.45, 0.25, 0.11, 0.05],
		function (node) {
			var result = {};
			result.x = 0.1;
			result.y = 0.9;
			result.z = 0.1 * (1 + node.child);
			return result;
		},
		"vecadd(vectan(createvector(0.7337,0.2008,0.2437)),vecmultiply(vecmultiply(vectan(vecsubstract(vecmultiply(vectan(vecsubstract(vecsqr(createvector(x,y,y)),vecsin(vecabs(createvector(y,x,x))))),vecsin(createvector(0.0748,0.0758,0.0612))),vecsin(veccos(createvector(0.8157,y,0.7878))))),vecabs(veccos(createvector(y,time,0.4963)))),vecsin(veccos(vecabs(createvector(y,x,x))))))"
		);
	//balls.ballDetail = 6;

	var background = new BackgroundInterpolationObject(
		[ "VECMULTIPLY(VECCOS(VECSUBSTRACT(VECCOS(VECSUBSTRACT(CREATEVECTOR(X,X,X),VECSQR(CREATEVECTOR(0.6954,0.4549,0.1528)))),CREATEVECTOR(Y,Y,Y))),VECTAN(VECDIV(CREATEVECTOR(0.8998,X,Y),CREATEVECTOR(0.6947,0.1799,Y))))"
		],
		1.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
	background.globalXRef = 8.6;
	background.globalYRef = 0.8;
	background.globalScale = 1.6;

	background.initialize(glContext);
	balls.initialize2(glContext, balls7.shaderProgram);
	
	var scene = new Scene([ background, balls ], textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeScene10 = function (glContext, textCanvas) {		
	var start = getStart(9);
	var end = getEnd(9);
	var a = replaceAll("X", "(X + (TIME - 130.0) / 5.0)",
		"VECMULTIPLY(CREATEVECTOR(X,0.2385,0.7130),VECDIV(CREATEVECTOR(0.5576,X,X),VECSUBSTRACT(CREATEVECTOR(X,Y,Y),VECSUBSTRACT(VECTAN(CREATEVECTOR(Y,X,X)),VECTAN(CREATEVECTOR(X,Y,Y))))))");
	var b = replaceAll("X", "(X + (TIME - 130.0) / 5.0)",	
		"VECDIV(VECCOS(VECADD(VECSUBSTRACT(CREATEVECTOR(X,X,X),CREATEVECTOR(Y,Y,Y)),CREATEVECTOR(0.2301,X,0.5006))),VECABS(VECADD(CREATEVECTOR(0.4323,0.6904,0.8312),VECABS(VECSIN(CREATEVECTOR(X,X,0.1817))))))");
	var c = replaceAll("X", "(X + (TIME - 130.0) / 5.0)",		
		"VECMULTIPLY(VECMULTIPLY(VECMULTIPLY(VECCOS(CREATEVECTOR(X,TIME,X)),VECSIN(CREATEVECTOR(Y,X,Y))),VECABS(VECTAN(CREATEVECTOR(X,X,X)))),VECSIN(CREATEVECTOR(TIME,Y,Y)))");
	
	var background = new BackgroundInterpolationObject(
		[ a, a, a, a, a, b, b, b, b, b, c, c, c, c, c ],
		1.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
	
	background.initialize(glContext);
	var scene = new Scene([ background ], textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeScene11 = function (glContext, textCanvas) {		
	var start = getStart(10);
	var end = getEnd(10);
	
	var background = new BackgroundInterpolationObject(
	[  	"VECDIV(CREATEVECTOR(0.5589,0.5945,0.9570),VECSUBSTRACT(CREATEVECTOR(Y,TIME,X),VECADD(VECCOS(CREATEVECTOR(X,0.8116,0.3758)),VECCOS(VECABS(VECADD(CREATEVECTOR(TIME,TIME,TIME),VECMULTIPLY(CREATEVECTOR(X,Y,Y),VECADD(VECCOS(CREATEVECTOR(X,Y,Y)),VECABS(VECABS(CREATEVECTOR(Y,X,X)))))))))))" 
	],
	1.0,
	[ new Fader(start, start + 0.50, end - 2.5, end) ]);
	
	var effectX = "sin(time * 4.0 + 4.0 * 3.14159 * y) * 0.005";
	var effectY = "sin(time * 4.0 + 4.0 * 3.14159 * x) * 0.005";	
	var logo = new LogoObject("logo-pvm-pwr2", effectX, effectY,
							 [ new Fader(start + 0.5, start + 1.0, end - 0.5, end) ], 
 							  new AnimationProperties(0.5, 2.5, 2.0, 4.0),
							  textCanvas, 
							  512,
							  glContext,
							  1.0,
							  0);
	background.wiggle = 0.0;
	background.initialize(glContext);

	var list = [ background, logo ];
	var times = [];
	var elements = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"];
	
	for (var index=0; index< elements.length; index++) {
		times.push((index + 1) * 2.5);
	}

	this.addTextsGreets(
		glContext, textCanvas, start, 20.0, 20.0, 
		"sin(time * 4.0 + 4.0 * 3.14159 * y) * 0.01",
		"sin(time * 4.0 + 4.0 * 3.14159 * x) * 0.01",
		[30.0, 32.5, 35.0],
		["code by octavo", "gfx by arlek", "music by uctumi"],
		1.0,
		1.8,
		list);

	this.addTextsGreetsDiz(
		glContext, textCanvas, start, 3.0, 3.0, 
		"sin(time * 4.0 + 4.0 * 3.14159 * y) * 0.001",
		"sin(time * 4.0 + 4.0 * 3.14159 * x) * 0.001",
		times,
		elements,
		2.8,
		1.8,
		list);

	var scene = new Scene(list, textCanvas, glContext);
	this.sequencer.addScene(scene);		
}

Intro.prototype.initializeSceneMenu = function (glContext, textCanvas) {
	var menu = new MenuObject();
	var scene = new Scene([ menu ], textCanvas, glContext);
	this.sequencer.addScene(scene);
}

Intro.prototype.initializeScene12 = function (glContext, textCanvas) {		
	var start = getStart(11);
	var end = getEnd(11);

	var balls = new RotationBalls(
		[4, 3, 4, 3, 2, 2, 1, 0], 
		[0.0, 1.8, 1.61, 0.54, 0.40, 0.35, 0.21], 
		[1.8 , 5.1, 1.87, 1.41, 1.3, 1.11], 
		function (node) {
			var result = {};
			var value = timerValue();
			result.x = 0.09 * (value - start) * Math.cos(node.level);
			result.y = 0.05 * Math.sin(node.level) *  Math.cos(value - start);
			result.z = 0.7 / Math.cos(node.level * (value / 500.0 - start));
			return result;
		},
		"vecdiv(vecdiv(vecsqr(createvector(0.8381,0.1180,0.5559)),vecadd(veccos(createvector(y,x,0.9622)),vecabs(vecabs(veccos(vectan(createvector(0.4207,y,y))))))),vecadd(veccos(createvector(y,x,y)),vecabs(vecabs(vecsin(createvector(x,y,x))))))"
		);
	
	var a = "(VECSUBSTRACT(CREATEVECTOR(0.8047,TIME,0.3076),CREATEVECTOR( 0.7337,TIME*0.2008,0.2437)))"; 
	var b = "VECADD(VECMULTIPLY(VECCOS(VECMULTIPLY(VECSUBSTRACT(CREATEVECTOR(0.1047,TIME,0.3076),CREATEVECTOR(0.3042,X,0.4730)),CREATEVECTOR(Y,Y,Y))),VECTAN(CREATEVECTOR(0.1449,Y,Y))),CREATEVECTOR(Y,0.3816,0.0614))"
	var c = "VECDIV(VECTAN(CREATEVECTOR(0.1337,0.9008,0.6437)),VECSUBSTRACT(CREATEVECTOR(0.6990,0.1617,0.1529),VECSQR(VECSIN(VECSUBSTRACT(VECCOS(CREATEVECTOR(TIME,TIME,TIME)),VECMULTIPLY(VECSIN(CREATEVECTOR(X,Y,Y)),VECCOS(VECABS(CREATEVECTOR(Y,X,X)))))))))"; 
	
	var effectX = "sin(time * 4.0 + 4.0 * 3.14159 * y) * 0.02";
	var effectY = "sin(time * 4.0 + 4.0 * 3.14159 * x) * 0.02";

	var background = new BackgroundInterpolationObject(
		[a, b, c],
		5,
		[ new Fader(start, start + 0.5, end - 0.5, end) ]);
	
	var o1 = new TextObject(this.fontStyles["comment"], "back", effectX, effectY, fontTextureEffect2, fontBorderTextureEffect2, 
								 [ new Fader(start + 0.3, start + 1.3, start + 2.5, start + 3.0) ],
								 new AnimationProperties(0, 1, 10, 10),
								 textCanvas, glContext);
	o1.shadowEffectLayers = 15;
	o1.displacementCompression = 1.8;
	
	var o2 = new TextObject(this.fontStyles["comment"], "from", effectX, effectY, fontTextureEffect2, fontBorderTextureEffect2, 
								 [ new Fader(start + 2.8, start + 3.3, start + 4.5, start + 5.0) ],
								 new AnimationProperties(7, 1, 10, 10),
								 textCanvas, glContext); 
	o2.shadowEffectLayers = 15;
	o2.displacementCompression = 1.8;
	
	var o3 = new TextObject(this.fontStyles["comment"], "1996", effectX, effectY, fontTextureEffect2, fontBorderTextureEffect2, 
								 [ new Fader(start + 4.60, start + 5.2, start + 6.5, start + 7.0) ],
								 new AnimationProperties(0, 9, 10, 10),
								 textCanvas, glContext); 
	o3.shadowEffectLayers = 15;
	o3.displacementCompression = 1.8;
	
	var o4 = new TextObject(this.fontStyles["comment"], "scene", effectX, effectY, fontTextureEffect2, fontBorderTextureEffect2, 
								 [ new Fader(start + 6.9, start + 7.4, start + 8.5, start + 9.0) ],
								 new AnimationProperties(7, 9, 10, 10),
								 textCanvas, glContext);
	o4.shadowEffectLayers = 15;
	o4.displacementCompression = 1.8;
	
	background.initialize(glContext);
	balls.initialize(glContext);
	
	var scene = new Scene([background, balls, o1, o2, o3, o4], textCanvas, glContext);
	this.sequencer.addScene(scene);	
}

Intro.prototype.initializeScene13 = function (glContext, textCanvas) {		
	var start = getStart(12);
	var end = getEnd(12);
		
	var balls = new RotationBalls(
		[4, 3, 5, 3, 2, 2, 0], 
		[0.0, 0.8, 0.61, 0.54, 0.40, 0.35, 0.21, 0.17], 
		[19.8 , 6.1, 3.87, 1.71, 2.1, 1.11, 0.4], 
		function (node) {
			var result = {};
			var value = timerValue();
			result.x = 0.09 * (value - start) * Math.cos(node.level);
			result.y = 0.05 * Math.cos(node.level) * (value - start);
			result.z = 0.4 / Math.cos(node.level * (value / 2000.0 - start));
			return result;
		},
		"vecmultiply(vecmultiply(vecmultiply(veccos(createvector(x,time,x)),vecsin(createvector(y,x,y))),vecabs(vectan(createvector(x,x,x)))),createvector(0.7120,0.0284,y))"
		);
	balls.ballDetail = 5;
	
	var ballsCenter = new RotationBalls(
		[2, 3, 4, 0], 
		[3.0, 1.9, 1.25, 0.375], 
		[5.5 , 3.1, 2.2, 1.1], 
		function (node) {
			var result = {};
			var value = timerValue();
			result.x = 0.29 * (value - start) * Math.cos(node.level);
			result.y = 0.4 * Math.cos(node.level) * (value - start);
			result.z = 0.4 / Math.cos(node.level * (value / 200.0 - start));
			return result;
		},
		"vecmultiply(vecmultiply(vecmultiply(veccos(createvector(x,time,x)),vecsin(createvector(y,x,y))),vecabs(vectan(createvector(x,x,x)))),createvector(0.7120,0.0284,y))"
		);
		
	balls13 = balls;

	var a = "VECTAN(CREATEVECTOR(0.7337,0.2008,0.2437))"; 
	var b = "VECADD(VECMULTIPLY(VECCOS(VECMULTIPLY(VECSUBSTRACT(CREATEVECTOR(0.8047,TIME,0.3076),CREATEVECTOR(0.3042,X,0.4730)),CREATEVECTOR(Y,Y,Y))),VECTAN(CREATEVECTOR(0.1449,Y,Y))),CREATEVECTOR(Y,0.3816,0.0614))"
	var c = "VECDIV(VECTAN(CREATEVECTOR(0.1337,0.9008,0.6437)),VECSUBSTRACT(CREATEVECTOR(0.6990,0.1617,0.1529),VECSQR(VECSIN(VECSUBSTRACT(VECCOS(CREATEVECTOR(TIME,TIME,TIME)),VECMULTIPLY(VECSIN(CREATEVECTOR(X,Y,Y)),VECCOS(VECABS(CREATEVECTOR(Y,X,X)))))))))"; 
	
	var background = new BackgroundInterpolationObject(
		[a, b, c],
		5,
		[ new Fader(start, start + 0.5, end - 0.5, end) ]);
	
	background.initialize(glContext);
	balls.initialize(glContext);	
	ballsCenter.initialize2(glContext, balls7.shaderProgram);
	
	var scene = new Scene([ background, balls, ballsCenter], textCanvas, glContext);
	this.sequencer.addScene(scene);	
}

Intro.prototype.initializeScene14 = function (glContext, textCanvas) {		
	var start = getStart(13);
	var end = getEnd(13);
	
	// Logo
	var timeVar = "TIME * 3.0";
	var effectX = "DIVIDEPROTECTED(DIVIDEPROTECTED((DIVIDEPROTECTED(" + timeVar + ",((SIN(7.0000)-Y)-X))*5.0000),SQR(" + timeVar + "))," + timeVar + ")";
	var effectY = "2.0";
	var fontTexture = "vecdiv(createvector(y,0.4960,x),vecsubstract(createvector(x,y,x),vecdiv(createvector(0.6722,x,x),vecdiv(veccos(vecsqr(createvector(y,y,y))),vecdiv(vectan(vecsubstract(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))),vecabs(vecsin(vecsqr(createvector(x,x,x)))))))))";
	var fontBorderTexture = "vecsubstract(createvector(0.4348,0.3668,0.7623),vecdiv(vecsin(createvector(y,x,x)),vecadd(veccos(vecabs(createvector(x,x,x))),vecadd(vectan(createvector(y,x,x)),vectan(createvector(x,y,y)))))) ";
	var logo = new TextObject(this.fontStyles["logo"], "PVM", effectX, effectY, fontTexture, fontBorderTexture, 
							  [ new Fader(5.0, 7.0, 12.0, 13.0) ], 
							  new AnimationProperties(0, 2, 3, 3), 
							  textCanvas, glContext);
							  
	var balls = new RotationBalls(
		[6, 3, 4, 3, 2, 2], 
		[0.0, 1.8, 1.61, 0.54, 0.40, 0.35], 
		[2.8 , 5.1, 1.87, 1.41, 1.3],
		function (node) {
			var result = {};
			result.x = Math.random() * 5.0;
			result.y = 0.01; 
			result.z = Math.sin(Math.random() * 265) * 1.0;
			return result;
		},"vecadd(vectan(vecsin(createvector(0.6191,0.5560,0.9758))),vecmultiply(vecmultiply(vectan(vecsubstract(vecmultiply(vectan(vecsubstract(vecabs(createvector(x,y,y)),vecsin(vecabs(createvector(y,x,x))))),vecsin(createvector(0.0748,0.0758,0.0612))),vecsin(veccos(createvector(0.8157,y,0.7878))))),vecabs(veccos(createvector(y,time,0.4963)))),vecsin(veccos(vecabs(createvector(y,x,x))))))"
		);

	var background = new BackgroundInterpolationObject(
		[ 	
		"VECDIV(CREATEVECTOR(0.4583,0.3258,0.9447),VECMULTIPLY(VECCOS(CREATEVECTOR((X+TIME/1000.0),Y,(X+TIME/1000.0))),VECSUBSTRACT(VECCOS(VECSQR(CREATEVECTOR((X+TIME/1000.0),(X+TIME/1000.0),(X+TIME/1000.0)))),VECADD(VECTAN(CREATEVECTOR(Y,(X+TIME/1000.0),(X+TIME/1000.0))),VECTAN(CREATEVECTOR((X+TIME/1000.0),Y,Y))))))",
		"VECCOS(VECADD(VECSQR(CREATEVECTOR(Y,Y,Y)),VECDIV(VECABS(CREATEVECTOR(0.8945,0.6784,0.5299)),VECMULTIPLY(VECCOS(CREATEVECTOR(X,Y,Y)),VECCOS(VECABS(CREATEVECTOR(Y,X,X)))))))"
		],
		3.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);
						 
	background.initialize(glContext);
	balls.initialize(glContext);
	
	var scene = new Scene([ background, balls, logo, ballColumn1, ballColumn2 ], textCanvas, glContext);
	this.sequencer.addScene(scene);	
}

Intro.prototype.initializeScene15 = function (glContext, textCanvas) {		
	var start = getStart(14);
	var end = getEnd(14);

	var balls = new RotationBalls(
		[45, 20, 3, 0],	
		[0.0, 1.0, 0.3, 0.1],
		[8.5, 3.3, 1.2, 0.25, 0.25],
		function (node) {
			var result = {};
			result.x = Math.sin(1.5 * node.level);
			result.y = 0.0;
			result.z = 0.1 * (1 + node.level * 4);
			return result;
		},
		"vecadd(vectan(createvector(0.7337,0.2008,0.2437)),vecmultiply(vecmultiply(vectan(vecsubstract(vecmultiply(vectan(vecsubstract(vecsqr(createvector(x,y,y)),vecsin(vecabs(createvector(y,x,x))))),vecsin(createvector(0.0748,0.0758,0.0612))),vecsin(veccos(createvector(0.8157,y,0.7878))))),vecabs(veccos(createvector(y,time,0.4963)))),vecsin(veccos(vecabs(createvector(y,x,x))))))"
		);
	balls.ballDetail = 5;
	
	var background = new BackgroundInterpolationObject(
		[	"VECDIV(VECCOS(VECSUBSTRACT(VECABS(CREATEVECTOR(0.3097,0.9374,(Y+TIME/2.0))),CREATEVECTOR((Y+TIME/2.0),0.0430,X))),VECSUBSTRACT(VECSIN(CREATEVECTOR((Y+TIME/2.0),(Y+TIME/2.0),X)),VECDIV(VECCOS(VECSQR(CREATEVECTOR(X,X,X))),VECMULTIPLY(VECTAN(CREATEVECTOR((Y+TIME/2.0),X,X)),VECTAN(CREATEVECTOR(X,(Y+TIME/2.0),(Y+TIME/2.0)))))))"
		],
		1.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);

	background.initialize(glContext);
	balls.initialize(glContext);
	
	var scene = new Scene([ background, balls ], textCanvas, glContext);
	this.sequencer.addScene(scene);	
}

Intro.prototype.initializeScene16 = function (glContext, textCanvas) {		
	var start = getStart(15);
	var end = getEnd(15);

	var background = new BackgroundInterpolationObject(
		[ "CREATEVECTOR(0.0, 0.0, 0.0)" ],
		1.0,
		[ new Fader(start, start + 0.50, end - 0.5, end) ]);

	background.initialize(glContext);
	var scene = new Scene([ background ], textCanvas, glContext);
	this.sequencer.addScene(scene);	
}
