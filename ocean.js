const canvas = document.getElementById("webgl_canvas");

const gl =
    canvas.getContext("webgl2") ||
    canvas.getContext("webgl");


if (!gl) {
    canvas.style.background = "#061522";
    throw new Error("WebGL not supported");
}


// Vertex Shader

const vertexShaderSource = `
attribute vec2 position;

void main(){
    gl_Position = vec4(position,0.0,1.0);
}
`;


// Fragment Shader

const fragmentShaderSource = `
precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float scroll;


void main(){

    vec2 uv = gl_FragCoord.xy / resolution.xy;


    // Day -> Night color

    vec3 day =
    vec3(0.15,0.45,0.85);

    vec3 night =
    vec3(0.01,0.02,0.08);


    vec3 sky =
    mix(day, night, scroll);



    // Sun

    float sun =
    exp(
        -distance(
            uv,
            vec2(0.5,0.35)
        )*25.0
    );


    sky += vec3(1.0,0.6,0.2)*sun;



    // Water

    float water =
    smoothstep(
        0.55,
        0.56,
        uv.y
    );


    vec3 ocean =
    vec3(
        0.0,
        0.15,
        0.25
    );


    float wave =
    sin(
        uv.x*30.0 + time
    )*0.02;


    ocean += wave;



    vec3 color =
    mix(
        ocean,
        sky,
        water
    );



    // Rain effect

    if(scroll > 0.35 && scroll < 0.65){

        float rain =
        fract(
            sin(
            uv.x*500.0+
            time*5.0
            )
        );

        color += rain*0.05;

    }



    gl_FragColor =
    vec4(color,1.0);

}
`;



function createShader(type, source){

    let shader =
    gl.createShader(type);

    gl.shaderSource(shader,source);
    gl.compileShader(shader);


    if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS)){
        console.log(gl.getShaderInfoLog(shader));
    }


    return shader;
}



let vertexShader =
createShader(
gl.VERTEX_SHADER,
vertexShaderSource
);


let fragmentShader =
createShader(
gl.FRAGMENT_SHADER,
fragmentShaderSource
);



let program =
gl.createProgram();


gl.attachShader(program,vertexShader);
gl.attachShader(program,fragmentShader);
gl.linkProgram(program);
gl.useProgram(program);



let vertices =
new Float32Array([
-1,-1,
1,-1,
-1,1,
1,1
]);



let buffer =
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



let position =
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



let resolution =
gl.getUniformLocation(
program,
"resolution"
);


let time =
gl.getUniformLocation(
program,
"time"
);


let scroll =
gl.getUniformLocation(
program,
"scroll"
);



function resize(){

    canvas.width =
    window.innerWidth;

    canvas.height =
    window.innerHeight;


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



let start =
performance.now();


let scrollValue = 0;


window.addEventListener(
"scroll",
()=>{

let max =
document.body.scrollHeight -
window.innerHeight;


scrollValue =
window.scrollY / max || 0;

});



function render(){

let now =
performance.now();


gl.uniform1f(
time,
(now-start)/1000
);


gl.uniform1f(
scroll,
scrollValue
);


gl.drawArrays(
gl.TRIANGLE_STRIP,
0,
4
);


requestAnimationFrame(render);

}


render();
