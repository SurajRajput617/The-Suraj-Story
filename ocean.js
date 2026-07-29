const canvas = document.getElementById("webgl_canvas");

const gl =
canvas.getContext("webgl2", {
    alpha:true,
    antialias:false,
    powerPreference:"low-power"
})
||
canvas.getContext("webgl", {
    alpha:true,
    antialias:false
});


if(!gl){
    console.log("WebGL not supported");
    return;
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
// Cinematic Weather Shader
// =====================

const fragmentShaderSource = `

precision mediump float;


uniform vec2 resolution;
uniform float time;
uniform float scroll;



float hash(vec2 p){

return fract(
sin(dot(p,vec2(127.1,311.7)))
*43758.5453
);

}



float noise(vec2 p){

vec2 i=floor(p);
vec2 f=fract(p);

f=f*f*(3.0-2.0*f);


float a=hash(i);
float b=hash(i+vec2(1.0,0.0));
float c=hash(i+vec2(0.0,1.0));
float d=hash(i+vec2(1.0,1.0));


return mix(
mix(a,b,f.x),
mix(c,d,f.x),
f.y
);

}



void main(){


vec2 uv =
gl_FragCoord.xy /
resolution.xy;



// =================
// SKY TIME
// =================


vec3 morning =
vec3(
0.25,
0.55,
0.95
);


vec3 sunset =
vec3(
1.0,
0.45,
0.18
);


vec3 night =
vec3(
0.01,
0.02,
0.09
);



vec3 sky;


if(scroll < .5){

sky =
mix(
morning,
sunset,
scroll*2.0
);

}
else{

sky =
mix(
sunset,
night,
(scroll-.5)*2.0
);

}




// =================
// SUN / MOON GLOW
// =================


float sun =
exp(
-distance(
uv,
vec2(.5,.35)
)*18.0
);


sky +=
vec3(1.0,.65,.3)
*
sun
*
(1.0-scroll);



float moon =
exp(
-distance(
uv,
vec2(.75,.25)
)*80.0
);


sky +=
vec3(.8,.85,1.0)
*
moon
*
scroll;





// =================
// MOVING CLOUDS
// =================


float cloud =
noise(
uv*3.0+
vec2(time*.03,0.0)
);



sky =
mix(
sky,
vec3(.7,.75,.8),
cloud*.18
);





// =================
// NIGHT STARS
// =================


if(scroll>.65){

float star =
step(
.985,
noise(
uv*250.0+
time*.2
)
);


sky +=
vec3(star)
*
1.2;

}





// =================
// FOG
// =================


float fog =
sin(
uv.y*8.0+
time*.05
)
*.03;


sky += fog;



// Transparent overlay

gl_FragColor =
vec4(
sky,
0.35
);


}

`;
// ===============================
// Part 2/2
// Renderer + Animation
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





const vertexShader =
createShader(
    gl.VERTEX_SHADER,
    vertexShaderSource
);



const fragmentShader =
createShader(
    gl.FRAGMENT_SHADER,
    fragmentShaderSource
);




const program =
gl.createProgram();



gl.attachShader(
    program,
    vertexShader
);



gl.attachShader(
    program,
    fragmentShader
);



gl.linkProgram(program);


gl.useProgram(program);





// ===============================
// Full Screen Quad
// ===============================


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





// ===============================
// Uniforms
// ===============================


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
    innerWidth * dpr;



    canvas.height =
    innerHeight * dpr;



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
// Smooth Scroll
// ===============================


let targetScroll = 0;
let smoothScroll = 0;



window.addEventListener(
"scroll",
()=>{


let max =
document.documentElement.scrollHeight -
window.innerHeight;



targetScroll =
max > 0 ?
window.scrollY / max :
0;


});






// ===============================
// Animation
// ===============================


let start =
performance.now();



function animate(){


let now =
performance.now();



let time =
(now-start)/1000;



// smooth weather change

smoothScroll +=
(
targetScroll -
smoothScroll
)
*
0.03;



gl.uniform1f(
timeLocation,
time
);



gl.uniform1f(
scrollLocation,
smoothScroll
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
