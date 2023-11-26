import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui';

/**
 * Base
 */
// Debug
const gui = new GUI();

// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();

/**
 * Objects
 */
// Materials
const geometry = new THREE.PlaneGeometry(1, 1);
const whiteColor = new THREE.Color(0xffffff); // White color
const material = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, color: whiteColor }); // Use MeshBasicMaterial for unlit rendering

const numberOfPlanes = 7;
const gapBetweenPlanes = 1.5;
const planes = [];
const originalRotations = []; // Store original rotations for each plane
let selectedPlane = null; // Keep track of the currently selected plane

// Raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Parameters for smooth interpolation
const rotationSpeed = 0.02; // Adjust the speed of the rotation

// Create a series of planes
for (let i = 0; i < numberOfPlanes; i++) {
    const newPlane = new THREE.Mesh(geometry, material);
    newPlane.position.set(i * gapBetweenPlanes, 0, 1.5);
    newPlane.rotateY(0);
    scene.add(newPlane);
    planes.push(newPlane); // Add the plane to the array
    originalRotations.push(newPlane.rotation.clone());
}

for (let i = 0; i < numberOfPlanes; i++) {
    const newPlane = new THREE.Mesh(geometry, material);
    newPlane.position.set(i * gapBetweenPlanes, 0, -1.5);
    newPlane.rotateY(0);
    scene.add(newPlane);
    planes.push(newPlane); // Add the plane to the array
    originalRotations.push(newPlane.rotation.clone());
}

// Add a plane as a floor
const floorGeometry = new THREE.PlaneGeometry(numberOfPlanes * gapBetweenPlanes, 3);
const floorMaterial = new THREE.MeshBasicMaterial({ color: whiteColor, side: THREE.DoubleSide });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.position.set((numberOfPlanes * gapBetweenPlanes) / 2 - gapBetweenPlanes / 2, -1.5, 0);
floor.rotateX(Math.PI / 2); // Rotate the floor to be horizontal
scene.add(floor);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.x = 10;
camera.position.y = 0;
camera.position.z = 0;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */

// Event listener for wheel
window.addEventListener('wheel', (event) => {
    // Adjust the position of all planes based on the scroll input
    planes.forEach((plane) => {
        plane.position.x += event.deltaY * 0.005;
    });
});

// Event listener for mousemove
window.addEventListener('mousemove', (event) => {
    // Calculate normalized device coordinates (NDC)
    mouse.x = (event.clientX / sizes.width) * 2 - 1;
    mouse.y = -(event.clientY / sizes.height) * 2 + 1;

    // Update the picking ray with the camera and mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check for intersections with the planes
    const intersects = raycaster.intersectObjects(planes);

    // Rotate the intersected plane towards the camera with smooth interpolation
    if (intersects.length > 0) {
        const plane = intersects[0].object;

        // Only update the rotation if the plane is different from the currently selected plane
        if (plane !== selectedPlane) {
            // Reset the rotation for the previously selected plane
            if (selectedPlane) {
                resetPlaneRotation(selectedPlane, planes.indexOf(selectedPlane));
            }

            // Update the rotation for the current plane
            selectedPlane = plane;
        }

        // Smoothly interpolate towards the target rotation
        const side = planes.indexOf(plane) < numberOfPlanes ? 1 : -1; // Determine the side based on the plane index
        updatePlaneRotation(plane, rotationSpeed, side);
    } else {
        // If no intersection, reset the rotation for the currently selected plane
        if (selectedPlane) {
            resetPlaneRotation(selectedPlane, planes.indexOf(selectedPlane));
            selectedPlane = null;
        }
    }
});

// Function to reset the plane rotation to the original
function resetPlaneRotation(plane, index) {
    // Directly set the original rotation without tweening
    plane.rotation.copy(originalRotations[index]);
}

// Function to update the plane rotation with smooth interpolation
function updatePlaneRotation(plane, speed, side) {
    // Calculate the target rotation
    const targetRotation = new THREE.Euler(0, -side * Math.PI / 3, 0);

    // Smoothly interpolate towards the target rotation
    plane.rotation.y += (targetRotation.y - plane.rotation.y) * speed;
}

/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();