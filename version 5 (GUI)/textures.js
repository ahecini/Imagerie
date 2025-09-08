
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
uniform int choice;
uniform int octaves;
float iTime = 0.0001;
float pi = 3.14159265358979323846;

//hash function that returns a gradient direction based on the hash value
vec2 hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)),
             dot(p, vec2(269.5, 183.3)));    //mélanger les coordonnées pour éviter les motifs répétitifs
	vec2 h = fract(sin(p) * 43758.5453123);      //produit des valeurs pseudos aléatoires
    return -1.0 + 2.0 * h; // normaliser entre -1 et 1
}

float interpolate(float value1, float value2, float value3, float value4, vec2 t) {
    return mix(mix(value1, value2, t.x), mix(value3, value4, t.x), t.y);
}

float interpolate2(float x, float a, float b) {
    return (1.0 - x) * a + x * b;
}

vec2 fade(vec2 t) {
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


float turbulence(vec2 position, float frequency, float degree)
{
  float value = 0.0, initialSize = frequency;

  while(frequency >= 1.0)
  {
    value += perlinNoise(position / frequency, 1, octaves, 0.5, 2.0) * frequency;
    frequency /= 2.0;
  }
  return(degree * value / initialSize);
}

float dist(vec2 point, float center){
    return sqrt(pow((point.x-center),2.0)+pow((point.y-center),2.0));
}

vec3 interpolateColor(float minimum, float maximum, vec3 v1, vec3 v2, float x)
{   
    float point = (x-minimum)/(maximum-minimum);
    return (1.0-point)*v1+(point)*v2;
}

vec4 island()
{
    float frequency = 16.0;
    vec2 position = frequency * pos;
    float value = 0.0;
    float pointDist = dist(position+turbulence(position, frequency, 1.0), frequency/2.0);

    float red = 0.0;
    float green = 0.0;
    float blue = 0.0;
    vec3 texture;
    if(pointDist<=1.0*pi)
    {
        value = 1.0*(sin(position.y*4.0+turbulence(position*4.0, frequency, 25.0)))*0.5+0.5;

        red = 0.2;
        green = 0.68;
        blue = 0.1;

        texture = mix(vec3(red-0.3*red, green-0.3*green, blue-0.3*blue),vec3(red, green, blue), value);
    }
    else if(pointDist>0.5 && pointDist<=(1.5*pi-(sin(1.0*time)-1.0)*0.1) )
    {
        value = 1.0*(sin(position.y*1.0+turbulence(position*1.0, frequency, 14.0)))*0.5+0.5;

        red = 0.8;
        green = 0.68;
        blue = 0.38;
        
        texture = mix(vec3(red-0.3*red, green-0.3*green, blue-0.3*blue),vec3(red, green, blue), value);
    }
    else if(pointDist>(1.5*pi-(sin(1.0*time)-1.0)*0.1) && pointDist<=2.5*pi)
    {
        value = 1.0*(sin(position.y*4.0+time+turbulence(position*4.0, frequency, 32.0)))*0.5+0.5;

        red = 0.8;
        green = 0.68;
        blue = 0.38;

        float minimum = (1.5*pi-(sin(1.0*time)-1.0)*0.1);
        float maximum = 2.5*pi;

        vec3 texture1 =  mix(vec3(red-0.3*red, green-0.3*green, blue-0.3*blue),vec3(red, green, blue), value);
        vec3 texture2 = mix(vec3(0.21, 0.6, 0.96),vec3(0.59, 0.78, 0.96),value);
        texture = interpolateColor(minimum, maximum, texture1, texture2, pointDist);
    }
    else
    {
        value = 1.0*(sin(position.x+time+turbulence(position, frequency, 128.0)))*0.5+0.5;

        red = value+0.41;
        green = value/4.0+0.2;
        blue = 0.02;

        texture = mix(vec3(0.21, 0.6, 0.96),vec3(0.59, 0.78, 0.96), value);
    }
    return vec4(vec3(texture), 1.0);
}

vec4 marble()
{
    float frequency = 16.0;
    vec2 position = frequency * pos;
    vec2 xy = fract(position);
    float value = 0.0;
    value = 1.0*(sin(position.x + position.y + turbulence(position, frequency, 64.0)))*0.5+0.5;
    return vec4(vec3(value, value, value), 1.0);
}

vec4 wood()
{
    float frequency = 128.0;
    vec2 position = frequency * pos;
    vec2 xy = fract(position);
    float value = 0.0;
    float pointDist = dist(position+turbulence(position, frequency, 3.0), frequency/2.0);
    value = 1.0*(sin(pointDist))*0.5+0.5;
    float red = value+0.41;
    float green = value/4.0+0.2;
    float blue = 0.02;
    vec3 wood = mix(vec3(0.55, 0.27, 0.07), vec3(0.82, 0.54, 0.22), value);
    return vec4(vec3(wood), 1.0);
}

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
            float distTurb = position.y + turb * turbulence(position, freq, 128.0)/256.0;

            float sunD = sin(position.y + turbulence(position, freq*2.0, 128.0) + time*2.0);
            sunD = (sunD + 1.0) * 0.5; // convert from range [-1, 1] to range [0, 1]  
            vec3 smokeColor = mix(vec3(0.6, 0.6, 0.7), vec3(0.9, 0.8, 0.5), sunD);
            FragColor = vec4(vec3(smokeColor), 1.0);
            return FragColor;

            } else {
            // Partie supérieure du soleil

            float distTurb = dist + turb * turbulence(position, freq, 128.0)/256.0;
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
            float fire = sin(position.x + position.y + turbulence(position, freq*6.0, 128.0) + time*2.0);
            fire = (fire + 1.0) * 0.5; // convert from range [-1, 1] to range [0, 1]
            vec3 fireColor = mix(vec3(1.0, 0.5, 0.0), vec3(1.0, 1.0, 0.0), fire);
            FragColor = vec4(vec3(fireColor), 1.0);
            return FragColor;
        }
        else {
            //eau
            float distTurb = position.y + turb * turbulence(position, freq, 128.0)/256.0;

            float water = sin(position.y + turbulence(position, freq*6.0, 128.0) + time*2.0);
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
            float water = sin(position.y + turbulence(position, freq*6.0, 128.0) + time*2.0);
            vec3 waterColor = mix(vec3(0.1, 0.3, 0.7), vec3(0.4, 0.8, 0.9), water);
            FragColor = vec4(waterColor, 1.0);
            return FragColor;
        } else {
            // Ciel dégradé bleu
            float t = (position.y - horizon) / (freq - horizon);
            vec3 skyColor = mix(vec3(0.9, 0.9, 0.7), vec3(0.1, 0.3, 0.7), t);
            return vec4(skyColor, 1.0);
        }
    }
    
}

