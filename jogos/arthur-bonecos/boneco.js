const scene = new THREE.Scene();
scene.background = new THREE.Color('#8ec8e9');
scene.fog = new THREE.Fog('#8ec8e9', 28, 90);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
const cameraTwo = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 200);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight('#eaf8ff', '#365b2b', 2.4));
const sun = new THREE.DirectionalLight('#fff2c9', 2.2);
sun.position.set(18, 28, 12);
sun.castShadow = true;
scene.add(sun);

const ground = new THREE.Mesh(
	new THREE.PlaneGeometry(160, 160),
	new THREE.MeshStandardMaterial({ color: '#59a843', roughness: 0.95 })
);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const grid = new THREE.GridHelper(160, 40, '#3d8b3e', '#74bd58');
grid.position.y = 0.01;
scene.add(grid);

const riverZones = [];
function addRiver(x, z, width, depth) {
	const river = new THREE.Mesh(
		new THREE.PlaneGeometry(width, depth),
		new THREE.MeshStandardMaterial({ color: '#0011ff', roughness: 0.25, metalness: 0.1 })
	);
	river.rotation.x = -Math.PI / 2;
	river.position.set(x, 0.025, z);
	scene.add(river);

	const bank = new THREE.Mesh(
		new THREE.PlaneGeometry(width + 2, depth + 2),
		new THREE.MeshStandardMaterial({ color: '#d4be78', roughness: 1 })
	);
	bank.rotation.x = -Math.PI / 2;
	bank.position.set(x, 0.015, z);
	scene.add(bank);
	river.position.y = 0.04;
	riverZones.push({ x, z, width: width + 4, depth: depth + 4 });
}

addRiver(-58, 38, 12, 52);
addRiver(48, 62, 40, 9);

function isInRiverZone(x, z) {
	return riverZones.some(zone => Math.abs(x - zone.x) < zone.width / 2 && Math.abs(z - zone.z) < zone.depth / 2);
}

const player = new THREE.Group();
const bodyMaterial = new THREE.MeshStandardMaterial({ color: '#f47828', roughness: 0.7 });
const arms = [];
const trousers = [];
const shoes = [];
const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.1, 0.45), bodyMaterial);
shirt.position.y = 1.35;
shirt.castShadow = true;
player.add(shirt);

const head = new THREE.Mesh(
	new THREE.SphereGeometry(0.38, 20, 16),
	new THREE.MeshStandardMaterial({ color: '#ffb57c', roughness: 0.8 })
);
head.position.y = 2.14;
head.castShadow = true;
player.add(head);

const hair = new THREE.Mesh(
	new THREE.SphereGeometry(0.4, 20, 16, 0, Math.PI * 2, 0, Math.PI / 2),
	new THREE.MeshStandardMaterial({ color: '#3a2b0c', roughness: 0.9 })
);
hair.position.set(0, 2.31, 0);
hair.castShadow = true;
player.add(hair);

[-0.14, 0.14].forEach(offset => {
	const eye = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), new THREE.MeshStandardMaterial({ color: '#1f2734' }));
	eye.position.set(offset, 2.17, 0.35);
	player.add(eye);
});

const nose = new THREE.Mesh(new THREE.SphereGeometry(0.055, 12, 10), new THREE.MeshStandardMaterial({ color: '#df9b6d' }));
nose.position.set(0, 2.08, 0.38);
player.add(nose);
const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.025, 0.03), new THREE.MeshStandardMaterial({ color: '#8d3d3d' }));
mouth.position.set(0, 1.98, 0.38);
player.add(mouth);

[-0.58, 0.58].forEach(offset => {
	const arm = new THREE.Mesh(
		new THREE.CylinderGeometry(0.11, 0.13, 0.82, 10),
		bodyMaterial
	);
	arm.position.set(offset, 1.38, 0);
	arm.rotation.z = offset < 0 ? -0.18 : 0.18;
	arm.castShadow = true;
	player.add(arm);
	arms.push(arm);

	const hand = new THREE.Mesh(new THREE.SphereGeometry(0.13, 12, 10), new THREE.MeshStandardMaterial({ color: '#f2ba86' }));
	hand.position.set(offset * 1.1, 0.96, 0);
	hand.castShadow = true;
	player.add(hand);
});

const legGeometry = new THREE.BoxGeometry(0.27, 0.85, 0.3);
[-0.22, 0.22].forEach(offset => {
	const leg = new THREE.Mesh(legGeometry, new THREE.MeshStandardMaterial({ color: '#274d89' }));
	leg.position.set(offset, 0.48, 0);
	leg.castShadow = true;
	player.add(leg);
	trousers.push(leg);

	const shoe = new THREE.Mesh(
		new THREE.BoxGeometry(0.34, 0.18, 0.5),
		new THREE.MeshStandardMaterial({ color: '#eef3f4', roughness: 0.65 })
	);
	shoe.position.set(offset, 0.08, 0.1);
	shoe.castShadow = true;
	player.add(shoe);
	shoes.push(shoe);
});
player.position.set(0, 0, 0);
scene.add(player);

const playerTwo = player.clone();
playerTwo.position.set(3, 0, 0);
playerTwo.visible = false;
const playerTwoCap = new THREE.Mesh(
	new THREE.CylinderGeometry(0.42, 0.42, 0.12, 16),
	new THREE.MeshStandardMaterial({ color: '#2bff00', roughness: 0.7 })
);
playerTwoCap.position.set(0, 2.52, 0);
playerTwo.add(playerTwoCap);
scene.add(playerTwo);

const buildingColliders = [];
const people = [];
const cars = [];
const npcMessage = document.getElementById('npcMessage');
let npcMessageTimer = null;

