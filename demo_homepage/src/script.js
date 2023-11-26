import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RectAreaLightHelper } from 'three/examples/jsm/helpers/RectAreaLightHelper.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { MeshBasicMaterial } from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';

import typefaceFont from 'three/examples/fonts/FREEDOM_Regular.json' 

const canvas = document.querySelector('canvas.webgl');
const scene = new THREE.Scene();

// Create thin cubes for the glass-like objects
const geometry = new THREE.BoxGeometry(5, 0.1, 5); // Adjust the second parameter to change thickness
const glassColor = new THREE.Color(0x6699FF); // Adjust the color as desired
const material = new THREE.MeshStandardMaterial({
    color: glassColor,
    opacity: 0.3, // Adjust the opacity for transparency
    transparent: true, // Enable transparency
    side: THREE.DoubleSide,
});

const numberOfCubes = 16;
const gapBetweenCubes = 1;
const cubes = [];

for (let i = 0; i < numberOfCubes; i++) {
    const newCube = new THREE.Mesh(geometry, material);
    newCube.position.set(0, i * gapBetweenCubes - gapBetweenCubes * numberOfCubes / 2, 0);
    scene.add(newCube);
    cubes.push(newCube);
}

const fontLoader = new FontLoader();
const font = fontLoader.parse(typefaceFont);
const textMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff }); // Adjust color as needed

const textOptions = {
    font: font,
    size: 0.4, // Adjust text size as needed
    height: 0.02, // Extrude thickness
};

const texts = ['About', 'Tickets', 'People', 'Livestream'];

const textMeshes = cubes.map((cube, index) => {
    console.log(index)
    const textGeometry = new TextGeometry(texts[index % texts.length], textOptions);
    const textMesh = new THREE.Mesh(textGeometry, textMaterial);
    textMesh.position.set(-2.3, 0.05, 2.4); // Set initial position
    textMesh.rotateX(-Math.PI / 2);
    if (index != 15){
        cube.add(textMesh); // Add text as a child of the cube
    }
    return textMesh;
});

// Create a rectangular light in the background
const width = 10;
const height = 10;
const intensity = 10;
const rectLight = new THREE.RectAreaLight( 0xffffff, intensity,  width, height );
rectLight.position.set( 0, 0, -10 );
rectLight.lookAt( 0, 0, 0 );
scene.add( rectLight )

const rectLightHelper = new RectAreaLightHelper( rectLight );
rectLight.add( rectLightHelper );
 
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};
 
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;
 
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();
 
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
 
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 5;
scene.add(camera);
 
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
 
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
 
const downwardSpeed = 0.005;
const cubeHeight = gapBetweenCubes * numberOfCubes;
 
const tick = () => {
    controls.update();
 
    cubes.forEach((cube) => {
        cube.position.y -= downwardSpeed;
 
        // Move the cubes back to the bottom when they go out of the camera view
        if (cube.position.y < -cubeHeight / 2 ) {
            cube.position.y = (numberOfCubes - 1) * gapBetweenCubes - gapBetweenCubes * numberOfCubes / 2;
        }
    });
 
    renderer.render(scene, camera);
 
    window.requestAnimationFrame(tick);
};
 
tick();
 