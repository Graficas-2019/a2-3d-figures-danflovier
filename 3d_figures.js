var projectionMatrix;

var shaderProgram, shaderVertexPositionAttribute, shaderVertexColorAttribute, 
    shaderProjectionMatrixUniform, shaderModelViewMatrixUniform;

var duration = 5000; // ms

// Attributes: Input variables used in the vertex shader. Since the vertex shader is called on each vertex, these will be different every time the vertex shader is invoked.
// Uniforms: Input variables for both the vertex and fragment shaders. These do not change values from vertex to vertex.
// Varyings: Used for passing data from the vertex shader to the fragment shader. Represent information for which the shader can output different value for each vertex.
var vertexShaderSource =    
    "    attribute vec3 vertexPos;\n" +
    "    attribute vec4 vertexColor;\n" +
    "    uniform mat4 modelViewMatrix;\n" +
    "    uniform mat4 projectionMatrix;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "		// Return the transformed and projected vertex value\n" +
    "        gl_Position = projectionMatrix * modelViewMatrix * \n" +
    "            vec4(vertexPos, 1.0);\n" +
    "        // Output the vertexColor in vColor\n" +
    "        vColor = vertexColor;\n" +
    "    }\n";

// precision lowp float
// This determines how much precision the GPU uses when calculating floats. The use of highp depends on the system.
// - highp for vertex positions,
// - mediump for texture coordinates,
// - lowp for colors.
var fragmentShaderSource = 
    "    precision lowp float;\n" +
    "    varying vec4 vColor;\n" +
    "    void main(void) {\n" +
    "    gl_FragColor = vColor;\n" +
    "}\n";

function initWebGL(canvas)
{
    var gl = null;
    var msg = "Your browser does not support WebGL, " +
        "or it is not enabled by default.";
    try 
    {
        gl = canvas.getContext("experimental-webgl");
    } 
    catch (e)
    {
        msg = "Error creating WebGL Context!: " + e.toString();
    }

    if (!gl)
    {
        alert(msg);
        throw new Error(msg);
    }

    return gl;        
 }

function initViewport(gl, canvas)
{
    gl.viewport(0, 0, canvas.width, canvas.height);
}

function initGL(canvas)
{
    // Create a project matrix with 45 degree field of view
    projectionMatrix = mat4.create();
    mat4.perspective(projectionMatrix, Math.PI / 4, canvas.width / canvas.height, 1, 10000);
}

// Create the functions for each of the figures.
// Create the vertex, color and index data for a multi-colored pyramid
function createPyramid(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
    	// PENTAGON
        0.0, 1.0, 0.0,		// 0
        -0.95, 0.3, 0.0,	// 1 - left
        0.95, 0.3, 0.0,		// 2 - right
       -0.55, -0.8, 0.0,	// 3 - left
        0.55, -0.8, 0.0,	// 4 - right
        // SIDE 1
        0.0, 1, 0.0,		// 5 - right
        -0.95, 0.3, 0.0,	// 6 - left
         0.0, 0.0, 2.5,		// 7 - top
        // SIDE 2
        -0.95, 0.3, 0.0,	// 8 - right
        -0.55,  -0.8, 0.0,	// 9 - left
        0.0, 0.0, 2.5,		// 10 - top
        // SIDE 2
        -0.55, -0.8, 0.0,	// 11 - right
        0.55, -0.8, 0.0,	// 12 - left
        0.0, 0.0, 2.5,		// 13 - top
        // SIDE 4
        0.55,  -0.8, 0.0,	// 14 - right
        0.95, 0.3, 0.0,		// 15 - left
        0.0, 0.0, 2.5,		// 16 - top
        // SIDE 5
        0.95, 0.3, 0.0,		// 17 - right
        0.0, 1.0, 0.0,		// 18 - left
        0.0, 0.0, 2.5,		// 19 - top
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0], // PETAGON Red
        [0.0, 1.0, 0.0, 1.0], // SIDE 1 Green
        [0.0, 0.0, 1.0, 1.0], // SIDE 2 Blue
        [1.0, 1.0, 0.0, 1.0], // SIDE 3 Yellow
        [1.0, 0.0, 1.0, 1.0], // SIDE 4 Magenta
        [0.0, 1.0, 1.0, 1.0]  // SIDE 5 Cyan
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the pyramid's face.
    var vertexColors = [];
    // for (var i in faceColors) 
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }
    for (const color of faceColors) 
    {
        for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var pyramidIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, pyramidIndexBuffer);
    var pyramidIndices = [
        0, 3, 1,  0, 3, 4, 0, 4, 2,	// PENTAGON
        5, 6, 7,					// SIDE 1
        8, 9, 10,					// SIDE 2
        11, 12, 13,					// SIDE 3
        14, 15, 16,					// SIDE 4
        17, 18, 19					// SIDE 5
        
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(pyramidIndices), gl.STATIC_DRAW);
    
    var pyramid = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:pyramidIndexBuffer,
            vertSize:3, nVerts:verts.length, colorSize:4, nColors: verts.length, nIndices:pyramidIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(pyramid.modelViewMatrix, pyramid.modelViewMatrix, translation);

    pyramid.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return pyramid;
}