function createBuildingTexture(wallColor, windowColor) {
	const textureCanvas = document.createElement('canvas');
	textureCanvas.width = 128;
	textureCanvas.height = 128;
	const textureCtx = textureCanvas.getContext('2d');
	textureCtx.fillStyle = wallColor;
	textureCtx.fillRect(0, 0, 128, 128);
	textureCtx.fillStyle = '#263644';

	for (let y = 13; y < 128; y += 27) {
		for (let x = 12; x < 128; x += 28) {
			textureCtx.fillRect(x, y, 14, 16);
			textureCtx.fillStyle = windowColor;
			textureCtx.fillRect(x + 2, y + 2, 10, 12);
			textureCtx.fillStyle = '#263644';
		}
	}

	const texture = new THREE.CanvasTexture(textureCanvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	return texture;
}

for (let index = 0; index < 40; index += 1) {
	const width = 3 + Math.random() * 3;
	const height = 8 + Math.random() * 16;
	const depth = 3 + Math.random() * 3;
	let x = 0;
	let z = 0;
	do {
		x = (Math.random() - 0.5) * 130;
		z = (Math.random() - 0.5) * 130;
	} while (isInRiverZone(x, z));
	const texture = createBuildingTexture(index % 2 ? '#641b09' : '#ca9138', index % 2 ? '#ffe08a' : '#a7def0');
	texture.repeat.set(width / 2, height / 2);

	const box = new THREE.Mesh(
		new THREE.BoxGeometry(width, height, depth),
		new THREE.MeshStandardMaterial({ map: texture, roughness: 0.85 })
	);
	box.position.set(x, height / 2, z);
	box.castShadow = true;
	box.receiveShadow = true;
	scene.add(box);
	buildingColliders.push({ x, z, width, height, depth, enterable: true, climbable: true });
}

for (let index = 0; index < 32; index += 1) {
	const width = 5 + Math.random() * 2;
	const height = 2.8 + Math.random() * 1.2;
	const depth = 4 + Math.random() * 2;
	let x = 0;
	let z = 0;
	do {
		x = (Math.random() - 0.5) * 130;
		z = (Math.random() - 0.5) * 130;
	} while (isInRiverZone(x, z));
	const wallTexture = createBuildingTexture('#e8d0a6', '#6eb9db');
	wallTexture.repeat.set(2, 1);
	const house = new THREE.Mesh(
		new THREE.BoxGeometry(width, height, depth),
		new THREE.MeshStandardMaterial({ map: wallTexture, roughness: 0.9 })
	);
	house.position.set(x, height / 2, z);
	house.castShadow = true;
	house.receiveShadow = true;
	scene.add(house);

	const roof = new THREE.Mesh(
		new THREE.ConeGeometry(Math.max(width, depth) * 0.52, 1.8, 4),
		new THREE.MeshStandardMaterial({ color: '#57160c', roughness: 0.9 })
	);
	roof.position.set(x, height + 0.9, z);
	roof.rotation.y = Math.PI / 4;
	roof.castShadow = true;
	scene.add(roof);
	buildingColliders.push({ x, z, width, height, depth, enterable: true, climbable: true });
}

const clothingShop = new THREE.Mesh(
	new THREE.BoxGeometry(10, 6, 7),
	new THREE.MeshStandardMaterial({ map: createBuildingTexture('#a45488', '#ffe08a'), roughness: 0.75 })
);
clothingShop.position.set(-18, 3, -46);
clothingShop.castShadow = true;
clothingShop.receiveShadow = true;
scene.add(clothingShop);
const shopSign = new THREE.Mesh(
	new THREE.BoxGeometry(7, 1.2, 0.25),
	new THREE.MeshStandardMaterial({ color: '#f2c43d', emissive: '#9f6c00', emissiveIntensity: 0.35 })
);
shopSign.position.set(-18, 5.5, -49.6);
scene.add(shopSign);
buildingColliders.push({ x: -18, z: -46, width: 10, height: 6, depth: 7, enterable: true, climbable: true, clothingShop: true });
function addClothingShop(x, z, wallColor) {
	const clothingShop = new THREE.Mesh(
		new THREE.BoxGeometry(10, 6, 7),
		new THREE.MeshStandardMaterial({ map: createBuildingTexture(wallColor, '#ffe08a'), roughness: 0.75 })
	);
	clothingShop.position.set(x, 3, z);
	clothingShop.castShadow = true;
	clothingShop.receiveShadow = true;
	scene.add(clothingShop);

	const shopSign = new THREE.Mesh(
		new THREE.BoxGeometry(7, 1.2, 0.25),
		new THREE.MeshStandardMaterial({ color: '#f2c43d', emissive: '#9f6c00', emissiveIntensity: 0.35 })
	);
	shopSign.position.set(x, 5.5, z - 3.6);
	scene.add(shopSign);
	buildingColliders.push({ x, z, width: 10, height: 6, depth: 7, enterable: true, climbable: true, clothingShop: true });
}

addClothingShop(-18, -46, '#a45488');
addClothingShop(46, 44, '#447eb0');
addClothingShop(-52, -20, '#be694a');
addClothingShop(18, 55, '#4b9a72');

const carShop = new THREE.Mesh(
	new THREE.BoxGeometry(12, 6, 8),
	new THREE.MeshStandardMaterial({ map: createBuildingTexture('#376f9f', '#e7f1fa'), roughness: 0.7 })
);
carShop.position.set(-45, 3, -51);
carShop.castShadow = true;
carShop.receiveShadow = true;
scene.add(carShop);
const carShopSign = new THREE.Mesh(
	new THREE.BoxGeometry(8, 1.3, 0.25),
	new THREE.MeshStandardMaterial({ color: '#f2c43d', emissive: '#9f6c00', emissiveIntensity: 0.35 })
);
carShopSign.position.set(-45, 5.5, -55.1);
scene.add(carShopSign);
buildingColliders.push({ x: -45, z: -51, width: 12, height: 6, depth: 8, enterable: true, climbable: true, carShop: true });

function addTree(x, z) {
	const trunk = new THREE.Mesh(
		new THREE.CylinderGeometry(0.25, 0.35, 2.2, 8),
		new THREE.MeshStandardMaterial({ color: '#754327', roughness: 0.95 })
	);
	trunk.position.set(x, 1.1, z);
	trunk.castShadow = true;
	scene.add(trunk);

	const leaves = new THREE.Mesh(
		new THREE.ConeGeometry(1.55, 3.8, 10),
		new THREE.MeshStandardMaterial({ color: '#267444', roughness: 0.9 })
	);
	leaves.position.set(x, 3.5, z);
	leaves.castShadow = true;
	scene.add(leaves);
	buildingColliders.push({ x, z, width: 1.1, height: 4, depth: 1.1 });
}

for (let index = 0; index < 38; index += 1) {
	addTree((Math.random() - 0.5) * 145, (Math.random() - 0.5) * 145);
}

const park = new THREE.Mesh(
	new THREE.PlaneGeometry(28, 22),
	new THREE.MeshStandardMaterial({ color: '#00ff1e', roughness: 1 })
);
park.rotation.x = -Math.PI / 2;
park.position.set(43, 0.03, -42);
park.receiveShadow = true;
scene.add(park);

const parkPath = new THREE.Mesh(
	new THREE.PlaneGeometry(25, 2),
	new THREE.MeshStandardMaterial({ color: '#e5d4aa', roughness: 1 })
);
parkPath.rotation.x = -Math.PI / 2;
parkPath.position.set(43, 0.05, -42);
scene.add(parkPath);

[-9, 9].forEach(offset => addTree(43 + offset, -48));
[-7, 7].forEach(offset => addTree(43 + offset, -35));

const fountainBase = new THREE.Mesh(
	new THREE.CylinderGeometry(2.2, 2.2, 0.5, 20),
	new THREE.MeshStandardMaterial({ color: '#d8e5e7', roughness: 0.7 })
);
fountainBase.position.set(43, 0.25, -42);
fountainBase.castShadow = true;
scene.add(fountainBase);
const fountainWater = new THREE.Mesh(
	new THREE.CylinderGeometry(1.75, 1.75, 0.08, 20),
	new THREE.MeshStandardMaterial({ color: '#4cc8e8', roughness: 0.35 })
);
fountainWater.position.set(43, 0.53, -42);
scene.add(fountainWater);
buildingColliders.push({ x: 43, z: -42, width: 4.4, height: 0.55, depth: 4.4 });

const ferrisWheel = new THREE.Group();
const wheel = new THREE.Mesh(
	new THREE.TorusGeometry(5, 0.28, 10, 32),
	new THREE.MeshStandardMaterial({ color: '#f0c331', roughness: 0.55 })
);
wheel.rotation.y = Math.PI / 2;
wheel.position.y = 6;
ferrisWheel.add(wheel);
const wheelSupport = new THREE.Mesh(
	new THREE.CylinderGeometry(0.3, 0.45, 6, 8),
	new THREE.MeshStandardMaterial({ color: '#d3453e' })
);
wheelSupport.position.y = 3;
wheelSupport.rotation.z = 0.35;
ferrisWheel.add(wheelSupport);
ferrisWheel.position.set(34, 0, -41);
scene.add(ferrisWheel);
buildingColliders.push({ x: 34, z: -41, width: 3.5, height: 11, depth: 2 });

const ferrisPlatforms = [];
for (let index = 0; index < 8; index += 1) {
	const platform = new THREE.Mesh(
		new THREE.BoxGeometry(1.6, 0.22, 1.25),
		new THREE.MeshStandardMaterial({ color: index % 2 ? '#d94a3d' : '#2f75c9', roughness: 0.7 })
	);
	platform.castShadow = true;
	ferrisWheel.add(platform);
	ferrisPlatforms.push({ platform, angle: (index / 8) * Math.PI * 2, previousPosition: new THREE.Vector3() });
}


const slide = new THREE.Mesh(
	new THREE.BoxGeometry(1.4, 0.25, 6),
	new THREE.MeshStandardMaterial({ color: '#df4c45', roughness: 0.6 })
);
slide.position.set(52, 1.7, -37);
slide.rotation.x = 0.45;
slide.castShadow = true;
scene.add(slide);
buildingColliders.push({ x: 52, z: -37, width: 2, height: 3, depth: 6 });
const swingFrame = new THREE.Mesh(
	new THREE.TorusGeometry(2.1, 0.16, 8, 16, Math.PI),
	new THREE.MeshStandardMaterial({ color: '#3d76be', roughness: 0.65 })
);
swingFrame.position.set(51, 2.4, -47);
swingFrame.rotation.z = Math.PI / 2;
scene.add(swingFrame);
buildingColliders.push({ x: 51, z: -47, width: 4.5, height: 4.5, depth: 2 });

const seesawBase = new THREE.Mesh(
	new THREE.CylinderGeometry(0.32, 0.5, 1.5, 8),
	new THREE.MeshStandardMaterial({ color: '#e15b3d', roughness: 0.7 })
);
seesawBase.position.set(42, 0.75, -51);
scene.add(seesawBase);
const seesawBoard = new THREE.Mesh(
	new THREE.BoxGeometry(6, 0.22, 0.55),
	new THREE.MeshStandardMaterial({ color: '#e8b52e', roughness: 0.65 })
);
seesawBoard.position.set(42, 1.45, -51);
seesawBoard.castShadow = true;
scene.add(seesawBoard);
const seesaw = {
	x: 42,
	z: -51,
	board: seesawBoard,
	angle: 0,
	targetAngle: 0
};

const sandbox = new THREE.Mesh(
	new THREE.BoxGeometry(6, 0.45, 4.5),
	new THREE.MeshStandardMaterial({ color: '#d99a46', roughness: 0.95 })
);
sandbox.position.set(44, 0.22, -33.5);
sandbox.castShadow = true;
sandbox.receiveShadow = true;
scene.add(sandbox);
const sand = new THREE.Mesh(
	new THREE.BoxGeometry(5.4, 0.08, 3.9),
	new THREE.MeshStandardMaterial({ color: '#f3d281', roughness: 1 })
);
sand.position.set(44, 0.48, -33.5);
scene.add(sand);
buildingColliders.push({ x: 44, z: -33.5, width: 6, height: 0.5, depth: 4.5 });

const roundabout = new THREE.Mesh(
	new THREE.CylinderGeometry(2, 2, 0.3, 20),
	new THREE.MeshStandardMaterial({ color: '#3f79ca', roughness: 0.6 })
);
roundabout.position.set(30.5, 0.42, -33.5);
roundabout.castShadow = true;
scene.add(roundabout);
buildingColliders.push({ x: 30.5, z: -33.5, width: 4, height: 0.6, depth: 4 });

[-1, 1].forEach(side => {
	const bench = new THREE.Mesh(
		new THREE.BoxGeometry(3, 0.8, 0.75),
		new THREE.MeshStandardMaterial({ color: '#8c5835', roughness: 0.9 })
	);
	bench.position.set(57, 0.4, -42 + side * 5);
	bench.castShadow = true;
	scene.add(bench);
	buildingColliders.push({ x: 57, z: -42 + side * 5, width: 3, height: 0.8, depth: 0.75 });
});

function addCar(route, speed, color) {
	const car = new THREE.Group();
	const chassis = new THREE.Mesh(
		new THREE.BoxGeometry(2.2, 0.55, 1.15),
		new THREE.MeshStandardMaterial({ color, roughness: 0.55 })
	);
	chassis.position.y = 0.5;
	chassis.castShadow = true;
	car.add(chassis);
	const cabin = new THREE.Mesh(
		new THREE.BoxGeometry(1.1, 0.52, 1.02),
		new THREE.MeshStandardMaterial({ color: '#9ed8ec', roughness: 0.3 })
	);
	cabin.position.set(-0.15, 0.98, 0);
	cabin.castShadow = true;
	car.add(cabin);
	const driver = new THREE.Mesh(new THREE.SphereGeometry(0.17, 12, 10), new THREE.MeshStandardMaterial({ color: '#d9986c' }));
	driver.position.set(-0.2, 1.12, 0.38);
	car.add(driver);
	car.position.set(route[0].x, 0, route[0].z);
	scene.add(car);
	const vehicle = { car, route, speed, segment: 0, stored: false };
	cars.push(vehicle);
	return vehicle;
}

const avenueRoute = [
	{ x: -68, z: -20 }, { x: 68, z: -20 }, { x: 68, z: 20 }, { x: -68, z: 20 }
];
addCar(avenueRoute, 9, '#3a3939');
addCar(avenueRoute, 7, '#0a0a0a');
addCar(avenueRoute, 10, '#afadaa');
addCar([...avenueRoute].reverse(), 8, '#7a7c7a');
addCar([...avenueRoute].reverse(), 10, '#e6e6e6');
addCar(avenueRoute, 6, '#ff0000');
addCar([...avenueRoute].reverse(), 9, '#a50505');
addCar(avenueRoute, 8, '#660505');

const stoneMaterial = new THREE.MeshStandardMaterial({ color: '#7c8385', roughness: 1 });
const stoneHouseX = -44;
const stoneHouseZ = 29;
const stoneHouse = new THREE.Mesh(
	new THREE.BoxGeometry(4.6, 2.6, 4.2),
	new THREE.MeshStandardMaterial({ map: createBuildingTexture('#d8c4a1', '#7bb7d3'), roughness: 0.9 })
);
stoneHouse.position.set(stoneHouseX, 1.3, stoneHouseZ);
stoneHouse.castShadow = true;
stoneHouse.receiveShadow = true;
scene.add(stoneHouse);
buildingColliders.push({ x: stoneHouseX, z: stoneHouseZ, width: 4.6, height: 2.6, depth: 4.2, enterable: true, climbable: true });

for (let index = 0; index < 7; index += 1) {
	const stoneSize = 1.2 + index * 0.24;
	const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(stoneSize, 0), stoneMaterial);
	stone.position.set(stoneHouseX + 6 + index * 1.5, stoneSize * 0.55, stoneHouseZ - 3 + index * 0.5);
	stone.scale.y = 0.65;
	stone.castShadow = true;
	stone.receiveShadow = true;
	scene.add(stone);
	buildingColliders.push({
		x: stone.position.x,
		z: stone.position.z,
		width: stoneSize * 1.4,
		height: stoneSize * 0.65,
		depth: stoneSize * 1.4
	});
}

