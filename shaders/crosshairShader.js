"use strict";
export const CrosshairShader = {
    uniforms: {
        'cameraPosition': { value: new THREE.Vector3(0, 0, 0) },
        'crosshairThickness': { value: 0.1 },
        'fogIntensity': { value: 4.0 },
    },

    vertexShader: `
        varying float vDepth;
        void main() {
            // Option 1: Use view space z (depth)
            vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
            vDepth = -mvPosition.z; // z-depth in view space (positive in front of camera)
            gl_PointSize = 10.0;
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    
    fragmentShader: `
        varying float vDepth;
        uniform float crosshairThickness;
        uniform float fogIntensity;
        void main() {
            vec2 uv = gl_PointCoord; // Get point texture coordinates
            float h_line = abs(uv.y - 0.5) * 2.0 > crosshairThickness ? 1.0 : 0.0; // Horizontal line
            float v_line = abs(uv.x - 0.5) * 2.0 > crosshairThickness ? 1.0 : 0.0; // Vertical line

            float crosshair = h_line * v_line; // Combine horizontal and vertical lines

            if (crosshair > 0.1) discard;
            
            float alpha = pow(1.0 - smoothstep(20.0, 50.0, vDepth), fogIntensity); // Use vDepth for transparency
            gl_FragColor = vec4(crosshair, crosshair, crosshair, alpha);
        }
    `,
    transparent: true,
};