// ======================================
// Suraj Story Weather Ocean
// Part 1/2
// ======================================

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
    canvas.style.background="#08131f";
    throw new Error("WebGL not supported");
}



// ================================
// Vertex Shader
// ================================

const vertexShaderSource = `

attribute vec2 position;

void main(){

    gl_Position =
    vec4(position,0.0,1.0);

}

`;



// ================================
// Fragment Shader
// Weather Engine
// ================================

const fragmentShaderSource = `

precision mediump float;


uniform vec2 resolution;
uniform float time;
uniform float scroll;



float hash(vec2 p){

    return fract(
        sin(dot(p,vec2(12.9898,78.233)))
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



    // =========================
    // Weather timeline
    // 0 Day
    // 0.33 Midday
    // 0.66 Rain
    // 1 Night
    // =========================


    vec3 day =
    vec3(
        0.25,
        0.55,
        0.95
    );


    vec3 midday =
    vec3(
        0.05,
        0.35,
        0.85
    );


    vec3 storm =
    vec3(
        0.12,
        0.16,
        0.22
    );


    vec3 night =
    vec3(
        0.01,
        0.02,
        0.08
    );



    vec3 sky;



    if(scroll < 0.33){

        sky =
        mix(
            day,
            midday,
            scroll*3.0
        );

    }
    else if(scroll < 0.66){

        sky =
        mix(
            midday,
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



    // Sun

    float sun =
    exp(
        -distance(
            uv,
            vec2(0.5,0.35)
        )*25.0
    );


    sky +=
    vec3(1.0,0.65,0.25)
    *
    sun
    *
    (1.0-scroll);



    // Ocean

    float water =
    smoothstep(
        0.50,
        0.55,
        uv.y
    );


    float wave =
    sin(
        uv.x*35.0+
        time
    )*0.03;



    vec3 sea =
    vec3(
        0.01,
        0.18,
        0.30
    );


    sea += wave;



    vec3 color =
    mix(
        sea,
        sky,
        water
    );



    // Rain in storm

    if(scroll > 0.45 && scroll < 0.75){

        float rain =
        noise(
            gl_FragCoord.xy*0.08+
            time*2.0
        );


        color +=
        vec3(rain)
        *
        0.15;

    }



    // Stars at night

    if(scroll > 0.75){

        float stars =
        step(
            0.997,
            noise(
            gl_FragCoord.xy*0.3
            )
        );


        color +=
        vec3(stars);

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
// WebGL Renderer + Scroll System
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




// Full screen rectangle

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





// ==============================
// Mobile Optimized Resize
// ==============================

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



    canvas.style.width =
    "100%";


    canvas.style.height =
    "100%";



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




// ==============================
// Scroll Weather Control
// ==============================

let scrollValue = 0;



function updateScroll(){


    let maxScroll =
    document.documentElement.scrollHeight -
    window.innerHeight;



    if(maxScroll > 0){

        scrollValue =
        window.scrollY / maxScroll;

    }

}



window.addEventListener(
    "scroll",
    updateScroll,
    {
        passive:true
    }
);




// ==============================
// Animation Loop
// ==============================


let startTime =
performance.now();



function render(){


    let now =
    performance.now();



    let currentTime =
    (now-startTime)/1000;



    gl.uniform1f(
        timeLocation,
        currentTime
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
        render
    );

}



render();




// ==============================
// Mobile Memory Protection
// ==============================


document.addEventListener(
"visibilitychange",
()=>{

    if(document.hidden){

        gl.finish();

    }

});