for (let index = 0; index < 36; index += 1) {
	const size = 0.5 + Math.random() * 1.2;
	const stone = new THREE.Mesh(new THREE.DodecahedronGeometry(size, 0), stoneMaterial);
	stone.position.set(-62 + Math.random() * 25, size * 0.55, 12 + Math.random() * 32);
	stone.scale.y = 0.65;
	stone.castShadow = true;
	scene.add(stone);
	buildingColliders.push({
		x: stone.position.x,
		z: stone.position.z,
		width: size * 1.4,
		height: size * 0.65,
		depth: size * 1.4
	});
}

const wallHeight = 25;
function addWall(x, z, width, depth) {
	const wall = new THREE.Mesh(
		new THREE.BoxGeometry(width, wallHeight, depth),
		new THREE.MeshStandardMaterial({ map: createBuildingTexture('#67737d', '#b3c4cf'), roughness: 0.92 })
	);
	wall.position.set(x, wallHeight / 2, z);
	wall.castShadow = true;
	wall.receiveShadow = true;
	scene.add(wall);
	buildingColliders.push({ x, z, width, height: wallHeight, depth });
}

addWall(0, 76, 156, 3);
addWall(0, -76, 156, 3);
addWall(76, 0, 3, 156);
addWall(-76, 0, 3, 156);

