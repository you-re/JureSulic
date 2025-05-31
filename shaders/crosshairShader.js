"use strict";
/**
 * Simplex noise implementation 3D for GLSL.
 * Source: https://github.com/ashima/webgl-noise (public domain)
 */

import * as THREE from '../three/build/three.module.js';

const simplexNoiseGLSL = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

// 3D simplex noise
float snoise(vec3 v)
{
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const float N = 0.142857142857; // 1.0/7.0
    const float D = 0.36787944117; // exp(-1.0)
    // First corner
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 =   v - i + dot(i, C.xxx) ;

    // Other corners
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );

    // x0 = x0 - 0.0 + 0.0 * C.xxx;
    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    // Permutations
    i = mod289(i);
    vec4 p = permute(
        permute(
            permute(
                vec4(i.z, i.z + i1.z, i.z + i2.z, i.z + 1.0)
            ) + i.y + vec4(0.0, i1.y, i2.y, 1.0)
        ) + i.x + vec4(0.0, i1.x, i2.x, 1.0)
    );

    // Gradients: 7x7 points over a square, mapped onto an octahedron.
    float n_ = 0.142857142857; // 1.0/7.0
    vec3  ns = n_ * vec3(1.0, 2.0, 3.0) - vec3(0.0, 1.0, 2.0) * n_;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  // mod(p,7*7)

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

    vec4 x = (x_ *ns.x)+ns.y;
    vec4 y = (y_ *ns.x)+ns.y;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );

    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);

    // Normalise gradients
    vec4 norm = inversesqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    // Mix final noise value
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                  dot(p2,x2), dot(p3,x3) ) );
}
`;

export const CrosshairShader = {
    uniforms: {
    'mousePosition' : { value: new THREE.Vector2(0, 0) },
		'crosshairThickness': { value: 0.1 },
		'fogIntensity': { value: 2.0 },
		'time': { value: 0.0 },
		'brightness': { value: 0.0 },
    'screenRatio': { value: window.innerWidth / window.innerHeight },
    },

    vertexShader: `
		${simplexNoiseGLSL}
		varying float vDepth;
		varying vec2 vScreenCoord;

		uniform float time;
		uniform float supersamplingRatio;

		void main() {
			vec3 seed = vec3(position * 0.1) + vec3(time + 13.5, time + 87.64, time + 98.21);
			float posy = snoise(seed) * 2.0;
			vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
			vDepth = -mvPosition.z; // z-depth in view space (positive in front of camera)
			gl_PointSize = 30.0;
      vec4 displacement = projectionMatrix * mvPosition + vec4(0.0, posy, 0.0, 0.0);

			gl_Position = displacement;
      vScreenCoord = displacement.xy / displacement.w * 0.5 + 0.5;
      }
    `,
    
    fragmentShader: `
		varying float vDepth;
		varying vec2 vScreenCoord;
    
    uniform float screenRatio;
		uniform vec2 mousePosition;
		uniform float crosshairThickness;
		uniform float fogIntensity;
		uniform float brightness;
		uniform sampler2D crosshairTexture;

    // Remap function
    float map(float value, float inMin, float inMax, float outMin, float outMax) {
      return (value - inMin) / (inMax - inMin) * (outMax - outMin) + outMin;
    }

    void main() {
      float dist;
      float crosshair;
      float x, y;

			float alpha = pow(1.0 - smoothstep(20.0, 50.0, vDepth), fogIntensity); // Use vDepth for transparency

			vec2 uv = gl_PointCoord; // Get point texture coordinates

			uv = (uv - vec2(0.5, 0.5)) * vec2(2.0, 2.0); // Offset to center and normalize

      x = abs(uv.x) > crosshairThickness ? 0.0 : 1.0;
      y = abs(uv.y) > crosshairThickness ? 0.0 : 1.0;

			crosshair = max(x, y); // Crosshair effect

      float dot = x * y;

      float uvLength = 1.0 - max(abs(uv.x), abs(uv.y));
      crosshair *= uvLength; // Combine crosshair and distance

      
      vec2 sscoord = vScreenCoord;

      vec2 screenRatio = (mousePosition - sscoord) * vec2(screenRatio, 1.0); // Fix screen aspect ratio so we get circle

      dist = length(screenRatio);
			dist = map(dist, 0.0, 0.25, 1.0, 0.0);
      dist = clamp(dist, 0.0, 1.0);
      dist = 1.0 - pow(dist, 2.0);

      float color = dist < crosshair ? 1.0 : 0.0; // Combine crosshair and distance
      color = max(color, dot);

			if (color < 0.1) discard;

      color = 1.0 - brightness;

			gl_FragColor = vec4(color, color, color, alpha);
		}
    `,
    transparent: true,
};