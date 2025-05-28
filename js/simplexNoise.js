/**
 * SimplexNoise generates 3D simplex noise values.
 * 
 * Example usage:
 * 
 * ```javascript
 * // Import or include SimplexNoise in your script
 * const simplex = new SimplexNoise();
 * const value = simplex.noise3D(x, y, z);
 * ```
 * 
 * @class
 * @param {function} [r] - Optional random function for permutation table seeding. Defaults to Math.random.
 */
 
/**
 * Generates 3D simplex noise for the given coordinates.
 * 
 * @method
 * @name SimplexNoise#noise3D
 * @param {number} xin - X coordinate.
 * @param {number} yin - Y coordinate.
 * @param {number} zin - Z coordinate.
 * @returns {number} Noise value in the range [-1, 1].
 */
class SimplexNoise {
    constructor(r) {
        if (!r) r = Math.random;
        this.p = new Uint8Array(256);
        for (let i = 0; i < 256; i++) {
            this.p[i] = i;
        }
        let n, q;
        for (let i = 255; i > 0; i--) {
            n = Math.floor((i + 1) * r());
            q = this.p[i];
            this.p[i] = this.p[n];
            this.p[n] = q;
        }
        this.perm = new Uint8Array(512);
        for (let i = 0; i < 512; i++) {
            this.perm[i] = this.p[i & 255];
        }
    }
    noise3D(xin, yin, zin) {
        const grad3 = [
            [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
            [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
            [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
        ];
        const F3 = 1/3;
        const G3 = 1/6;
        let n0, n1, n2, n3;
        let s = (xin + yin + zin) * F3;
        let i = Math.floor(xin + s);
        let j = Math.floor(yin + s);
        let k = Math.floor(zin + s);
        let t = (i + j + k) * G3;
        let X0 = i - t;
        let Y0 = j - t;
        let Z0 = k - t;
        let x0 = xin - X0;
        let y0 = yin - Y0;
        let z0 = zin - Z0;
        let i1, j1, k1;
        let i2, j2, k2;
        if (x0 >= y0) {
            if (y0 >= z0) {
                i1=1; j1=0; k1=0; i2=1; j2=1; k2=0;
            } else if (x0 >= z0) {
                i1=1; j1=0; k1=0; i2=1; j2=0; k2=1;
            } else {
                i1=0; j1=0; k1=1; i2=1; j2=0; k2=1;
            }
        } else {
            if (y0 < z0) {
                i1=0; j1=0; k1=1; i2=0; j2=1; k2=1;
            } else if (x0 < z0) {
                i1=0; j1=1; k1=0; i2=0; j2=1; k2=1;
            } else {
                i1=0; j1=1; k1=0; i2=1; j2=1; k2=0;
            }
        }
        let x1 = x0 - i1 + G3;
        let y1 = y0 - j1 + G3;
        let z1 = z0 - k1 + G3;
        let x2 = x0 - i2 + 2*G3;
        let y2 = y0 - j2 + 2*G3;
        let z2 = z0 - k2 + 2*G3;
        let x3 = x0 - 1 + 3*G3;
        let y3 = y0 - 1 + 3*G3;
        let z3 = z0 - 1 + 3*G3;
        i &= 255;
        j &= 255;
        k &= 255;
        let gi0 = this.perm[i + this.perm[j + this.perm[k]]] % 12;
        let gi1 = this.perm[i + i1 + this.perm[j + j1 + this.perm[k + k1]]] % 12;
        let gi2 = this.perm[i + i2 + this.perm[j + j2 + this.perm[k + k2]]] % 12;
        let gi3 = this.perm[i + 1 + this.perm[j + 1 + this.perm[k + 1]]] % 12;
        let t0 = 0.6 - x0*x0 - y0*y0 - z0*z0;
        if (t0 < 0) n0 = 0.0;
        else {
            t0 *= t0;
            n0 = t0 * t0 * (grad3[gi0][0]*x0 + grad3[gi0][1]*y0 + grad3[gi0][2]*z0);
        }
        let t1 = 0.6 - x1*x1 - y1*y1 - z1*z1;
        if (t1 < 0) n1 = 0.0;
        else {
            t1 *= t1;
            n1 = t1 * t1 * (grad3[gi1][0]*x1 + grad3[gi1][1]*y1 + grad3[gi1][2]*z1);
        }
        let t2 = 0.6 - x2*x2 - y2*y2 - z2*z2;
        if (t2 < 0) n2 = 0.0;
        else {
            t2 *= t2;
            n2 = t2 * t2 * (grad3[gi2][0]*x2 + grad3[gi2][1]*y2 + grad3[gi2][2]*z2);
        }
        let t3 = 0.6 - x3*x3 - y3*y3 - z3*z3;
        if (t3 < 0) n3 = 0.0;
        else {
            t3 *= t3;
            n3 = t3 * t3 * (grad3[gi3][0]*x3 + grad3[gi3][1]*y3 + grad3[gi3][2]*z3);
        }
        return 32.0*(n0 + n1 + n2 + n3);
    }
}

export { SimplexNoise };