const palaceHeight = 18;
const towerPalace = new THREE.Mesh(
	new THREE.BoxGeometry(14, palaceHeight, 10),
	new THREE.MeshStandardMaterial({ map: createBuildingTexture('#725281', '#f5d76a'), roughness: 0.78 })
);
towerPalace.position.set(0, palaceHeight / 2, 63);
towerPalace.castShadow = true;
towerPalace.receiveShadow = true;
scene.add(towerPalace);
buildingColliders.push({ x: 0, z: 63, width: 14, height: palaceHeight, depth: 10, enterable: true, climbable: true });

const boundaryTowerHeight = 42;
const boundaryTower = new THREE.Mesh(
	new THREE.CylinderGeometry(5, 6, boundaryTowerHeight, 8),
	new THREE.MeshStandardMaterial({ map: createBuildingTexture('#5f7187', '#f6d36c'), roughness: 0.78 })
);
boundaryTower.position.set(0, boundaryTowerHeight / 2, 73);
boundaryTower.castShadow = true;
boundaryTower.receiveShadow = true;
scene.add(boundaryTower);
buildingColliders.push({ x: 0, z: 73, width: 10, height: boundaryTowerHeight, depth: 10 });

function createPersonTexture(shirtColor, skinColor) {
	const canvas = document.createElement('canvas');
	canvas.width = 64;
	canvas.height = 128;
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = skinColor;
	ctx.beginPath();
	ctx.arc(32, 24, 16, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = '#332219';
	ctx.fillRect(16, 4, 32, 12);
	ctx.fillStyle = shirtColor;
	ctx.fillRect(15, 42, 34, 45);
	ctx.fillStyle = '#3108a3';
	ctx.fillRect(17, 87, 12, 35);
	ctx.fillRect(35, 87, 12, 35);
	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}

const npcLines = [
	'Nossa, a cidade esta linda hoje!',
	'Voce ja visitou o centro natural perto do parque?',
	'A torre no fim da cidade e bem alta.',
	'As casas daqui ficaram muito bonitas.',
	'Eu gosto de passear perto das arvores.',
	'Os carros passam pela avenida mecipal.',
	'O rio deixa esta parte da cidade bem tranquila.',
	'No parque tem roda-gigante e muitos brinquedos.',
	'Vi uma loja de roupas com conjuntos bem legais.',
	'O parquinho esta cheio de cores hoje.',
	'As pedras perto da casa formam uma escada.',
	'Que tal dar uma volta de carro pela avenida?',
	'As muralhas protegem toda a cidade.',
	'Perto do rio tem arvores bonitas para descansar.',
	'O centro natural e meu lugar favorito.',
	'Eu gosto de ver o sol refletindo na agua.',
	'As casas pequenas parecem lindas.',
	'A torre parece tocar as nuvens!',
	'Vamos visitar o parque de diversoes depois?',
	'Esta cidade tem muita coisa para explorar.'
];

for (let index = 0; index < 100; index += 1) {
	const row = Math.floor(index / 10);
	const column = index % 10;
	const x = -63 + column * 14 + (Math.random() - 0.5) * 5;
	const z = -63 + row * 14 + (Math.random() - 0.5) * 5;
	const line = npcLines[index % npcLines.length];
	const sprite = new THREE.Mesh(
		new THREE.PlaneGeometry(1.4, 2.8),
		new THREE.MeshBasicMaterial({
			map: createPersonTexture(index % 2 ? '#2d78b7' : '#d95542', '#e7ad7d'),
			transparent: true,
			side: THREE.DoubleSide
		})
	);
	sprite.position.set(x, 1.4, z);
	scene.add(sprite);
	people.push({ sprite, x, z, line, voiceIndex: index % 20 });
}

const royalLines = [
	'nosso rei!',
	'nosso rei!',
	'nosso rei!',
	'nosso rei!'
];

royalLines.forEach((line, index) => {
	const x = -4.5 + index * 3;
	const sprite = new THREE.Mesh(
		new THREE.PlaneGeometry(1.7, 3.4),
		new THREE.MeshBasicMaterial({
			map: createPersonTexture(index % 2 ? '#c33245' : '#e1b830', '#e7ad7d'),
			transparent: true,
			side: THREE.DoubleSide
		})
	);
	sprite.position.set(x, palaceHeight + 1.7, 62.5);
	scene.add(sprite);
	people.push({ sprite, x, z: 62.5, line });
});

const keys = new Set();
const wardrobe = document.getElementById('wardrobe');
const carShowroom = document.getElementById('carShowroom');
let yaw = 0;
let pitch = -0.18;
let velocityY = 0;
let isGrounded = true;
let hasPointerLock = false;
let gameStarted = false;
let cameraControlActive = false;
let cameraPointerId = null;
let lastCameraPointer = null;
let isIndoors = false;
let buildingExit = null;
let isClimbing = false;
let climbingBuilding = null;
let wardrobeOpen = false;
let carShowroomOpen = false;
let ridingCar = null;
let drivingCar = null;
let ownedCar = null;
let ridingFerrisPlatform = null;
let jumpStartTime = null;
let twoPlayerMode = false;
let playerTwoVelocityY = 0;
let playerTwoGrounded = true;
const aiTarget = new THREE.Vector3(3, 0, 0);
let aiRetargetTimer = 0;
let aiJumpTimer = 0;
let currentHintText = '';
let hintCycleTimer = 0;
let hintCycleIndex = 0;
const interiorColliders = [];
const clock = new THREE.Clock();

const interior = new THREE.Group();
interior.visible = false;
const interiorFloor = new THREE.Mesh(
	new THREE.PlaneGeometry(12, 12),
	new THREE.MeshStandardMaterial({ color: '#c99b65', roughness: 0.9 })
);
interiorFloor.rotation.x = -Math.PI / 2;
interior.add(interiorFloor);
const interiorWalls = new THREE.Mesh(
	new THREE.BoxGeometry(12, 5, 12),
	new THREE.MeshStandardMaterial({ color: '#efd9af', side: THREE.BackSide, roughness: 1 })
);
interiorWalls.position.y = 2.5;
interior.add(interiorWalls);
const interiorLamp = new THREE.PointLight('#ffe3a2', 35, 18);
interiorLamp.position.set(0, 4, 0);
interior.add(interiorLamp);

function addInteriorFurniture(x, z, width, height, depth, color) {
	const furniture = new THREE.Mesh(
		new THREE.BoxGeometry(width, height, depth),
		new THREE.MeshStandardMaterial({ color, roughness: 0.85 })
	);
	furniture.position.set(x, height / 2, z);
	furniture.castShadow = true;
	furniture.receiveShadow = true;
	interior.add(furniture);
	interiorColliders.push({ x, z, width, height, depth });
}

addInteriorFurniture(-3.5, -2.7, 3.2, 0.75, 1.8, '#8a5a3d');
addInteriorFurniture(-3.5, -2.7, 2.9, 0.28, 1.55, '#dce9f0');
addInteriorFurniture(2.4, -1.8, 2.2, 1.15, 1.7, '#9a6a41');
addInteriorFurniture(-3.8, 3.8, 3.4, 1.1, 1.1, '#6d8492');
addInteriorFurniture(3.5, 3.6, 1.25, 0.8, 1.25, '#f4f4ef');
addInteriorFurniture(1.7, 3.7, 1.8, 0.9, 0.8, '#e5e7e3');
scene.add(interior);

function updateCamera() {
	const distance = 6;
	const height = 3.4;
	const horizontalDistance = Math.cos(pitch) * distance;
	camera.position.set(
		player.position.x - Math.sin(yaw) * horizontalDistance,
		player.position.y + height - Math.sin(pitch) * distance,
		player.position.z - Math.cos(yaw) * horizontalDistance
	);
	camera.lookAt(player.position.x, player.position.y + 1.15, player.position.z);
}

// Camera do jogador 2 (IA) segue sozinha, sem controle de mouse
function updateCameraTwo() {
	const distance = 6;
	const height = 3.4;
	const pitchTwo = -0.18;
	const yawTwo = playerTwo.rotation.y;
	const horizontalDistance = Math.cos(pitchTwo) * distance;
	cameraTwo.position.set(
		playerTwo.position.x - Math.sin(yawTwo) * horizontalDistance,
		playerTwo.position.y + height - Math.sin(pitchTwo) * distance,
		playerTwo.position.z - Math.cos(yawTwo) * horizontalDistance
	);
	cameraTwo.lookAt(playerTwo.position.x, playerTwo.position.y + 1.15, playerTwo.position.z);
}

// Recalcula aspect/tamanho das câmeras conforme a tela está dividida ou não
function updateViewportSizes() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const halfWidth = twoPlayerMode ? width / 2 : width;
	camera.aspect = halfWidth / height;
	camera.updateProjectionMatrix();
	cameraTwo.aspect = halfWidth / height;
	cameraTwo.updateProjectionMatrix();
	renderer.setSize(width, height);
}

