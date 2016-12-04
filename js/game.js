var Colors = {
	red:0xf25346,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

var scene, scene2,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container,
		controls, keyboard,
		starSphere,
		GRID_X, GRID_Y, GRID_Z,
		cube, geoCube, CUBE_SIDE,
		stepTime, accTime, frameTime, lastFrameTime, clock,
		gameOver, gamePause;

var grid = new Array();

window.addEventListener('load', init, false);

function init () {
	// set up the scene, the camera and the renderer
	createScene();
	createBackground();
	initObjects();
	makeGrid();
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
	scene2 = new THREE.Scene();
	fieldOfView = 75;
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	aspectRatio = WIDTH/HEIGHT;
	nearPlane = 0.1
	farPlane = 1000;

	camera = new THREE.PerspectiveCamera(fieldOfView, aspectRatio, nearPlane, farPlane);
	//camera.position.x = 9;
	camera.position.z = 5;
	//camera.position.y = 7;

	controls = new THREE.OrbitControls(camera);
  //controls.addEventListener('change', render);
	controls.enableDamping = true;
	controls.dampingFactor = 0.4;
	controls.maxDistance = 20;

	keyboard	= new THREEx.KeyboardState();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize(WIDTH, HEIGHT);
	document.body.appendChild( renderer.domElement );
	renderer.shadowMap.enabled = true;
	renderer.autoClear = false;

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
	//Initialize block size
	CUBE_SIDE = 1;

	//Initialize grid size
	GRID_X = 5;
	GRID_Y = 8;
	GRID_Z = 5;

	//Initialize Time steps
	clock = new THREE.Clock();
	clock.start();
	stepTime = 1000;
	frameTime = 0;
	accTime = 0;
	lastFrameTime = Date.now();

}


function keypress() {
	if (keyboard.pressed("S")) {
		cube.position.y -= 0.1;
	}
	if (keyboard.pressed("H")) {
		alert("hello world " + " X: " + camera.position.x + " Y: "+ camera.position.y + " Z: " + camera.position.z );
	}
}

function makeGrid() {
	geoCube = new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
	var geometry = new THREE.BoxGeometry(GRID_X, GRID_Y, GRID_Z);
	var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )
	var mat = new THREE.LineBasicMaterial( { color: 0xdddddddd, linewidth: 6 } );
	var boundingBox = new THREE.LineSegments( geo, mat );
	boundingBox.position.y += GRID_Y/2 - 0.5;
	boundingBox.position.x += GRID_X/2 - 0.5;
	boundingBox.position.z += GRID_Z/2 - 0.5;
	controls.target.copy(boundingBox.position)
	scene2.add(boundingBox);

	geo = new THREE.EdgesGeometry( geoCube ); // or WireframeGeometry( geometry )
	mat = new THREE.LineBasicMaterial( { color: 0x11111111, linewidth: 4 } );
	var wireframe;

	for (var i = 0; i < GRID_X; i++) {
		grid[i] = new Array();
		for (var j = 0; j < GRID_Y; j++) {
			grid[i][j] = new Array();
			for (var k = 0; k < GRID_Z; k++) {
				wireframe = new THREE.LineSegments( geo, mat );
				wireframe.position.set(i, j, k);
				scene.add( wireframe );
				grid[i][j][k] = new Block(i, j, k, wireframe);
			}
		}
	}

	var gridHelper = new THREE.GridHelper(5, GRID_X*GRID_Y, 0x0000ff, 0x808080 );
	gridHelper.position.y -= 0.5;
	//scene.add( gridHelper );

	var cubeMat = new THREE.MeshBasicMaterial( { color: 0x0000ff} );
	cube = new THREE.Mesh(geoCube, cubeMat );
	cube.position.y += GRID_Y + 3;

	scene2.add(cube);
/*
	cube1 = new THREE.Mesh(geometry, material );
	cube1.position.x = 1;
	scene.add(cube1);

	cube2 = new THREE.Mesh(geometry, material );
	cube2.position.x = 2;
	scene.add(cube2);*/
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
	requestAnimationFrame(loop);

	var time = Date.now();
	frameTime = time - lastFrameTime;
  lastFrameTime = time;
	accTime += frameTime;

	//Ikot-ikot lang
  starSphere.rotation.y += 0.0003;

	//Pag may pinindot si koya
  keypress();

	while(accTime > stepTime) {
    cube.position.y -= 1;
  	accTime -= stepTime;
  }

	controls.update();

	// render the scene
	render();
}

function render() {
	renderer.clear();
	renderer.render( scene, camera );
	renderer.clearDepth();
	renderer.render( scene2, camera );
	//renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
}
