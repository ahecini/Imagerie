
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
    return (1.0 - x) * a + x * b;
}


//------------------------------------------------------
// MAIN FUNCTION
//------------------------------------------------------

void main(void)
{
   vec2 uv = pos*30.0;
   vec2 ij = floor(uv);
   vec2 xy = fract(uv);
   float a = noise(ij);
   float b = noise(ij+vec2(1,0));
   float c = noise(ij+vec2(0,1));
   float d = noise(ij+vec2(1,1));
   float v1 = interpolate(xy[0], a, b);
   float v2 = interpolate(xy[0], c, d);
   float val = interpolate(xy[1], v1, v2);
   //val = noise(ij);
   vec3 col = vec3(val);
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