function isInsideBuilding(x, z, playerY) {
	const playerRadius = 0.42;

	return buildingColliders.some(building => {
		const isInsideFootprint = Math.abs(x - building.x) < building.width / 2 + playerRadius &&
			Math.abs(z - building.z) < building.depth / 2 + playerRadius;
		return isInsideFootprint && playerY < building.height - 0.1;
	});
}

function isInsideInteriorFurniture(x, z) {
	const playerRadius = 0.42;
	return interiorColliders.some(item =>
		Math.abs(x - item.x) < item.width / 2 + playerRadius &&
		Math.abs(z - item.z) < item.depth / 2 + playerRadius
	);
}

function getLandingHeight(x, z, previousY, nextY) {
	let landingHeight = 0;

	buildingColliders.forEach(building => {
		const isAboveBuilding = Math.abs(x - building.x) < building.width / 2 - 0.05 &&
			Math.abs(z - building.z) < building.depth / 2 - 0.05;

		if (isAboveBuilding && previousY >= building.height && nextY <= building.height) {
			landingHeight = Math.max(landingHeight, building.height);
		}
	});

	cars.forEach(vehicle => {
		if (vehicle.stored) return;
		const isOverCar = Math.abs(x - vehicle.car.position.x) < 1.1 &&
			Math.abs(z - vehicle.car.position.z) < 0.58;
		const carRoofHeight = 1.26;

		if (isOverCar && previousY >= carRoofHeight && nextY <= carRoofHeight) {
			landingHeight = Math.max(landingHeight, carRoofHeight);
			ridingCar = vehicle;
		}
	});

	ferrisPlatforms.forEach(item => {
		const platformPosition = item.platform.getWorldPosition(new THREE.Vector3());
		const isOverPlatform = Math.abs(x - platformPosition.x) < 0.9 && Math.abs(z - platformPosition.z) < 0.7;
		const platformHeight = platformPosition.y + 0.12;
		if (isOverPlatform && previousY >= platformHeight && nextY <= platformHeight) {
			landingHeight = Math.max(landingHeight, platformHeight);
			ridingFerrisPlatform = item;
		}
	});

	const isOverSeesaw = Math.abs(z - seesaw.z) < 0.75 && Math.abs(x - seesaw.x) < 3.1;
	if (isOverSeesaw) {
		const localX = x - seesaw.x;
		const seesawHeight = seesaw.board.position.y + Math.sin(seesaw.angle) * localX + 0.12;
		if (previousY >= seesawHeight && nextY <= seesawHeight) {
			landingHeight = Math.max(landingHeight, seesawHeight);
		}
	}

	return landingHeight;
}

function updateSeesaw(delta) {
	const isNearBoard = Math.abs(player.position.z - seesaw.z) < 1.1 && Math.abs(player.position.x - seesaw.x) < 3.2;
	if (isNearBoard && player.position.y <= 2.1) {
		seesaw.targetAngle = player.position.x < seesaw.x ? 0.24 : -0.24;
	} else {
		seesaw.targetAngle = 0;
	}

	seesaw.angle += (seesaw.targetAngle - seesaw.angle) * Math.min(1, delta * 5);
	seesaw.board.rotation.z = seesaw.angle;
}

const aiLandmarks = [
	{ x: -18, z: -46, radius: 12, text: 'Que tal trocar de roupa nesta loja?' },
	{ x: 46, z: 44, radius: 12, text: 'Tem roupas novas nesta loja ali!' },
	{ x: -52, z: -20, radius: 12, text: 'Vamos ver os conjuntos desta loja?' },
	{ x: 18, z: 55, radius: 12, text: 'Essa loja de roupas e bem bonita!' },
	{ x: -45, z: -51, radius: 13, text: 'Aqui da pra escolher um carro gratis!' },
	{ x: 43, z: -42, radius: 15, text: 'Olha o  parque, que legal!' },
	{ x: 34, z: -41, radius: 12, text: 'Vamos andar na roda-gigante?' },
	{ x: 52, z: -37, radius: 8, text: 'Esse escorregador parece divertido!' },
	{ x: 51, z: -47, radius: 8, text: 'Da pra brincar no balanco aqui!' },
	{ x: 42, z: -51, radius: 8, text: 'A gangorra fica logo ali!' },
	{ x: -58, z: 38, radius: 30, text: 'Cuidado, tem um rio por perto!' },
	{ x: 48, z: 62, radius: 24, text: 'Cuidado, tem um rio por perto!' },
	{ x: 0, z: 63, radius: 14, text: 'A torre do palacio e enorme!' },
	{ x: 0, z: 73, radius: 10, text: 'Essa torre marca o limite da cidade!' }
];

const aiGenericTips = [
	'Use WASD para andar por ai!',
	'Aperte Espaco para pular!',
	'Aperte Q perto de alguem para conversar!',
	'Aperte E para entrar nas casas!',
	'Aperte T perto de um carro para dirigir!',
	'Aperte C para agarrar e escalar predios!',
	'Aperte U para guardar ou montar seu carro!'
];

function createHintTexture(text) {
	const canvas = document.createElement('canvas');
	canvas.width = 320;
	canvas.height = 140;
	const ctx = canvas.getContext('2d');
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
	ctx.strokeStyle = '#173c59';
	ctx.lineWidth = 6;
	const radius = 22;
	ctx.beginPath();
	ctx.moveTo(radius, 6);
	ctx.arcTo(canvas.width - 6, 6, canvas.width - 6, canvas.height - 6, radius);
	ctx.arcTo(canvas.width - 6, canvas.height - 6, 6, canvas.height - 6, radius);
	ctx.arcTo(6, canvas.height - 6, 6, 6, radius);
	ctx.arcTo(6, 6, canvas.width - 6, 6, radius);
	ctx.closePath();
	ctx.fill();
	ctx.stroke();

	ctx.fillStyle = '#173c59';
	ctx.font = 'bold 24px "Trebuchet MS", sans-serif';
	ctx.textAlign = 'center';
	ctx.textBaseline = 'middle';

	const words = text.split(' ');
	const lines = [];
	let line = '';
	words.forEach(word => {
		const testLine = line ? `${line} ${word}` : word;
		if (ctx.measureText(testLine).width > canvas.width - 40 && line) {
			lines.push(line);
			line = word;
		} else {
			line = testLine;
		}
	});
	if (line) lines.push(line);

	const lineHeight = 30;
	const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;
	lines.forEach((textLine, index) => ctx.fillText(textLine, canvas.width / 2, startY + index * lineHeight));

	const texture = new THREE.CanvasTexture(canvas);
	texture.colorSpace = THREE.SRGBColorSpace;
	return texture;
}

