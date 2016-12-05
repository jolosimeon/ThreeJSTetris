var Colors = {
	red:0xff0000,
	white:0xd8d0d1,
	brown:0x59332e,
	pink:0xF5986E,
	brownDark:0x23190f,
	blue:0x68c3c0,
};

var BLOCK_COLORS = [0xff0000, 0xa05403, 0xbcbf07, 0x03a03c, 0x0000ff, 0x4b0082];
var colorIndex;

var scene, scene2,
		camera, fieldOfView, aspectRatio, nearPlane, farPlane, HEIGHT, WIDTH,
		renderer, container,
		controls, keyboard, stats,
		starSphere,
		GRID_X, GRID_Y, GRID_Z, SPAWN_X, SPAWN_Y, SPAWN_Z,
		cube, geoCube, CUBE_SIDE, movingShape,
		stepTime, accTime, frameTime, lastFrameTime, clock, collision,
		gameOver, gamePause,
		currentScore;

var grid = new Array();

window.addEventListener('load', init, false);

function init () {
	// set up the scene, the camera and the renderer
	createScene();
	createBackground();
	initObjects();
	makeGrid();

	generateRandomBlockShape();
	addStaticBlock(0, 0, 0, Colors.pink);
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
	camera.position.x = -2.9753465249701216;
	camera.position.y = 11.226531284207823;
	camera.position.z = 6.7697909043747595;

	controls = new THREE.OrbitControls(camera);
  //controls.addEventListener('change', render);
	controls.enableDamping = true;
	controls.dampingFactor = 0.4;
	controls.maxDistance = 20;

	keyboard	= new KeyboardState();

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
	var loader = new THREE.TextureLoader();
	material.map   = loader.load('images/galaxy_starfield.png');
	material.side  = THREE.BackSide;
	// create the mesh based on geometry and material
	starSphere  = new THREE.Mesh(geometry, material);
	scene.add(starSphere);
}

function initObjects() {
	//Initialize block size
	CUBE_SIDE = constants.CUBE_SIDE;
	geoCube = new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);

	//Initialize grid size
	GRID_X = constants.GRID_X;
	GRID_Y = constants.GRID_Y;
	GRID_Z = constants.GRID_Z;

	//Initialize spawn Point
	SPAWN_X = Math.floor(GRID_X / 2);
	SPAWN_Y = GRID_Y + 1;
	SPAWN_Z = Math.floor(GRID_Z / 2);

	//Initialize Time steps
	clock = new THREE.Clock();
	clock.start();
	stepTime = 1000;
	frameTime = 0;
	accTime = 0;
	lastFrameTime = Date.now();

	currentScore = 0;
	gameOver = false;
	gamePause = false;
	colorIndex = 0;

	stats = new Stats();
	stats.showPanel( 0 ); // 0: fps, 1: ms, 2: mb, 3+: custom
	document.body.appendChild( stats.dom );

}


function keypress() {

	//Translations
	if (keyboard.down("A")) {
		movingShape.translate(0, 0, -1);
	}
	if (keyboard.down("D")) {
		movingShape.translate(0, 0, 1);
	}
	if (keyboard.down("W")) {
		movingShape.translate(1, 0, 0);
	}
	if (keyboard.down("S")) {
		movingShape.translate(-1, 0, 0);
	}

	//Rotations
	if (keyboard.down("T")) {
		movingShape.rotate(90, 0, 0);
	}
	if (keyboard.down("G")) {
		movingShape.rotate(-90, 0, 0);
	}
	if (keyboard.down("H")) {
		movingShape.rotate(0, 90, 0);
	}
	if (keyboard.down("F")) {
		movingShape.rotate(0, -90, 0);
	}
	if (keyboard.down("Y")) {
		movingShape.rotate(0, 0, 90);
	}
	if (keyboard.down("R")) {
		movingShape.rotate(0, 0, -90);
	}
	if (keyboard.pressed("P")) {
		alert("hello world " + " X: " + camera.position.x + " Y: "+ camera.position.y + " Z: " + camera.position.z );
	}
}

function makeGrid() {
	var geometry = new THREE.BoxGeometry(GRID_X, GRID_Y, GRID_Z);
	var geo = new THREE.EdgesGeometry( geometry ); // or WireframeGeometry( geometry )
	var mat = new THREE.LineBasicMaterial( { color: 0xdddddddd, linewidth: 6 } );
	var boundingBox = new THREE.LineSegments( geo, mat );
	boundingBox.position.x += GRID_X / 2 - CUBE_SIDE / 2;
	boundingBox.position.y += GRID_Y / 2 - CUBE_SIDE / 2;
	boundingBox.position.z += GRID_Z / 2 - CUBE_SIDE / 2;
	controls.target.copy(boundingBox.position)
	scene2.add(boundingBox);

	geo = new THREE.EdgesGeometry( geoCube.clone()); // or WireframeGeometry( geometry )
	mat = new THREE.LineBasicMaterial( { color: 0x11111111, linewidth: 4 } );
	var wireframe;

	for (var i = 0; i < GRID_X; i++) {
		grid[i] = new Array();
		for (var j = 0; j < GRID_Y + 10; j++) {
			grid[i][j] = new Array();
				for (var k = 0; k < GRID_Z; k++) {
					wireframe = null;
					if (j < GRID_Y) {
						wireframe = new THREE.LineSegments( geo, mat );
						wireframe.position.set(i, j, k);
						scene.add( wireframe );
					}
					grid[i][j][k] = new Block(i, j, k, wireframe);
				}
		}
	}

	var gridHelper = new THREE.GridHelper(5, GRID_X*GRID_Y, 0x0000ff, 0x808080 );
	gridHelper.position.y -= CUBE_SIDE / 2;
	//scene.add( gridHelper );
}