// Create the vertex, color and index data for a multi-colored dodecahedron
function createDodecahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    var verts = [
    	// SIDE 1
    	1.618, 0.0, 0.618,	//A - 0
    	1.618, 0.0,-0.618,	//D - 1
    	1.0, 1.0, 1.0,		//M - 2
    	1.0, 1.0, -1.0,		//R - 3
    	0.618, 1.618, 0.0,	//E - 4
		// SIDE 2
		0.0,-0.618,1.618,	//L - 5
		1.0,-1.0,1.0,		//N - 6
		0.0, 0.618, 1.618,	//I - 7
    	1.618, 0.0, 0.618,	//A - 8
    	1.0, 1.0, 1.0,		//M - 9
		// SIDE 3
    	-1.0, 1.0, 1.0,		//P - 10
    	0.0, 0.618, 1.618,	//I - 11
    	-0.618, 1.618, 0.0,	//H - 12
    	1.0, 1.0, 1.0,		//M - 13
    	0.618, 1.618, 0.0,	//E - 14
    	// SIDE 4
    	-0.618, 1.618, 0.0,	//H - 15
    	0.618, 1.618, 0.0,	//E - 16
    	-1.0, 1.0, -1.0,	//Q - 17
    	1.0, 1.0, -1.0,		//R - 18
    	0,0.618,-1.618,		//J - 19
    	// SIDE 5
    	1.0, -1.0, 1.0,		//N - 20
    	0.618, -1.618, 0.0,	//F - 21
    	1.618, 0.0, 0.618,	//A - 22
    	1.0, -1.0, -1.0,	//S - 23
    	1.618, 0.0, -0.618,	//D - 24
    	// SIDE 6
    	0,-0.618,-1.618,	//K - 25
    	0,0.618,-1.618,		//J - 26
    	1.0, -1.0, -1.0,	//S - 27
    	1.0, 1.0, -1.0,		//R - 28
    	1.618, 0.0,-0.618,	//D - 29
    	
		// SIDE 7
    	-1.618, 0.0, -0.618,//C - 30
    	-1.0,-1.0,-1.0,		//T - 31
    	-1.0, 1.0, -1.0,	//Q - 32
    	0,-0.618,-1.618,	//K - 33
    	0,0.618,-1.618,		//J - 34
    	// SIDE 8
    	-0.618, 1.618, 0.0,	//H - 35
    	-1.0, 1.0, -1.0,	//Q - 36
    	-1.0, 1.0, 1.0,		//P - 37
    	-1.618, 0.0,-0.618,	//C - 38
    	-1.618, 0.0, 0.618,	//B - 39
    	// SIDE 9
    	0.0, -0.618, 1.618,	//L - 40
    	0.0, 0.618, 1.618,	//I - 41
    	-1.0, -1.0, 1.0,	//O - 42
    	-1.0, 1.0, 1.0,		//P - 43
    	-1.618, 0.0, 0.618,	//B - 44
    	// SIDE 10
    	0.0, -0.618, 1.618,	//L - 45
    	-1.0, -1.0, 1.0,	//O - 46
    	1.0, -1.0, 1.0,		//N - 47
    	-0.618,-1.618,0.0,	//G - 48
    	0.618, -1.618, 0.0,	//F - 49
    	// SIDE 11
    	1.0, -1.0, -1.0,	//S - 50
    	0.618, -1.618, 0.0,	//F - 51
    	0,-0.618,-1.618,	//K - 52
    	-0.618,-1.618,0.0,	//G - 53
    	-1.0,-1.0,-1.0,		//T - 54
    	// SIDE 12
    	-1.618, 0.0,-0.618,	//C - 55
    	-1.0,-1.0,-1.0,		//T - 56
    	-1.618, 0.0, 0.618,	//B - 57
    	-0.618,-1.618,0.0,	//G - 58
    	-1.0, -1.0, 1.0		//O - 59
       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0],	// SIDE 1 - Rojo
        [0.0, 1.0, 0.0, 1.0],	// SIDE 2 - Verde
        [1.0, 1.0, 0.0, 1.0],	// SIDE 3 - Amarillo
        [1.0, 1.0, 0.0, 1.0],	// SIDE 3
        [1.0, 0.0, 1.0, 1.0],	// SIDE 4 - Magenta
        [1.0, 1.0, 1.0, 1.0],	// SIDE 5 - Blanca
        [0.0, 1.0, 1.0, 1.0],	// SIDE 6 - Cyan
        [0.0, 1.0, 1.0, 1.0],	// SIDE
        [1.0, 0.0, 1.0, 1.0],	// SIDE 7 - Magenta
        [0.0, 0.0, 1.0, 1.0],	// SIDE 8 - Azul
        [1.0, 0.0, 0.0, 1.0],	// SIDE 9 - Rojo
        [1.0, 1.0, 0.0, 1.0],	// SIDE 10 - Amarillo
        [1.0, 0.0, 1.0, 1.0],	// SIDE 11 - Blanco
        [1.0, 1.0, 0.0, 1.0],	// SIDE 12 - Amarillo
        [0.0, 1.0, 0.0, 1.0],	// SIDE 
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the dodecahedron's face.
    var vertexColors = [];
    // for (var i in faceColors) 
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }
    for (const color of faceColors) 
    {
        for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var dodecahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, dodecahedronIndexBuffer);
    var dodecahedronIndices = [
       0,1,3, 0,3,4, 0,2,4,
       5,6,8, 5,8,9, 5,7,9,
       10,11,13, 10,13,14, 10,12,14,
       15,16,18, 15,18,19, 15,17,19,
       20,21,23, 20,23,24, 20,22,24,
       25,26,28, 25,28,29, 25,27,29,
       30,31,33, 30,33,34, 30,32,34,
       35,36,38, 35,38,39, 35,37,39,
       40,41,43, 40,43,44, 40,42,44,
       45,46,48, 45,48,49, 45,47,49,
       50,51,53, 50,53,54, 50,52,54,
       55,56,58, 55,58,59, 55,57,59
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(dodecahedronIndices), gl.STATIC_DRAW);
    
    var dodecahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:dodecahedronIndexBuffer,
            vertSize:3, nVerts:verts.length, colorSize:4, nColors: verts.length, nIndices:dodecahedronIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(dodecahedron.modelViewMatrix, dodecahedron.modelViewMatrix, translation);

    dodecahedron.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
    };
    
    return dodecahedron;
}