const aiHintSprite = new THREE.Mesh(
	new THREE.PlaneGeometry(2.6, 1.14),
	new THREE.MeshBasicMaterial({ map: createHintTexture('Ola!'), transparent: true, side: THREE.DoubleSide })
);
aiHintSprite.visible = false;
scene.add(aiHintSprite);

function setAiHintText(text) {
	if (text === currentHintText) return;
	currentHintText = text;
	aiHintSprite.material.map.dispose();
	aiHintSprite.material.map = createHintTexture(text);
}

function updateAiHint(delta) {
	aiHintSprite.visible = true;
	aiHintSprite.position.set(playerTwo.position.x, playerTwo.position.y + 2.85, playerTwo.position.z);

	const nearbyLandmark = aiLandmarks.find(landmark =>
		Math.hypot(playerTwo.position.x - landmark.x, playerTwo.position.z - landmark.z) < landmark.radius);
	if (nearbyLandmark) {
		setAiHintText(nearbyLandmark.text);
		hintCycleTimer = 0;
		return;
	}

	hintCycleTimer -= delta;
	if (hintCycleTimer <= 0 || !currentHintText) {
		hintCycleIndex = (hintCycleIndex + 1) % aiGenericTips.length;
		setAiHintText(aiGenericTips[hintCycleIndex]);
		hintCycleTimer = 8;
	}
}

function talkToNearbyPerson() {
	const nearbyPerson = people.find(person => Math.hypot(player.position.x - person.x, player.position.z - person.z) < 3.5);
	if (!nearbyPerson) return;

	npcMessage.textContent = nearbyPerson.line;
	npcMessage.classList.add('visible');
	clearTimeout(npcMessageTimer);
	npcMessageTimer = setTimeout(() => npcMessage.classList.remove('visible'), 5000);

	if ('speechSynthesis' in window) {
		window.speechSynthesis.cancel();
		const utterance = new SpeechSynthesisUtterance(nearbyPerson.line);
		const availableVoices = window.speechSynthesis.getVoices();
		if (availableVoices.length) utterance.voice = availableVoices[nearbyPerson.voiceIndex % availableVoices.length];
		utterance.rate = 0.92 + (nearbyPerson.voiceIndex % 4) * 0.05;
		window.speechSynthesis.speak(utterance);
	}
}

function applyOutfit(outfit) {
	const outfits = {
		azul: { top: '#2e72c7', trousers: '#1d3f78', shoes: '#edf4fb' },
		vermelho: { top: '#ca3f45', trousers: '#363945', shoes: '#f4f0e8' },
		verde: { top: '#3c9a5a', trousers: '#315d3d', shoes: '#f0d056' },
		preto: { top: '#30333a', trousers: '#17191d', shoes: '#c3c7cb' },
		roxo: { top: '#7449b5', trousers: '#40305e', shoes: '#f0d7ff' },
		amarelo: { top: '#e3b22e', trousers: '#4e5b78', shoes: '#ffffff' },
		rosa: { top: '#d65b98', trousers: '#6a375c', shoes: '#ffd5e7' },
		laranja: { top: '#e77b2c', trousers: '#614431', shoes: '#f5e7d1' },
		cinza: { top: '#7c858f', trousers: '#3f4750', shoes: '#d8e0e4' },
		turquesa: { top: '#28a9a2', trousers: '#24555f', shoes: '#f1f4db' }
	};
	const colors = outfits[outfit];
	if (!colors) return;

	shirt.material.color.set(colors.top);
	arms.forEach(arm => arm.material.color.set(colors.top));
	trousers.forEach(leg => leg.material.color.set(colors.trousers));
	shoes.forEach(shoe => shoe.material.color.set(colors.shoes));
	wardrobe.classList.remove('visible');
	wardrobeOpen = false;
	renderer.domElement.requestPointerLock?.();
}

function chooseFreeCar(color) {
	const carRoute = [
		{ x: -37, z: -51 }, { x: -26, z: -51 }, { x: -26, z: -39 }, { x: -37, z: -39 }
	];
	if (ownedCar) {
		ownedCar.car.removeFromParent();
		cars.splice(cars.indexOf(ownedCar), 1);
	}
	ownedCar = addCar(carRoute, 7, color);
	ownedCar.stored = true;
	ownedCar.car.visible = false;
	carShowroom.classList.remove('visible');
	carShowroomOpen = false;
	interior.visible = false;
	isIndoors = false;
	player.position.set(buildingExit.x, 0, buildingExit.z);
	buildingExit = null;
	renderer.domElement.requestPointerLock?.();
}

function toggleOwnedCar() {
	if (!ownedCar) return;

	if (ownedCar.stored) {
		ownedCar.car.position.set(player.position.x, 0, player.position.z);
		ownedCar.car.position.y = 0;
		ownedCar.car.rotation.y = yaw;
		ownedCar.car.visible = true;
		ownedCar.stored = false;
		ridingCar = ownedCar;
		player.position.y = 1.32;
		isGrounded = true;
		return;
	}

	if (drivingCar === ownedCar || ridingCar === ownedCar) {
		player.position.set(ownedCar.car.position.x, 0, ownedCar.car.position.z);
		drivingCar = null;
		ridingCar = null;
	}
	ownedCar.stored = true;
	ownedCar.car.visible = false;
}

function startClimbing() {
	if (isIndoors || isClimbing) return;

	const nearbyBuilding = buildingColliders.find(building => building.climbable &&
		Math.hypot(player.position.x - building.x, player.position.z - building.z) < Math.max(building.width, building.depth) * 0.8);
	if (!nearbyBuilding) return;

	climbingBuilding = nearbyBuilding;
	isClimbing = true;
	velocityY = 0;
}

function updateSlide(delta) {
	const isOnSlide = Math.abs(player.position.x - 52) < 1.2 &&
		player.position.z > -40 && player.position.z < -34 && player.position.y > 0.7;
	if (!isOnSlide) return;

	player.position.z = Math.max(-40.2, player.position.z - 4.8 * delta);
}

function enterOrLeaveBuilding() {
	if (isIndoors) {
		isIndoors = false;
		interior.visible = false;
		wardrobe.classList.remove('visible');
		wardrobeOpen = false;
		carShowroom.classList.remove('visible');
		carShowroomOpen = false;
		player.position.set(buildingExit.x, 0, buildingExit.z);
		buildingExit = null;
		return;
	}

	const nearbyBuilding = buildingColliders.find(building => building.enterable &&
		Math.hypot(player.position.x - building.x, player.position.z - building.z) < Math.max(building.width, building.depth));
	if (!nearbyBuilding) return;

	buildingExit = { x: player.position.x, z: player.position.z };
	isIndoors = true;
	player.position.set(0, 0, 0);
	velocityY = 0;
	interior.visible = true;
	if (nearbyBuilding.clothingShop) {
		wardrobeOpen = true;
		wardrobe.classList.add('visible');
		document.exitPointerLock?.();
	}
	if (nearbyBuilding.carShop) {
		carShowroomOpen = true;
		carShowroom.classList.add('visible');
		document.exitPointerLock?.();
	}
}

