var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

var scene,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container;

window.addEventListener('load', init, false);
function init () {
	// set up the scene, the camera and the renderer
	createScene();

	// add the lights
	createLights();

	// add the objects
	createPlane();
	createSea();
	createSky();

	// start a loop that will update the objects' positions
	// and render the scene on each frame
	loop();
}

function createScene() {
	scene = new THREE.Scene();
	fieldOfView = 75;
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	aspectRatio = WIDTH/HEIGHT;
	nearPlane = 0.1
	farPlane = 1000;

	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	document.body.appendChild( renderer.domElement );
}



var geometry = new THREE.BoxGeometry( 1, 1, 1 );
var material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
var cube = new THREE.Mesh( geometry, material );
scene.add( cube );

camera.position.z = 5;

var render = function () {
  requestAnimationFrame( render );

  cube.rotation.x += 0.1;
  cube.rotation.y += 0.1;

  renderer.render(scene, camera);
};

render();
