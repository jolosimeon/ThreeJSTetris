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
		renderer, container,
		controls, keyboard,
		starSphere,
		cube;

window.addEventListener('load', init, false);

function init () {
	// set up the scene, the camera and the renderer
	createScene();
	createBackground();
	initObjects();
	moveCube();

	// add the lights
	//createLights();

	// add the objects
	//createPlane();
	//createSea();
	//createSky();

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

	camera.position.z = 5;

	controls = new THREE.OrbitControls(camera);
  controls.addEventListener('change', render);

	keyboard	= new THREEx.KeyboardState();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	document.body.appendChild( renderer.domElement );
	renderer.shadowMap.enabled = true;

	// Add the DOM element of the renderer to the
	// container we created in the HTML
	container = document.getElementById('world');
	container.appendChild(renderer.domElement);

	// Listen to the screen: if the user resizes it
	// we have to update the camera and the renderer size
	window.addEventListener('resize', handleWindowResize, false);
}

function createBackground() {
	var geometry  = new THREE.SphereGeometry(90, 32, 32);
	// create the material, using a texture of starfield
	var material  = new THREE.MeshBasicMaterial();
	material.map   = THREE.ImageUtils.loadTexture('images/galaxy_starfield.png');
	material.side  = THREE.BackSide;
	// create the mesh based on geometry and material
	starSphere  = new THREE.Mesh(geometry, material);
	scene.add(starSphere);
}

function initObjects() {
	var geometry = new THREE.BoxGeometry( 1, 1, 1 );
	var material = new THREE.MeshBasicMaterial( { color: 0x00ff00, wireframe: true} );
	cube = new THREE.Mesh(geometry, material );
	scene.add(cube);
}


function moveCube() {
	if (keyboard.pressed("S")) {
		cube.position.y -= 0.1;
	}
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function loop(){
	//cube.rotation.x += 0.1;
  starSphere.rotation.y += 0.0005;
  moveCube();
	// render the scene
	render();

	// call the loop function again
	requestAnimationFrame(loop);
}

function render() {
	renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
}
