// ======================================
// Suraj Story Cinematic Ocean
// Part 1/2
// ======================================


const canvas =
document.getElementById("webgl_canvas");


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
    canvas.style.background="#020812";
    throw "WebGL not supported";
}



// ==========================
// Vertex Shader
// ==========================


const vertexShaderSource = `

attribute vec2 position;

void main(){

    gl_Position =
    vec4(position,0.0,1.0);

}

`;



// ==========================
// Fragment Shader
// Weather + Ocean
// ==========================


const fragmentShaderSource = `

precision mediump float;


uniform vec2 resolution;
uniform float time;
uniform float scroll;



float hash(vec2 p){

    return fract(
        sin(
            dot(
                p,
                vec2(127.1,311.7)
            )
        )
        *
        43758.5453
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



// =======================
// WEATHER COLORS
// =======================


vec3 morning =
vec3(
0.35,
0.55,
0.90
);


vec3 sunset =
vec3(
0.85,
0.45,
0.25
);


vec3 storm =
vec3(
0.12,
0.15,
0.22
);


vec3 night =
vec3(
0.005,
0.015,
0.06
);



vec3 sky;



if(scroll < 0.33){

    sky =
    mix(
        morning,
        sunset,
        scroll*3.0
    );

}
else if(scroll < 0.66){

    sky =
    mix(
        sunset,
        storm,
        (scroll-0.33)*3.0
    );

}
else{

    sky =
    mix(
        storm,
        night,
        (scroll-0.66)*3.0
    );

}



// =======================
// SUN / MOON LIGHT
// =======================


float sun =
exp(
-destination(
uv,
vec2(0.5,0.35)
)*20.0
);


sky +=
vec3(1.0,0.65,0.3)
*
sun
*
(1.0-scroll);



// =======================
// OCEAN WAVES
// =======================


float wave =

sin(
uv.x*25.0+
time*1.5
)

+

sin(
uv.x*55.0-
time
)

+

sin(
uv.x*90.0+
time*2.0
);


wave*=0.012;



float seaMask =
smoothstep(
0.40,
0.62,
uv.y+wave
);



vec3 ocean =
vec3(
0.005,
0.12,
0.25
);



// reflection

float shine =
pow(
max(
0.0,
sin(
uv.x*100.0+
time*3.0
)
),
8.0
);



ocean +=
vec3(
0.15,
0.35,
0.5
)
*
shine;



vec3 color =
mix(
ocean,
sky,
seaMask
);



// =======================
// RAIN
// =======================


if(scroll>0.40 && scroll<0.75){


float rain =
noise(
vec2(
floor(uv.x*180.0),
floor(uv.y*120.0-time*8.0)
)
);


rain =
step(
0.96,
rain
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
0.45;


}



// =======================
// STARS
// =======================


if(scroll>0.75){


float star =
step(
0.995,
noise(
uv*300.0
)
);



color +=
vec3(1.0)
*
star;


}



gl_FragColor =
vec4(
color,
1.0
);


}

`;
// ======================================
// Part 2/2
// Renderer + Scroll + Animation
// ======================================



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





// =======================
// Full Screen Quad
// =======================


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





// =======================
// Uniforms
// =======================


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






// =======================
// Resize Mobile
// =======================


function resize(){


const dpr =
Math.min(
window.devicePixelRatio || 1,
1.2
);



canvas.width =
window.innerWidth*dpr;



canvas.height =
window.innerHeight*dpr;



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







// =======================
// Scroll Weather
// =======================


let scrollValue = 0;



function updateScroll(){


const max =
document.documentElement.scrollHeight -
window.innerHeight;



if(max > 0){

scrollValue =
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







// =======================
// Animation
// =======================


let start =
performance.now();




function animate(){


let now =
performance.now();



let seconds =
(now-start)/1000;



gl.uniform1f(
timeLocation,
seconds
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