function leaveCar() {
	const car = drivingCar || ridingCar;
	if (!car) return;

	const side = new THREE.Vector3(Math.cos(car.car.rotation.y), 0, -Math.sin(car.car.rotation.y));
	player.position.set(
		car.car.position.x + side.x * 1.8,
		0,
		car.car.position.z + side.z * 1.8
	);
	velocityY = 0;
	isGrounded = true;
	ridingCar = null;
	drivingCar = null;
}

function movePlayer(delta) {
	if (drivingCar) {
		const driveSpeed = 10;
		if (keys.has('KeyA')) drivingCar.car.rotation.y += 2.4 * delta;
		if (keys.has('KeyD')) drivingCar.car.rotation.y -= 2.4 * delta;
		const carForward = new THREE.Vector3(Math.sin(drivingCar.car.rotation.y), 0, Math.cos(drivingCar.car.rotation.y));
		if (keys.has('KeyW')) drivingCar.car.position.addScaledVector(carForward, driveSpeed * delta);
		if (keys.has('KeyS')) drivingCar.car.position.addScaledVector(carForward, -driveSpeed * 0.55 * delta);
		drivingCar.car.position.x = Math.max(-74, Math.min(74, drivingCar.car.position.x));
		drivingCar.car.position.z = Math.max(-74, Math.min(74, drivingCar.car.position.z));
		player.position.set(drivingCar.car.position.x, 1.32, drivingCar.car.position.z);
		player.rotation.y = drivingCar.car.rotation.y;
		return;
	}

	if (isClimbing) {
		player.position.y += 5 * delta;
		if (player.position.y >= climbingBuilding.height) {
			player.position.y = climbingBuilding.height;
			isClimbing = false;
			climbingBuilding = null;
			isGrounded = true;
		}
		return;
	}

	const moveSpeed = 6;
	const direction = new THREE.Vector3();
	const forward = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
	const right = new THREE.Vector3(forward.z, 0, -forward.x);

	if (keys.has('KeyW')) direction.add(forward);
	if (keys.has('KeyS')) direction.sub(forward);
	if (keys.has('KeyD')) direction.sub(right);
	if (keys.has('KeyA')) direction.add(right);

	if (direction.lengthSq() > 0) {
		direction.normalize().multiplyScalar(moveSpeed * delta);
		const limit = isIndoors ? 5 : 78;
		const nextX = Math.max(-limit, Math.min(limit, player.position.x + direction.x));
		const nextZ = Math.max(-limit, Math.min(limit, player.position.z + direction.z));
		if (isIndoors ? !isInsideInteriorFurniture(nextX, nextZ) : !isInsideBuilding(nextX, nextZ, player.position.y)) {
			player.position.x = nextX;
			player.position.z = nextZ;
		}
		player.rotation.y = Math.atan2(direction.x, direction.z);
	}

	const previousY = player.position.y;
	velocityY -= 18 * delta;
	const nextY = player.position.y + velocityY * delta;
	const landingHeight = velocityY <= 0 ? getLandingHeight(player.position.x, player.position.z, previousY, nextY) : 0;

	if (nextY <= landingHeight) {
		player.position.y = landingHeight;
		velocityY = 0;
		isGrounded = true;
	} else {
		player.position.y = nextY;
		isGrounded = false;
	}

	updateSlide(delta);
}

function pickAiTarget() {
	let x = 0;
	let z = 0;
	const radius = 10 + Math.random() * 14;
	const angle = Math.random() * Math.PI * 2;
	do {
		x = Math.max(-78, Math.min(78, player.position.x + Math.cos(angle) * radius));
		z = Math.max(-78, Math.min(78, player.position.z + Math.sin(angle) * radius));
	} while (isInRiverZone(x, z));
	aiTarget.set(x, 0, z);
}

// Jogador 2 é uma IA que vagueia perto do Jogador 1 e dá dicas
function updateSecondPlayerAI(delta) {
	if (!twoPlayerMode) return;

	const moveSpeed = 5.2;
	aiRetargetTimer -= delta;
	aiJumpTimer -= delta;

	const toTarget = new THREE.Vector3(aiTarget.x - playerTwo.position.x, 0, aiTarget.z - playerTwo.position.z);
	if (toTarget.length() < 2 || aiRetargetTimer <= 0) {
		pickAiTarget();
		aiRetargetTimer = 6 + Math.random() * 4;
	}

	const direction = toTarget.lengthSq() > 0 ? toTarget.normalize() : new THREE.Vector3();
	if (direction.lengthSq() > 0) {
		const step = direction.clone().multiplyScalar(moveSpeed * delta);
		const nextX = Math.max(-78, Math.min(78, playerTwo.position.x + step.x));
		const nextZ = Math.max(-78, Math.min(78, playerTwo.position.z + step.z));
		if (!isInsideBuilding(nextX, nextZ, playerTwo.position.y)) {
			playerTwo.position.x = nextX;
			playerTwo.position.z = nextZ;
			playerTwo.rotation.y = Math.atan2(direction.x, direction.z);
		} else {
			pickAiTarget();
		}
	}

	if (playerTwoGrounded && aiJumpTimer <= 0 && Math.random() < 0.1) {
		playerTwoVelocityY = 9 + Math.random() * 4;
		playerTwoGrounded = false;
		aiJumpTimer = 3 + Math.random() * 3;
	}

	const previousY = playerTwo.position.y;
	playerTwoVelocityY -= 18 * delta;
	const nextY = playerTwo.position.y + playerTwoVelocityY * delta;
	const landingHeight = playerTwoVelocityY <= 0 ? getLandingHeight(playerTwo.position.x, playerTwo.position.z, previousY, nextY) : 0;
	if (nextY <= landingHeight) {
		playerTwo.position.y = landingHeight;
		playerTwoVelocityY = 0;
		playerTwoGrounded = true;
	} else {
		playerTwo.position.y = nextY;
		playerTwoGrounded = false;
	}

	updateAiHint(delta);
}

