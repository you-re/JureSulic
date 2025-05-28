// Import the SimplexNoise class for generating noise
import { SimplexNoise } from '/js/simplexNoise.js';
import { CrosshairShader } from '/shaders/crosshairShader.js';

// Get the container element for rendering Three.js
const container = document.getElementById('threejs-container');

// Create a new Three.js scene
const scene = new THREE.Scene();

// Set up a perspective camera
const camera = new THREE.PerspectiveCamera(
    50, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);

// Create a WebGL renderer with antialiasing and alpha transparency
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight); // Set renderer size
container.appendChild(renderer.domElement); // Add renderer to the DOM

// Define grid size and number of divisions for the plane
const gridSize = 30;
const divisions = 32;

// Create a buffer geometry for the points
const geometry = new THREE.BufferGeometry();
const positions = [];

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
        ...(CrosshairShader.uniforms || {})
    },
    vertexShader: CrosshairShader.vertexShader,
    fragmentShader: CrosshairShader.fragmentShader,
    transparent: true
});

// Create a Points mesh from the geometry and material
const pointsMesh = new THREE.Points(geometry, material);
scene.add(pointsMesh); // Add points mesh to the scene

// Create a SimplexNoise instance for animating the points
const noise = new SimplexNoise();

// Variable to keep track of camera orbit angle
let angle = 0;

// Animation loop
function animate(time) {
    // Update camera position to orbit around the center
    angle += 0.0005;
    camera.position.x = Math.cos(angle) * 25;
    camera.position.y = 10 + Math.sin(angle * 0.5) * 5;
    camera.position.z = Math.sin(angle) * 25;
    camera.lookAt(0, 0, 0); // Look at the center

    // Animate point positions using 3D noise for smooth wave effect
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
        const ix = i * 3;
        const x = pos.getX(i);
        const z = pos.getZ(i);
        // Calculate new Y position using noise based on x, z, and time
        const y = noise.noise3D(x * 0.15, z * 0.15, time * 0.00025) * 1.5;
        pos.setY(i, y);
    }
    pos.needsUpdate = true; // Notify Three.js that positions have changed

    renderer.render(scene, camera); // Render the scene
    requestAnimationFrame(animate); // Request next frame
}

// Set initial camera position and orientation
camera.position.set(0, 15, 30);
camera.lookAt(0, 0, 0);

// Start the animation loop
animate();

// Make the renderer and camera responsive to window resizing
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});