// Create the vertex, color and index data for a multi-colored octahedron
function createOctahedron(gl, translation, rotationAxis)
{    
    // Vertex Data
    var vertexBuffer;
    vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    isUp = true;
    coordY = 0;

    var verts = [
    	// LEFT SIDE //
    	// SIDE 1
    	0.0, 0.0, 0.9,
    	0.0, 0.9, 0.0,
    	0.9, 0.0, 0.0,
    	// SIDE 2
    	0.0, 0.0, 0.9,
    	0.0, 0.9, 0.0,
    	-0.9, 0.0, 0.0,
    	//SIDE 3
    	0.0, 0.0, 0.9,
    	0.0, -0.9, 0.0,
    	0.9, 0.0, 0.0,
    	// SIDE 4
    	0.0, 0.0, 0.9,
    	0.0, -0.9, 0.0,
    	-0.9, 0.0, 0.0,

    	// RIGHT SIDE //
    	// SIDE 1
    	0.0, 0.0, -0.9,
    	0.0, 0.9, 0.0,
    	-0.9, 0.0, 0.0,
    	// SIDE 2
    	0.0, 0.0, -0.9,
    	0.0, 0.9, 0.0,
    	0.9, 0.0, 0.0,
    	// SIDE 3
    	0.0, 0.0, -0.9,
    	0.0, -0.9, 0.0,
    	-0.9, 0.0, 0.0,
    	// SIDE 4
    	0.0, 0.0, -0.9,
    	0.0, -0.9, 0.0,
    	0.9, 0.0, 0.0,

       ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    // Color data
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    var faceColors = [
        [1.0, 0.0, 0.0, 1.0],	// SIDE L1
        [0.0, 1.0, 0.0, 1.0],	// SIDE L2
        [1.0, 1.0, 0.0, 1.0],	// SIDE L3
        [0.0, 0.0, 1.0, 1.0],	// SIDE L4
        [1.0, 0.0, 1.0, 1.0],	// SIDE R1
        [0.0, 1.0, 1.0, 1.0],	// SIDE R2
        [0.0, 1.0, 0.0, 1.0],	// SIDE R3
        [0.0, 0.0, 1.0, 1.0]	// SIDE R4
    ];

    // Each vertex must have the color information, that is why the same color is concatenated 4 times, one for each vertex of the octahedron's face.
    var vertexColors = [];
    // for (var i in faceColors) 
    // {
    //     var color = faceColors[i];
    //     for (var j=0; j < 4; j++)
    //         vertexColors = vertexColors.concat(color);
    // }
    for (const color of faceColors) 
    {
        for (var j=0; j < 4; j++)
            vertexColors = vertexColors.concat(color);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

    // Index data (defines the triangles to be drawn).
    var octahedronIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, octahedronIndexBuffer);
    var octahedronIndices = [
        0, 1, 2,	// SIDE 1
        3, 4, 5,	// SIDE 2
        6, 7, 8,	// SIDE 3
        9, 10, 11,	// SIDE 4
        12, 13, 14,	// SIDE 5
        15, 16, 17,	// SIDE 6
        18, 19, 20,	// SIDE 7
        21, 22, 23	// SIDE 8
    ];

    // gl.ELEMENT_ARRAY_BUFFER: Buffer used for element indices.
    // Uint16Array: Array of 16-bit unsigned integers.
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(octahedronIndices), gl.STATIC_DRAW);
    
    var octahedron = {
            buffer:vertexBuffer, colorBuffer:colorBuffer, indices:octahedronIndexBuffer,
            vertSize:3, nVerts:verts.length, colorSize:4, nColors: verts.length, nIndices:octahedronIndices.length,
            primtype:gl.TRIANGLES, modelViewMatrix: mat4.create(), currentTime : Date.now()};

    mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, translation);

    octahedron.update = function()
    {
        var now = Date.now();
        var deltat = now - this.currentTime;
        this.currentTime = now;
        var fract = deltat / duration;
        var angle = Math.PI * 2 * fract;
    
        // Rotates a mat4 by the given angle
        // mat4 out the receiving matrix
        // mat4 a the matrix to rotate
        // Number rad the angle to rotate the matrix by
        // vec3 axis the axis to rotate around
        mat4.rotate(this.modelViewMatrix, this.modelViewMatrix, angle, rotationAxis);
        // take current position of the object
        coordY = octahedron.modelViewMatrix[13];
        // If flag is true, the object will translate to up
        if (isUp){
        	mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0.0,0.03,0.0]); // Translate to 0.03
        	// If the coordinate y is more than the positive canvas height, the state of the flag will change to false
        	if (coordY > 4){
        		isUp = false;
        	}
        }
        // If flag is false, the object will translate to down
        if (!isUp){
        	mat4.translate(octahedron.modelViewMatrix, octahedron.modelViewMatrix, [0.0,-0.03,0.0]); // Translate to -0.03
        	// If the coordinate y is more than the negative canvas height, the state of the flag will change to true
        	if (coordY < -4){
        		isUp = true;
        	}
        }

    };
    
    return octahedron;
}

