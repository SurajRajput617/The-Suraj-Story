const canvas = document.getElementById("webgl_canvas");

const gl =
canvas.getContext("webgl2", {
    alpha:true,
    antialias:false
})
||
canvas.getContext("webgl", {
    alpha:true,
    antialias:false
});


if(!gl){
    throw "WebGL not supported";
}


// Vertex

const vertexShaderSource = `

attribute vec2 position;

void main(){

    gl_Position =
    vec4(position,0.0,1.0);

}

`;



// Fragment

const fragmentShaderSource = `

precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float scroll;



float random(vec2 p){

return fract(
sin(dot(p,vec2(12.9898,78.233)))
*43758.5453
);

}



void main(){


vec2 uv =
gl_FragCoord.xy /
resolution.xy;



// Transparent base

vec4 result =
vec4(0.0);



// Day Night overlay


vec3 day =
vec3(
0.2,
0.5,
0.9
);


vec3 sunset =
vec3(
0.9,
0.4,
0.2
);


vec3 night =
vec3(
0.01,
0.02,
0.08
);



vec3 sky;



if(scroll < 0.5){

sky =
mix(
day,
sunset,
scroll*2.0
);

}
else{

sky =
mix(
sunset,
night,
(scroll-0.5)*2.0
);

}



// soft light

float glow =
exp(
-distance(
uv,
vec2(.5,.35)
)*20.0
);


sky +=
vec3(1.0,.6,.25)
*
glow
*
(1.0-scroll);




// stars

float stars = 0.0;


if(scroll > .65){

stars =
step(
0.995,
random(
floor(uv*250.0)
)
);

}



sky +=
stars;



// overlay opacity

float alpha =
0.35;



result =
vec4(
sky,
alpha
);



gl_FragColor =
result;


}

`;




// Shader create

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



const program =
gl.createProgram();


gl.attachShader(
program,
createShader(
gl.VERTEX_SHADER,
vertexShaderSource
)
);


gl.attachShader(
program,
createShader(
gl.FRAGMENT_SHADER,
fragmentShaderSource
)
);


gl.linkProgram(program);

gl.useProgram(program);




// Full screen

const buffer =
gl.createBuffer();


gl.bindBuffer(
gl.ARRAY_BUFFER,
buffer
);


gl.bufferData(
gl.ARRAY_BUFFER,
new Float32Array([

-1,-1,
1,-1,
-1,1,
1,1

]),
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




// Uniforms

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




// Resize

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




// Scroll

let scrollValue = 0;


window.addEventListener(
"scroll",
()=>{

let max =
document.body.scrollHeight -
innerHeight;


scrollValue =
max > 0 ?
scrollY/max :
0;

});




// Animation

let start =
performance.now();


function animate(){

let t =
(performance.now()-start)/1000;


gl.uniform1f(
timeLocation,
t
);


gl.uniform1f(
scrollLocation,
scrollValue
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
