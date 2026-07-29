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
    canvas.style.background="#020617";
    throw "WebGL not supported";
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
// Sky Weather
// =====================

const fragmentShaderSource = `

precision mediump float;


uniform vec2 resolution;
uniform float time;
uniform float scroll;



float random(vec2 p){

    return fract(
        sin(
            dot(
                p,
                vec2(12.9898,78.233)
            )
        )
        *43758.5453
    );

}



void main(){


    vec2 uv =
    gl_FragCoord.xy /
    resolution.xy;



    // =====================
    // COLORS
    // =====================


    vec3 morning =
    vec3(
        0.25,
        0.55,
        0.95
    );


    vec3 sunset =
    vec3(
        0.95,
        0.45,
        0.20
    );


    vec3 night =
    vec3(
        0.005,
        0.01,
        0.05
    );



    vec3 sky;



    // Scroll transition

    if(scroll < 0.5){


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
            (scroll-0.5)*2.0
        );


    }




    // =====================
    // SUN / GLOW
    // =====================


    float sun =
    exp(
        -distance(
            uv,
            vec2(
                0.5,
                0.35
            )
        )*22.0
    );



    sky +=
    vec3(
        1.0,
        0.65,
        0.25
    )
    *
    sun
    *
    (1.0-scroll);





    // =====================
    // MOVING CLOUDS
    // =====================


    float clouds =
    sin(
        uv.x*7.0+
        time*0.08
    )
    *
    0.03;



    sky += clouds;




    // =====================
    // NIGHT STARS
    // =====================


    if(scroll > 0.65){


        float stars =
        step(
            0.985,
            random(
                floor(
                    uv*300.0
                )
            )
        );



        sky +=
        vec3(
            stars
        );


    }




    gl_FragColor =
    vec4(
        sky,
        1.0
    );

}

`;




// =====================
// Shader Create
// =====================

function createShader(type,source){

    let shader =
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

        console.log(
            gl.getShaderInfoLog(shader)
        );

    }


    return shader;

}





let program =
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




// =====================
// Full Screen Quad
// =====================


let buffer =
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




let position =
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




// =====================
// Uniforms
// =====================


let resolution =
gl.getUniformLocation(
program,
"resolution"
);



let timeLocation =
gl.getUniformLocation(
program,
"time"
);



let scrollLocation =
gl.getUniformLocation(
program,
"scroll"
);




// =====================
// Resize
// =====================


function resize(){


    let dpr =
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
// Scroll
// =====================


let scrollValue=0;


window.addEventListener(
"scroll",
()=>{


let max =
document.body.scrollHeight -
innerHeight;



scrollValue =
max>0 ?
scrollY/max :
0;


});




// =====================
// Animation
// =====================


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
