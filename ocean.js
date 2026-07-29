const canvas = document.getElementById("webgl_canvas");

const gl =
canvas.getContext("webgl2", {
    alpha:false,
    antialias:false,
    powerPreference:"high-performance"
})
||
canvas.getContext("webgl", {
    alpha:false,
    antialias:false
});


if(!gl){
    canvas.style.background="#071522";
    throw new Error("WebGL not supported");
}


// =====================
// Vertex Shader
// =====================

const vertexShaderSource = `

attribute vec2 position;

void main(){

    gl_Position =
    vec4(position,0.0,1.0);

}

`;


// =====================
// Fragment Shader
// =====================

const fragmentShaderSource = `

precision mediump float;


uniform vec2 resolution;
uniform float time;



float random(vec2 p){

    return fract(
        sin(dot(p,vec2(12.9898,78.233)))
        *
        43758.5453
    );

}



void main(){


    vec2 uv =
    gl_FragCoord.xy /
    resolution.xy;



    // =================
    // SKY
    // =================


    vec3 sky =
    mix(
        vec3(0.08,0.16,0.30),
        vec3(0.01,0.03,0.08),
        uv.y
    );



    // soft light

    float light =
    exp(
        -distance(
            uv,
            vec2(0.5,0.35)
        )*18.0
    );


    sky +=
    vec3(1.0,0.65,0.35)
    *
    light;



    // =================
    // WATER
    // =================


    float wave1 =
    sin(
        uv.x*18.0+
        time
    );


    float wave2 =
    sin(
        uv.x*45.0-
        time*1.5
    );


    float wave3 =
    sin(
        uv.x*80.0+
        time*2.0
    );


    float waves =
    (
        wave1+
        wave2+
        wave3
    )
    *
    0.012;



    float waterMask =
    smoothstep(
        0.45,
        0.58,
        uv.y + waves
    );



    vec3 water =
    vec3(
        0.005,
        0.12,
        0.22
    );



    // reflection

    float shine =
    pow(
        max(
            0.0,
            sin(
                uv.x*120.0+
                time*3.0
            )
        ),
        8.0
    );



    water +=
    vec3(
        0.15,
        0.35,
        0.45
    )
    *
    shine;



    vec3 color =
    mix(
        water,
        sky,
        waterMask
    );



    // =================
    // RAIN
    // =================


    float rainX =
    fract(
        uv.x*70.0
    );


    float rainY =
    fract(
        uv.y*15.0 -
        time*3.0
    );



    float rain =
    step(
        0.92,
        rainX
    )
    *
    smoothstep(
        0.0,
        0.25,
        rainY
    );



    color +=
    vec3(
        0.65,
        0.8,
        1.0
    )
    *
    rain
    *
    0.35;



    // rain fog

    float fog =
    sin(
        time*0.2
    )
    *
    0.02;



    color += fog;



    gl_FragColor =
    vec4(
        color,
        1.0
    );


}

`;



// =====================
// Shader Setup
// =====================

function createShader(type,source){

    let shader =
    gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);

    return shader;
}



const vs =
createShader(
    gl.VERTEX_SHADER,
    vertexShaderSource
);



const fs =
createShader(
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);



const program =
gl.createProgram();


gl.attachShader(
    program,
    vs
);


gl.attachShader(
    program,
    fs
);


gl.linkProgram(program);


gl.useProgram(program);



// =====================
// Full Screen Quad
// =====================


const vertices =
new Float32Array([

-1,-1,
1,-1,
-1,1,
1,1

]);


const buffer =
gl.createBuffer();


gl.bindBuffer(
    gl.ARRAY_BUFFER,
    buffer
);


gl.bufferData(
    gl.ARRAY_BUFFER,
    vertices,
    gl.STATIC_DRAW
);



const position =
gl.getAttribLocation(
    program,
    "position"
);


gl.enableVertexAttribArray(position);


gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);



// =====================
// Uniforms
// =====================


const resolution =
gl.getUniformLocation(
    program,
    "resolution"
);


const timeUniform =
gl.getUniformLocation(
    program,
    "time"
);



// =====================
// Resize
// =====================


function resize(){

    const dpr =
    Math.min(
        window.devicePixelRatio || 1,
        1.2
    );


    canvas.width =
    innerWidth*dpr;


    canvas.height =
    innerHeight*dpr;


    gl.viewport(
        0,
        0,
        canvas.width,
        canvas.height
    );


    gl.uniform2f(
        resolution,
        canvas.width,
        canvas.height
    );

}


resize();


window.addEventListener(
"resize",
resize
);



// =====================
// Animation
// =====================


let start =
performance.now();



function animate(){

    let t =
    (performance.now()-start)/1000;



    gl.uniform1f(
        timeUniform,
        t
    );


    gl.drawArrays(
        gl.TRIANGLE_STRIP,
        0,
        4
    );


    requestAnimationFrame(
        animate
    );

}



animate();
