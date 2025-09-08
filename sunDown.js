
// =====================================================
// PLAN 3D, Support géométrique
// =====================================================

shaders['textures'] = {
vert:`#version 300 es
//================================================================
layout(location = 0) in vec2 aVpos;

uniform mat4 uPMatrix;
uniform mat4 uMVMatrix;

out vec2 pos;

void main(void) {
    pos=aVpos;
    gl_Position = uPMatrix * uMVMatrix * vec4(aVpos*1.9-0.95, 0.0, 1.0);
}
//================================================================`
,

frag:`#version 300 es
//================================================================

precision mediump float;
in vec2 pos;
out vec4 FragColor;
vec2 iResolution = vec2(512, 512);
uniform float time;


//VERSIONS Improved 2D fast perlin noise

// implementation of MurmurHash (https://sites.google.com/site/murmurhash/) for a 
// single unsigned integer.

uint hash(uint x, uint seed) {
    const uint m = 0x5bd1e995U;
    uint hash = seed;
    // process input
    uint k = x;
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
}

// implementation of MurmurHash (https://sites.google.com/site/murmurhash/) for a  
// 2-dimensional unsigned integer input vector.

uint hash(uvec2 x, uint seed){
    const uint m = 0x5bd1e995U;
    uint hash = seed;
    // process first vector element
    uint k = x.x; 
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
    // process second vector element
    k = x.y; 
    k *= m;
    k ^= k >> 24;
    k *= m;
    hash *= m;
    hash ^= k;
	// some final mixing
    hash ^= hash >> 13;
    hash *= m;
    hash ^= hash >> 15;
    return hash;
}

//hash function that returns a gradient direction based on the hash value
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));    //mélanger les coordonnées pour éviter les motifs répétitifs
	vec2 h = fract(sin(p) * 43758.5453123);      //produit des valeurs pseudos aléatoires
    return -1.0 + 2.0 * h; // normaliser entre -1 et 1
}

vec2 gradientDirection(uint hash) {
    switch (int(hash) & 3) { // look at the last two bits to pick a gradient direction
    case 0:
        return vec2(1.0, 1.0);
    case 1:
        return vec2(-1.0, 1.0);
    case 2:
        return vec2(1.0, -1.0);
    case 3:
        return vec2(-1.0, -1.0);
    }
}

float interpolate(float value1, float value2, float value3, float value4, vec2 t) {
    return mix(mix(value1, value2, t.x), mix(value3, value4, t.x), t.y);
}

vec2 fade(vec2 t) {
    // 6t^5 - 15t^4 + 10t^3
	return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

float perlinNoise(vec2 position) {
    vec2 floorPosition = floor(position);
    vec2 fractPosition = position - floorPosition;
    //uvec2 cellCoordinates = uvec2(floorPosition);

    //Calcul du produit scalaire entre le gradient et le vecteur de distance
    float value1 = dot(hash2(floorPosition), fractPosition);
    float value2 = dot(hash2(floorPosition + vec2(1, 0)), fractPosition - vec2(1.0, 0.0));
    float value3 = dot(hash2(floorPosition + vec2(0, 1)), fractPosition - vec2(0.0, 1.0));
    float value4 = dot(hash2(floorPosition + vec2(1, 1)), fractPosition - vec2(1.0, 1.0));
    return interpolate(value1, value2, value3, value4, fade(fractPosition));
}


float perlinNoise(vec2 position, int frequency, int octaveCount, float persistence, float lacunarity) {
    float value = 0.0;
    float amplitude = 1.0;
    float currentFrequency = float(frequency);
    float maxAmplitude = 0.0;
    //uint currentSeed = seed;
    for (int i = 0; i < octaveCount; i++) {
        //currentSeed = hash(currentSeed, 0x0U); // create a new seed for each octave
        value += perlinNoise(position * currentFrequency) * amplitude;
        amplitude *= persistence;
        currentFrequency *= lacunarity;
        maxAmplitude += amplitude;
    }
    return value/maxAmplitude; // normaliser le résultat final
}

//Function turbulence
float turbulence(vec2 position, float frequency)
{
    float value = 0.0;
    float size = frequency;
    while(size >= 1.0)
    {
        value += perlinNoise(position/size, 1, 6, 0.5, 2.0) * size;
        size /= 2.0;
    }
    return (128.0 * value/frequency);
}

//================================================================
//Fonction sunDown
//================================================================
vec4 sunDown()
{   
    float freq = 128.0;
    vec2 position = pos*freq;

    float turb = 0.5;
    float period = 12.0;

    //float value = perlinNoise(position, 1, 6, 0.5, 2.0); // multiple octaves
    //marble 
    //float marble = sin(position.x + position.y + turbulence(position, freq));

    float dist = sqrt(pow((position.x - freq/2.0), 2.0) + pow((position.y - freq/2.0), 2.0)); 
    
    //sun 
    if (dist < 45.0){
        float sunY = freq/2.5; // 
        float sunX = freq/2.5; // centre horizontal

        float distSun = sqrt(pow((position.x - sunX), 2.0) + pow((position.y - sunY), 2.0));

        // Diviser le soleil en deux parties horizontales
        if (position.y < sunY) {
            // Partie inférieure du soleil reflété dans l'eau
            float distTurb = position.y + turb * turbulence(position, freq)/256.0;

            float sunD = sin(position.y + turbulence(position, freq*2.0) + time*2.0);
            sunD = (sunD + 1.0) * 0.5; // convert from range [-1, 1] to range [0, 1]  
            vec3 smokeColor = mix(vec3(0.6, 0.6, 0.7), vec3(0.9, 0.8, 0.5), sunD);
            FragColor = vec4(vec3(smokeColor), 1.0);
            return FragColor;

            } else {
            // Partie supérieure du soleil

            float distTurb = dist + turb * turbulence(position, freq)/256.0;
            float sun = 128.0*sin(2.0*period*distTurb*3.14159);
            sun = (sun + 128.0) / 256.0;
            vec3 sunColor = vec3(0.9, 0.8, 0.0);
            FragColor = vec4(vec3(sunColor), 1.0); 
            return FragColor;
        } 

    }
    else if (dist >= 45.0 && dist < 46.0 ){
        float fireX = freq/2.5; // centre horizontal
        float fireY = freq/2.5; // 30.0 contrôle la vitesse de descente
        float distSun = sqrt(pow((position.x - fireX), 2.0) + pow((position.y - fireY), 2.0));

        if (position.y > fireY) {
            //Fire
            float fire = sin(position.x + position.y + turbulence(position, freq*6.0) + time*2.0);
            fire = (fire + 1.0) * 0.5; // convert from range [-1, 1] to range [0, 1]
            vec3 fireColor = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), fire);
            FragColor = vec4(vec3(fireColor), 1.0);
            return FragColor;
        }
        else {
            //eau
            float distTurb = position.y + turb * turbulence(position, freq)/256.0;

            float water = sin(position.y + turbulence(position, freq*6.0) + time*2.0);
            water = (water + 1.0) * 0.5; // convert from range [-1, 1] to range [0, 1]
            vec3 waterColor = mix(vec3(0.3, 0.3, 0.5), vec3(0.4, 0.8, 0.9), water);
            FragColor = vec4(vec3(waterColor), 1.0);
            return FragColor;
        }   
        
    }

    else {
        // Diviser horizontalement
        float horizon = freq /2.5; // 
        if (position.y < horizon) {
            // Eau avec vagues animées
            float water = sin(position.y + turbulence(position, freq*6.0) + time*2.0);
            vec3 waterColor = mix(vec3(0.1, 0.3, 0.7), vec3(0.4, 0.8, 0.9), water);
            FragColor = vec4(waterColor, 1.0);
            return FragColor;
        } else {
            // Ciel dégradé bleu
            float t = (position.y - horizon) / (freq - horizon);
            vec3 skyColor = mix(vec3(0.9, 0.9, 0.7), vec3(0.1, 0.3, 0.7), t);
            FragColor = vec4(skyColor, 1.0);
            return FragColor;
        }
    }
    
    }

void main() {

    //Appel de la fonction sunDown
    sunDown();
}
//================================================================`

};




