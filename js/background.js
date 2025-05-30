"use strict";
// Import the SimplexNoise class for generating noise
import { CrosshairShader } from '../shaders/crosshairShader.js';
import * as THREE from '../three/build/three.module.js';

// Get the container element for rendering Three.js
const container = document.getElementById('threejs-container');

// Create a new Three.js scene
const scene = new THREE.Scene();

// Set brightness based on prefers-color-scheme
let prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
let lightTheme = prefersLight ? 1.0 : 0.0;

// Supersampling ratio
const supersamplingRatio = 2.0;

// Set up a perspective camera
const camera = new THREE.PerspectiveCamera(
    50, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);

// Set initial camera position and orientation
camera.position.set(0, 15, 30);
camera.lookAt(0, 0, 0);

// Create a WebGL renderer with antialiasing and alpha transparency
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, multisample: true });
renderer.setPixelRatio(window.devicePixelRatio);
if (renderer.capabilities.isWebGL2) {
    renderer.getContext().canvas.setAttribute('msaa-samples', '4'); // Set 4x MSAA if supported
}
renderer.setSize(window.innerWidth * supersamplingRatio, window.innerHeight * supersamplingRatio, false); // Set renderer size (supersampled)
renderer.domElement.style.width = window.innerWidth + "px";
renderer.domElement.style.height = window.innerHeight + "px";
container.appendChild(renderer.domElement); // Add renderer to the DOM

// Define grid size and number of divisions for the plane
const gridSize = 40;
const divisions = 64;

// Create a buffer geometry for the points
const geometry = new THREE.BufferGeometry();
const positions = [];

// Create a THREE.Clock instance for tracking time
const clock = new THREE.Clock();

// Generate grid points for the plane
for (let i = 0; i <= divisions; i++) {
    for (let j = 0; j <= divisions; j++) {
        const x = (i / divisions - 0.5) * gridSize; // X position
        const z = (j / divisions - 0.5) * gridSize; // Z position
        const y = 0; // Initial Y position (flat)
        positions.push(x, y, z); // Add point to positions array
    }
}

// Set the positions attribute for the geometry
geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
geometry.computeBoundingSphere(); // Compute bounding sphere for geometry

// Create a material for the points using a custom shader
const material = new THREE.ShaderMaterial({
    uniforms: {
        cameraPosition: { value: camera.position },
        time: { value: 0.0 }, // Uniform for time
        ...(CrosshairShader.uniforms || {})
    },
    vertexShader: CrosshairShader.vertexShader,
    fragmentShader: CrosshairShader.fragmentShader,
    transparent: true
});

// Set material brightness
material.uniforms.brightness.value = lightTheme;

// Track mouse position and pass to shader as 'mousePosition' uniform
material.uniforms.mousePosition = { value: new THREE.Vector2(1.0, 0.0) };

// Create a Points mesh from the geometry and material
const pointsMesh = new THREE.Points(geometry, material);
scene.add(pointsMesh); // Add points mesh to the scene

// Variable to keep track of camera orbit angle
let angle = 0;
let time = 0;
let lastTime = 0;


function updateMousePosition(event) {
    // Normalize mouse coordinates to [-1, 1]
    const rect = renderer.domElement.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width);
    let y = 1.0 - ((event.clientY - rect.top) / rect.height);
    const screenRatio = window.innerWidth / window.innerHeight;

    material.uniforms.mousePosition.value.set(x, y);
    material.uniforms.screenRatio = { value: screenRatio }; // Pass screen ratio to shader

}

window.addEventListener('mousemove', updateMousePosition);

// Animation loop
function animate(now) {
    // Cap to 60 FPS
    requestAnimationFrame(animate);
    if (now - lastTime < 1000 / 60) return;
    lastTime = now;

    // Set brightness based on prefers-color-scheme
    prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    lightTheme = prefersLight ? 1.0 : 0.0;

    // Set material brightness
    material.uniforms.brightness.value = lightTheme;

    // Update camera position to orbit around the center
    const delta = clock.getDelta();
    angle += delta * 0.1;
    time += delta * 0.2; // Increment time for animation

    camera.position.x = Math.cos(angle) * 25;
    camera.position.y = 10 + Math.sin(angle * 0.5) * 5;
    camera.position.z = Math.sin(angle) * 25;
    camera.lookAt(0, 0, 0); // Look at the center

    // Update material's time
    material.uniforms.time.value = time;

    renderer.render(scene, camera); // Render the scene
}

// Start the animation loop
animate();

// Make the renderer and camera responsive to window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    material.uniforms.screenRatio.value = window.innerWidth / window.innerHeight; // Update screen ratio
});