function createShader(gl, str, type)
{
    var shader;
    if (type == "fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (type == "vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

function initShader(gl)
{
    // load and compile the fragment and vertex shader
    var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
    var vertexShader = createShader(gl, vertexShaderSource, "vertex");

    // link them together into a new program
    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    // get pointers to the shader params
    shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
    gl.enableVertexAttribArray(shaderVertexPositionAttribute);

    shaderVertexColorAttribute = gl.getAttribLocation(shaderProgram, "vertexColor");
    gl.enableVertexAttribArray(shaderVertexColorAttribute);
    
    shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
    shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }
}

function draw(gl, objs) 
{
    // clear the background (with black)
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.enable(gl.DEPTH_TEST);
    gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

    // set the shader to use
    gl.useProgram(shaderProgram);

    for(i = 0; i<objs.length; i++)
    {
        obj = objs[i];
        // connect up the shader parameters: vertex position, color and projection/model matrices
        // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);
        
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, obj.modelViewMatrix);

        // Draw the object's primitives using indexed buffer information.
        // void gl.drawElements(mode, count, type, offset);
        // mode: A GLenum specifying the type primitive to render.
        // count: A GLsizei specifying the number of elements to be rendered.
        // type: A GLenum specifying the type of the values in the element array buffer.
        // offset: A GLintptr specifying an offset in the element array buffer.
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
    }
}

function run(gl, objs) 
{
    // The window.requestAnimationFrame() method tells the browser that you wish to perform an animation and requests that the browser call a specified function to update an animation before the next repaint. The method takes a callback as an argument to be invoked before the repaint.
    requestAnimationFrame(function() { run(gl, objs); });
    draw(gl, objs);

    for(i = 0; i<objs.length; i++)
        objs[i].update();
}