function animate() {
	requestAnimationFrame(animate);
	const delta = Math.min(clock.getDelta(), 0.05);
	if (gameStarted) {
		updateSeesaw(delta);
		movePlayer(delta);
		updateSecondPlayerAI(delta);
		ferrisPlatforms.forEach(item => {
			const previousPosition = item.platform.getWorldPosition(new THREE.Vector3());
			item.angle += delta * 0.55;
			item.platform.position.set(Math.cos(item.angle) * 5, Math.sin(item.angle) * 5 + 6, 0);
			item.platform.rotation.z = -item.angle;
			if (ridingFerrisPlatform === item) {
				const nextPosition = item.platform.getWorldPosition(new THREE.Vector3());
				player.position.add(nextPosition.sub(previousPosition));
				player.position.y += 0.12;
			}
		});
	}
	cars.forEach(vehicle => {
		if (vehicle.stored) return;
		if (vehicle === drivingCar) return;

		const previousPosition = vehicle.car.position.clone();
		const target = vehicle.route[(vehicle.segment + 1) % vehicle.route.length];
		const direction = new THREE.Vector3(target.x - vehicle.car.position.x, 0, target.z - vehicle.car.position.z);
		const distance = direction.length();
		const movement = vehicle.speed * delta;

		if (distance <= movement) {
			vehicle.car.position.set(target.x, 0, target.z);
			vehicle.segment = (vehicle.segment + 1) % vehicle.route.length;
		} else {
			direction.normalize();
			vehicle.car.position.addScaledVector(direction, movement);
		}

		const facing = vehicle.route[(vehicle.segment + 1) % vehicle.route.length];
		vehicle.car.rotation.y = Math.atan2(facing.x - vehicle.car.position.x, facing.z - vehicle.car.position.z);

		if (ridingCar === vehicle) {
			player.position.x += vehicle.car.position.x - previousPosition.x;
			player.position.z += vehicle.car.position.z - previousPosition.z;
			player.position.y = 1.32;
		}
	});
	updateCamera();

	const width = window.innerWidth;
	const height = window.innerHeight;
	if (twoPlayerMode) {
		updateCameraTwo();

		renderer.setScissorTest(true);
		renderer.setViewport(0, 0, width / 2, height);
		renderer.setScissor(0, 0, width / 2, height);
		people.forEach(person => person.sprite.lookAt(camera.position.x, person.sprite.position.y, camera.position.z));
		aiHintSprite.lookAt(camera.position.x, aiHintSprite.position.y, camera.position.z);
		renderer.render(scene, camera);

		renderer.setViewport(width / 2, 0, width / 2, height);
		renderer.setScissor(width / 2, 0, width / 2, height);
		people.forEach(person => person.sprite.lookAt(cameraTwo.position.x, person.sprite.position.y, cameraTwo.position.z));
		aiHintSprite.lookAt(cameraTwo.position.x, aiHintSprite.position.y, cameraTwo.position.z);
		renderer.render(scene, cameraTwo);

		renderer.setScissorTest(false);
	} else {
		renderer.setViewport(0, 0, width, height);
		people.forEach(person => person.sprite.lookAt(camera.position.x, person.sprite.position.y, camera.position.z));
		renderer.render(scene, camera);
	}
}

document.addEventListener('keydown', event => {
	keys.add(event.code);
	if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) event.preventDefault();
	if (event.code === 'Space') {
		event.preventDefault();
		if (isGrounded && !event.repeat) {
			jumpStartTime = performance.now();
		}
	}
	if (event.code === 'Enter' && twoPlayerMode && playerTwoGrounded && !event.repeat) {
		playerTwoVelocityY = 11;
		playerTwoGrounded = false;
	}
	if (event.code === 'KeyQ' && !event.repeat) talkToNearbyPerson();
	if (event.code === 'KeyC' && !event.repeat) startClimbing();
	if (event.code === 'KeyE' && !event.repeat) enterOrLeaveBuilding();
	if (event.code === 'KeyT' && !event.repeat) {
		const nearbyCar = cars.find(vehicle => Math.hypot(player.position.x - vehicle.car.position.x, player.position.z - vehicle.car.position.z) < 2.2);
		if (nearbyCar) {
			ridingCar = nearbyCar;
			drivingCar = nearbyCar;
		}
	}
	if (event.code === 'KeyR' && !event.repeat && drivingCar) {
		drivingCar = null;
	}
	if (event.code === 'KeyU' && !event.repeat) toggleOwnedCar();
	if (event.code === 'KeyF' && !event.repeat) leaveCar();

	if (event.code === 'Escape' && !hasPointerLock) {
		window.location.href = '../../arthur-jogos.html';
	}
});

document.addEventListener('keyup', event => {
	keys.delete(event.code);

	if (event.code === 'Space' && jumpStartTime !== null && isGrounded) {
		const holdTime = Math.min(700, performance.now() - jumpStartTime);
		velocityY = 7 + (holdTime / 700) * 8;
		isGrounded = false;
		jumpStartTime = null;
	}
});

function startTouchControl(key) {
	if (!gameStarted) return;
	keys.add(key);
	if (key === 'Space' && isGrounded) {
		jumpStartTime = performance.now();
	}
}

function stopTouchControl(key) {
	keys.delete(key);
	if (key === 'Space' && jumpStartTime !== null && isGrounded) {
		const holdTime = Math.min(700, performance.now() - jumpStartTime);
		velocityY = 7 + (holdTime / 700) * 8;
		isGrounded = false;
		jumpStartTime = null;
	}
}
renderer.domElement.addEventListener('pointerdown', event => {
	if (!cameraControlActive) return;
	cameraPointerId = event.pointerId;
	lastCameraPointer = { x: event.clientX, y: event.clientY };
	renderer.domElement.setPointerCapture?.(event.pointerId);
});

renderer.domElement.addEventListener('pointermove', event => {
	if (!cameraControlActive || event.pointerId !== cameraPointerId || !lastCameraPointer) return;
	yaw -= (event.clientX - lastCameraPointer.x) * 0.006;
	pitch = Math.max(-0.65, Math.min(0.42, pitch - (event.clientY - lastCameraPointer.y) * 0.006));
	lastCameraPointer = { x: event.clientX, y: event.clientY };
});

['pointerup', 'pointercancel'].forEach(eventName => {
	renderer.domElement.addEventListener(eventName, () => {
		cameraPointerId = null;
		lastCameraPointer = null;
	});
});

document.addEventListener('pointerlockchange', () => {
	hasPointerLock = document.pointerLockElement === renderer.domElement;
});

document.querySelectorAll('.outfit-option').forEach(button => {
	button.addEventListener('click', () => applyOutfit(button.dataset.outfit));
});

document.querySelectorAll('.car-option').forEach(button => {
	button.addEventListener('click', () => chooseFreeCar(button.dataset.carColor));
});

document.querySelectorAll('.touch-button[data-key]').forEach(button => {
	const key = button.dataset.key;
	button.addEventListener('pointerdown', event => {
		event.preventDefault();
		button.setPointerCapture?.(event.pointerId);
		startTouchControl(key);
	});
	['pointerup', 'pointercancel', 'pointerleave'].forEach(eventName => {
		button.addEventListener(eventName, () => stopTouchControl(key));
	});
});

document.querySelectorAll('.command-button').forEach(button => {
	button.addEventListener('click', () => {
		switch (button.dataset.command) {
			case 'jump':
				if (isGrounded) {
					velocityY = 11;
					isGrounded = false;
				}
				break;
			case 'camera':
				cameraControlActive = !cameraControlActive;
				button.textContent = cameraControlActive ? 'Câmera ligada' : 'Controlar câmera';
				break;
			case 'talk': talkToNearbyPerson(); break;
			case 'climb': startClimbing(); break;
			case 'enter': enterOrLeaveBuilding(); break;
			case 'drive': {
				const nearbyCar = cars.find(vehicle => !vehicle.stored && Math.hypot(player.position.x - vehicle.car.position.x, player.position.z - vehicle.car.position.z) < 2.2);
				if (nearbyCar) {
					ridingCar = nearbyCar;
					drivingCar = nearbyCar;
				}
				break;
			}
			case 'automatic': drivingCar = null; break;
			case 'store': toggleOwnedCar(); break;
			case 'leave': leaveCar(); break;
			case 'twoPlayers':
				twoPlayerMode = !twoPlayerMode;
				playerTwo.visible = twoPlayerMode;
				playerTwo.position.set(player.position.x + 3, 0, player.position.z);
				playerTwoVelocityY = 0;
				playerTwoGrounded = true;
				button.textContent = twoPlayerMode ? '1 jogador' : '2 jogadores';
				break;
			case 'exit': window.location.href = '../../arthur-jogos.html'; break;
		}
	});
});

document.getElementById('startButton').addEventListener('click', () => {
	gameStarted = true;
	document.getElementById('startScreen').style.display = 'none';
	document.getElementById('commandBar').classList.add('visible');
	document.getElementById('touchControls').classList.add('visible');
});
window.addEventListener('resize', () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
});

updateCamera();
animate();
