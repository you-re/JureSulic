// Basic Three.js animated background
const container = document.getElementById('three-bg');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth/window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
container.appendChild(renderer.domElement);

// Example: animated rotating wireframe sphere
const geometry = new THREE.SphereGeometry(2, 16, 16);
// Vertex and fragment shaders for noise displacement
const vertexShader = `
    varying vec2 vUv;
    uniform float time;
    void main() {
        vUv = uv;
        // Simple noise using sin/cos for demonstration
        float noise = 0.2 * sin(10.0 * uv.x + time) * cos(10.0 * uv.y + time);
        vec3 newPosition = position + normal * noise;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
    }
`;

const fragmentShader = `
    varying vec2 vUv;
    void main() {
        gl_FragColor = vec4(0.67, 0.73, 1.0, 0.3); // rgba for #aabbff with alpha
    }
`;

const material = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader,
    fragmentShader,
    wireframe: true,
    transparent: true
});

// Animate the time uniform
function animate() {
    requestAnimationFrame(animate);
    material.uniforms.time.value = performance.now() * 0.001;
    sphere.rotation.x += 0.003;
    sphere.rotation.y += 0.004;
    renderer.render(scene, camera);
}
const sphere = new THREE.Mesh(geometry, material);
scene.add(sphere);

camera.position.z = 10;

animate();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});