function handleWindowResize() {
	// update height and width of the renderer and the camera
	HEIGHT = window.innerHeight;
	WIDTH = window.innerWidth;
	renderer.setSize(WIDTH, HEIGHT);
	camera.aspect = WIDTH / HEIGHT;
	camera.updateProjectionMatrix();
}

function generateRandomBlockShape() {
	var type = Math.floor(Math.random() * shapes.length);
	var shape = [];
	for (var  i = 0; i < shapes[type].length; i++) {
		shape[i] = cloneVector(shapes[type][i]);
	}
	var geometry = 	new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
	for(var i = 1 ; i < shape.length; i++) {
	  tmpGeometry = new THREE.Mesh(new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE));
	  tmpGeometry.position.x = CUBE_SIDE * shape[i].x;
	  tmpGeometry.position.y = CUBE_SIDE * shape[i].y;
	  tmpGeometry.updateMatrix();
		geometry.merge(tmpGeometry.geometry, tmpGeometry.matrix);
	}

	var matCube = new THREE.MeshBasicMaterial( {
    color: BLOCK_COLORS[colorIndex],
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
	} );
	cube = new THREE.Mesh(geometry, matCube );

	// wireframe
	var newgeo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry
	var newmat = new THREE.LineBasicMaterial( { color: 0x00000000, linewidth: 2 } );
	var newwireframe = new THREE.LineSegments( newgeo, newmat );
	cube.add(newwireframe);
	cube.position.x = SPAWN_X;
	cube.position.y = SPAWN_Y;
	cube.position.z = SPAWN_Z;
	cube.rotation = {x: 0, y: 0, z: 0};
	cube.name = "MOVING";

	movingShape = new BlockShape(type, shape, cube, BLOCK_COLORS[colorIndex], {
		x: SPAWN_X,
		y: SPAWN_Y,
		z: SPAWN_Z
	});
	scene2.add(cube);

	colorIndex++;
	if (colorIndex == BLOCK_COLORS.length) {
		colorIndex = 0;
	}
}

function cloneVector(v) {
	return {x: v.x, y: v.y, z: v.z};
}

function addStaticBlock (x, y, z, blockColor) {
	cleanRemove(scene, grid[x][y][z].cube);
	var geometry = 	new THREE.BoxGeometry(CUBE_SIDE, CUBE_SIDE, CUBE_SIDE);
	var matCube = new THREE.MeshBasicMaterial( {
    color: blockColor,
    polygonOffset: true,
    polygonOffsetFactor: 1, // positive value pushes polygon further away
    polygonOffsetUnits: 1
	} );
	cube = new THREE.Mesh(geometry, matCube );

	// wireframe
	var wireGeo = new THREE.EdgesGeometry(geometry); // or WireframeGeometry
	var wireMat = new THREE.LineBasicMaterial( { color: 0x00000000, linewidth: 2 } );
	var wire = new THREE.LineSegments( wireGeo , wireMat );
	cube.add(wire);
	cube.position.set(x, y, z);
	cube.rotation = {x: 0, y: 0, z: 0};

	scene2.add(cube);
	grid[x][y][z].cubes = cube;
	grid[x][y][z].state = STATE.FROZEN;
}

function cleanRemove(gameScene, mesh) {
	mesh.geometry.dispose();
	mesh.material.dispose();
	gameScene.remove(mesh);
}

function freeze(movingShape) {
	var blockShape = movingShape;
	var shape = movingShape.shape;
	for (var i = 0 ; i < movingShape.shape.length; i++) {
    addStaticBlock(movingShape.position.x + shape[i].x, movingShape.position.y + shape[i].y, movingShape.position.z + shape[i].z, movingShape.color);
  }
}

function checkCollision () {
	var shape = movingShape.shape;
	var posX = movingShape.position.x;
	var posY = movingShape.position.y;
	var posZ = movingShape.position.z;
	for (i = 0; i < shape.length; i++) {
		//alert(shape[i].y + posY - 1);
		if (grid[shape[i].x + posX][shape[i].y + posY - 1][shape[i].z + posZ].state == STATE.FROZEN) {
			return true;
		}

		if ((shape[i].y + posY) <= 0) {
			return true;
		}
	}
	return false;
}

function hitBottom() {
	freeze(movingShape);
	cleanRemove(scene2, movingShape.cubes);
	generateRandomBlockShape();
}

function loop(){
	requestAnimationFrame(loop);
	keyboard.update();

	var time = Date.now();
	frameTime = time - lastFrameTime;
  lastFrameTime = time;
	accTime += frameTime;

	//Ikot-ikot lang
  starSphere.rotation.y += 0.0003;

	//Pag may pinindot si koya
  keypress();

	while (accTime > stepTime) {
  	accTime -= stepTime;
		movingShape.translate(0, -1, 0);

		if (movingShape.position.y == 0) {
			hitBottom();
		}
		else if (checkCollision()) {
			hitBottom();
		}
  }



	controls.update();
	stats.update();
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