class textures {

	// --------------------------------------------
	constructor() {
		this.ready = false;
		this.shaderParams = {};
		this.shader=null;
		this.vsTxt = shaders['textures'].vert;
		this.fsTxt = shaders['textures'].frag;

		compileShaders(this);

      this.initAll();
	}

	// --------------------------------------------
	initAll() {
		var vertices = [0,0,  1,0,  1,1,  0,1];
		gl.useProgram(this.shader);
		this.vBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

		this.shaderParams.vAttrib = gl.getAttribLocation(this.shader, "aVpos");
		this.shaderParams.pMatrixUniform = gl.getUniformLocation(this.shader, "uPMatrix");
		this.shaderParams.mvMatrixUniform = gl.getUniformLocation(this.shader, "uMVMatrix");
        this.shaderParams.time = gl.getUniformLocation(this.shader, "time");


		this.vBuffer.itemSize = 2;
		this.vBuffer.numItems = 4;
	   this.ready=true;
	}

	// --------------------------------------------
	setShadersParams() {

		mat4.perspective(45, gl.width / gl.height, 0.1, 100.0, pMatrix);
		mat4.identity(mvMatrix);
		mat4.translate(mvMatrix, [trX, trY, renderData.dist]);
		mat4.multiply(mvMatrix, rotMatrix);
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);

		gl.vertexAttribPointer(this.shaderParams.vAttrib, this.vBuffer.itemSize, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(this.shaderParams.vAttrib);

		gl.uniformMatrix4fv(this.shaderParams.pMatrixUniform, false, pMatrix);
		gl.uniformMatrix4fv(this.shaderParams.mvMatrixUniform, false, mvMatrix);
        gl.uniform1f(this.shaderParams.time, performance.now() * 0.001);

	}

	// --------------------------------------------
	draw() {
		if(this.ready) {

			gl.useProgram(this.shader);

			this.setShadersParams(); 
			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems); 

			gl.disableVertexAttribArray(this.shaderParams.vAttrib);
			gl.useProgram(null);
		}
	}
}










//
