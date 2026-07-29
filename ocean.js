// ===============================
// SURaj Story Ocean Background
// Mobile Optimized WebGL
// Part 1/2
// ===============================

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
    canvas.style.background="#061522";
    throw new Error("WebGL not supported");
}



const vertexShader = `

attribute vec2 position;

void main(){

gl_Position =
vec4(position,0.0,1.0);

}

`;



const fragmentShader = `

precision mediump float;


uniform vec2 resolution;
uniform float time;
uniform float scroll;



float noise(vec2 p){

return fract(
sin(dot(p,vec2(12.9898,78.233)))
*43758.5453
);

}



void main(){


vec2 uv =
gl_FragCoord.xy /
resolution.xy;



float scene = scroll;



// DAY

vec3 daySky =
vec3(
0.25,
0.55,
0.95
);


// STORM

vec3 stormSky =
vec3(
0.12,
0.16,
0.22
);


// NIGHT

vec3 nightSky =
vec3(
0.01,
0.02,
0.08
);



vec3 sky;


if(scene < 0.4){

sky =
mix(
daySky,
stormSky,
scene*2.5
);


}
else{

sky =
mix(
stormSky,
nightSky,
(scene-0.4)*1.7
);

}



// SUN

float sun =
exp(
-distance(
uv,
vec2(0.5,0.35)
)*12.0
);


sky +=
vec3(1.0,0.65,0.25)
*sun
*(1.0-scene);



// WATER

float water =
smoothstep(
0.52,
0.58,
uv.y
);



vec3 sea =
vec3(
0.01,
0.18,
0.28
);



float wave =
sin(
uv.x*25.0+
time
)*0.03;



sea += wave;



vec3 color =
mix(
sea,
sky,
water
);



// RAIN

if(scene>0.35 && scene<0.75){

float rain =
noise(
gl_FragCoord.xy*
0.05+
time
);


color +=
vec3(rain)
*
0.12;

}



// NIGHT STARS

if(scene>0.75){

float stars =
step(
0.995,
noise(
gl_FragCoord.xy*0.2
)
);


color +=
vec3(stars)
*
0.8;

}



gl_FragColor =
vec4(
color,
1.0
);


}

`;
// ===============================
// Part 2/2
// Renderer + Animation + Scroll
// ===============================


function createShader(type, source){

    const shader =
    gl.createShader(type);

    gl.shaderSource(
        shader,
        source
    );

    gl.compileShader(shader);


    if(!gl.getShaderParameter(
        shader,
        gl.COMPILE_STATUS
    )){

        console.error(
            gl.getShaderInfoLog(shader)
        );

    }


    return shader;

}



const vs =
createShader(
    gl.VERTEX_SHADER,
    vertexShader
);



const fs =
createShader(
    gl.FRAGMENT_SHADER,
    fragmentShader
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




// Full screen quad

const vertices =
new Float32Array([

-1,-1,
 1,-1,
-1, 1,
 1, 1

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



gl.enableVertexAttribArray(
    position
);



gl.vertexAttribPointer(
    position,
    2,
    gl.FLOAT,
    false,
    0,
    0
);





const resolution =
gl.getUniformLocation(
    program,
    "resolution"
);



const timeLocation =
gl.getUniformLocation(
    program,
    "time"
);



const scrollLocation =
gl.getUniformLocation(
    program,
    "scroll"
);





// ===============================
// Resize
// ===============================


function resize(){


    const dpr =
    Math.min(
        window.devicePixelRatio || 1,
        1.2
    );



    canvas.width =
    window.innerWidth * dpr;


    canvas.height =
    window.innerHeight * dpr;



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





// ===============================
// Scroll Scene Control
// ===============================


let scrollProgress = 0;



function updateScroll(){


    const max =
    document.documentElement.scrollHeight -
    window.innerHeight;



    if(max > 0){

        scrollProgress =
        window.scrollY / max;

    }


}



window.addEventListener(
"scroll",
updateScroll,
{
 passive:true
}
);





// ===============================
// Animation
// ===============================


let startTime =
performance.now();



function animate(){


    let now =
    performance.now();



    let seconds =
    (now-startTime)/1000;



    gl.uniform1f(
        timeLocation,
        seconds
    );



    gl.uniform1f(
        scrollLocation,
        scrollProgress
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




// ===============================
// Mobile Memory Saving
// ===============================


document.addEventListener(
"visibilitychange",
()=>{

    if(document.hidden){

        gl.clear(
            gl.COLOR_BUFFER_BIT
        );

    }

});
