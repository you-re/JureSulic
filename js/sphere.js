import * as THREE from 'three';

export const sphereShader = {
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        varying vec2 vUv;
        uniform float time;
        void main() {
            vUv = uv;
            float noise = 0.2 * sin(10.0 * uv.x + time) * cos(10.0 * uv.y + time);
            vec3 newPosition = position + normal * noise;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
        }
    `,
    fragmentShader: `
        varying vec2 vUv;
        void main() {
            gl_FragColor = vec4(0.67, 0.73, 1.0, 0.3);
        }
    `,
    wireframe: true,
    transparent: true
};

// Usage example:
// import { sphereShader } from './sphereShader.js';
// const material = new THREE.ShaderMaterial(sphereShader);
