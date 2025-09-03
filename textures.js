
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

//------------------------------------------------------
// NAIVE VERSION
//------------------------------------------------------
   
float noise(vec2 v) {
    return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453123);
}

//------------------------------------------------------
// INTERPOLATE FUNCTION
//------------------------------------------------------
   
float interpolate(float x, float a, float b) {
	return a + x * (b - a);
}

//------------------------------------------------------
// FADE FUNCTION
//------------------------------------------------------

float fade(float t){
	return 6.0*t*t*t*t*t - 15.0*t*t*t*t + 10.0*t*t*t;
}

//------------------------------------------------------
// HASH FUNCTION
//------------------------------------------------------

vec2 hash2(vec2 p)
{
	p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
	return fract(sin(p + 20.0) * 53758.5453123) * 2.0 - 1.0;
}


//------------------------------------------------------
// MAIN FUNCTION
//------------------------------------------------------

void main(void)
{
   vec2 uv = pos*5.0;
   vec2 ij = floor(uv);
   vec2 xy = fract(uv);

   vec2 b1 = vec2(0,0);
   vec2 b2 = vec2(1,0);
   vec2 b3 = vec2(0,1);
   vec2 b4 = vec2(1,1);

   vec2 v1 = hash2(ij+b1);
   vec2 v2 = hash2(ij+b2);
   vec2 v3 = hash2(ij+b3);
   vec2 v4 = hash2(ij+b4);

   vec2 p1 = xy-b1;
   vec2 p2 = xy-b2;
   vec2 p3 = xy-b3;
   vec2 p4 = xy-b4;

   float a = dot(p1,v1);
   float b = dot(p2,v2);
   float c = dot(p3,v3);
   float d = dot(p4,v4);

   float x = fade(xy.x);
   float y = fade(xy.y);

   float i1 = interpolate(x, a, b);
   float i2 = interpolate(x, c, d);
   float val = interpolate(y, i1, i2);

   vec3 col = vec3(val+0.5);
   FragColor = vec4(col,1.0);
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
