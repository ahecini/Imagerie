

// =====================================================
// Mouse management
// =====================================================
var renderData = {
	mouseDown:false,
	lastMouseX: null,
	lastMouseY: null,
	dist:-2.4,
};

var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;
var rotY = 0;
var rotX = 0;
var rotZ = 0;
var trX = 0;
var trY = 0;

// =====================================================
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}


// =====================================================
window.requestAnimFrame = (function()
{
	return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback,
									/* DOMElement Element */ element)
         {
            window.setTimeout(callback, 1000/60);
         };
})();



// ==========================================
function tick() {
	requestAnimFrame(tick);
	drawScene();
}


// =====================================================
function handleKeyDown(e) {

	switch(e.keyCode){
	default:
		//console.log("KEY: "+e.keyCode);
	}
}
// =====================================================
function handleMouseWheel(event) {
		renderData.dist += event.deltaY/500.0;
		if(renderData.dist > -0.5) renderData.dist=-0.5;
		drawScene();
}

// =====================================================
function handleMouseDown(event) {
	renderData.mouseDown = true;
	renderData.lastMouseX = event.clientX;
	renderData.lastMouseY = event.clientY;
	drawScene();
}


// =====================================================
function handleMouseUp(event) {
	renderData.mouseDown = false;
}


// =====================================================
function handleMouseMove(event) {

	if (!renderData.mouseDown) return;

	var newX = event.clientX;
	var newY = event.clientY;
	var deltaX = newX - renderData.lastMouseX;
	var deltaY = newY - renderData.lastMouseY;

	if(event.shiftKey) {
		renderData.dist += deltaY/100.0;
		if(renderData.dist > -0.5) renderData.dist=-0.5;
	} else if(event.ctrlKey) {
		trX += deltaX/500.0;
		trY -= deltaY/500.0;
	} else {

		rotZ += degToRad(deltaX / 2);
		rotX += degToRad(deltaY / 2);

		mat4.identity(rotMatrix);
		mat4.rotate(rotMatrix, rotX, [1, 0, 0]);
		mat4.rotate(rotMatrix, rotZ, [0, 0, 1]);
	}

	renderData.lastMouseX = newX
	renderData.lastMouseY = newY;

	drawScene();
}





//