// ----------------- DEFORMATION --------------
float riverOffset(float y) {
    float sinWave = sin(y * 0.1) * 5.0;
    float noise = perlinNoise(vec2(y * 0.05, 0.0)) * 5.0;
    return sinWave + noise;
}

vec4 river()
{
	float frequence = 64.0;
    vec2 position = pos*frequence;

	float centre = frequence / 2.0;
	float riv = frequence / 4.0;
	float offset = riverOffset(position.y);
	float dist = abs(position.x - (centre + offset));

    vec2 uv = pos * frequence;

	vec2 ij = floor(uv);
	float a = perlinNoise(ij);
	float b = perlinNoise(ij + vec2(1, 0));
	float c = perlinNoise(ij + vec2(0, 1));
	float d = perlinNoise(ij + vec2(1, 1));

	float posLocalX = uv.x - ij.x;
	float posLocalY = uv.y - ij.y;

	float v1 = interpolate2(posLocalX, a, b);
	float v2 = interpolate2(posLocalX, c, d);
	float val = interpolate2(posLocalY, v1, v2);

	vec3 color;
	if(dist >= riv) {
		// forêt
		color = mix(vec3(0.0, 0.5, 0.0), vec3(0.0, 0.9, 0.2), perlinNoise(position, 1, 6, 0.5, val)); // Côte
	} else {
		// rivière
		val = (position.y + turbulence(position, frequence, 1.0))*0.5 + 0.5;
	 	color = mix(vec3(0.0, 0.5, 1.0), vec3(0.0, 0.8, 0.8), perlinNoise(position, 5, 1, 0.5, val)); 
	}
	return vec4(vec3(color), 1.0);
}

void main() {
    switch(choice){
        case 0:
            FragColor = marble();
            break;
        case 1:
            FragColor = wood();
            break;            
        case 2:
            FragColor = island();
            break;
        case 3:
            FragColor = sunDown();
            break;
        case 4:
            FragColor = river();
            break;            
    }
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
        this.time = 0.0;

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
        this.shaderParams.choice = gl.getUniformLocation(this.shader, "choice");
        this.shaderParams.octaves = gl.getUniformLocation(this.shader, "octaves");

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
        gl.uniform1f(this.shaderParams.time,this.time);
        gl.uniform1i(this.shaderParams.choice,gui.texture.value);
        gl.uniform1i(this.shaderParams.octaves,gui.octaves.value);

	}

	// --------------------------------------------
	draw() {
		if(this.ready) {
            this.time = this.time + 0.1;
			gl.useProgram(this.shader);

			this.setShadersParams(); 
			gl.drawArrays(gl.TRIANGLE_FAN, 0, this.vBuffer.numItems); 

			gl.disableVertexAttribArray(this.shaderParams.vAttrib);
			gl.useProgram(null);
		}
	}
}










//
