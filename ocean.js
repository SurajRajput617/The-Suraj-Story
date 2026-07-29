const canvas = document.getElementById("webgl_canvas");

const gl =
    canvas.getContext("webgl2", {
        alpha:false,
        antialias:false,
        powerPreference:"high-performance"
    }) ||
    canvas.getContext("webgl", {
        alpha:false,
        antialias:false,
        powerPreference:"high-performance"
    });


if(!gl){
    canvas.style.background="#061522";
    throw new Error("WebGL not supported");
}


const vertexShaderSource = `
attribute vec2 position;

void main(){
    gl_Position = vec4(position,0.0,1.0);
}
`;


const fragmentShaderSource = `

precision mediump float;

uniform vec2 resolution;
uniform float time;


float wave(vec2 p){

    float w = 0.0;

    w += sin(p.x*0.03 + time)*0.12;
    w += sin(p.y*0.05 - time*0.8)*0.08;
    w += sin((p.x+p.y)*0.02)*0.05;

    return w;
}


void main(){

    vec2 uv =
    gl_FragCoord.xy / resolution.xy;


    vec3 sky =
    mix(
        vec3(0.03,0.10,0.20),
        vec3(0.01,0.02,0.05),
        uv.y
    );


    float water =
    smoothstep(
        0.55,
        0.56,
        uv.y + wave(gl_FragCoord.xy)
    );


    vec3 sea =
    vec3(
        0.02,
        0.18,
        0.30
    );


    vec3 color =
    mix(
        sea,
        sky,
        water
    );


    gl_FragColor =
    vec4(color,1.0);

}

`;
const fragmentShaderSource = `

precision mediump float;

uniform vec2 resolution;
uniform float time;


float hash(vec2 p)
{
    return fract(
        sin(dot(p, vec2(127.1,311.7))) *
        43758.5453123
    );
}


float noise(vec2 p)
{
    vec2 i=floor(p);
    vec2 f=fract(p);

    f=f*f*(3.0-2.0*f);

    float a=hash(i);
    float b=hash(i+vec2(1,0));
    float c=hash(i+vec2(0,1));
    float d=hash(i+vec2(1,1));

    return mix(
        mix(a,b,f.x),
        mix(c,d,f.x),
        f.y
    );
}


float sea(vec2 p)
{
    float h=0.0;

    h += sin(
        p.x*0.035 +
        time*0.8
    )*0.25;


    h += sin(
        p.y*0.04 -
        time*0.5
    )*0.18;


    h += noise(
        p*0.08+
        time*0.05
    )*0.25;


    return h;
}



void main()
{

    vec2 uv =
    gl_FragCoord.xy /
    resolution.xy;


    vec2 p =
    gl_FragCoord.xy;


    // sky gradient

    vec3 sky =
    mix(
        vec3(0.06,0.15,0.30),
        vec3(0.01,0.03,0.08),
        uv.y
    );


    // horizon glow

    float sun =
    exp(
        -pow(
            distance(
                uv,
                vec2(0.5,0.35)
            ),
            2.0
        )*30.0
    );


    sky +=
    vec3(1.0,0.55,0.25)
    * sun;



    // ocean

    float waterLine =
    0.55;


    float wave =
    sea(p);


    float oceanMask =
    smoothstep(
        waterLine-0.02,
        waterLine+0.02,
        uv.y+wave*0.03
    );



    vec3 ocean =
    vec3(
        0.01,
        0.12,
        0.22
    );


    // reflection

    float reflection =
    sin(
        p.x*0.04+
        time
    )*0.5+0.5;


    ocean +=
    vec3(
        0.2,
        0.45,
        0.55
    )
    *
    reflection
    *
    0.15;



    vec3 color =
    mix(
        ocean,
        sky,
        oceanMask
    );



    gl_FragColor =
    vec4(
        color,
        1.0
    );

}

`;
// ===============================
// WEBGL PROGRAM SETUP
// ===============================

function createShader(type, source){

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);


    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
        console.error(
            gl.getShaderInfoLog(shader)
        );
        return null;
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
// FULL SCREEN QUAD
// ===============================

const vertices = new Float32Array([
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


const timeUniform =
gl.getUniformLocation(
    program,
    "time"
);



// ===============================
// MOBILE OPTIMIZED RESIZE
// ===============================

const MAX_PIXEL_RATIO = 1.2;


function resize(){

    const ratio =
    Math.min(
        window.devicePixelRatio || 1,
        MAX_PIXEL_RATIO
    );


    canvas.width =
    window.innerWidth * ratio;


    canvas.height =
    window.innerHeight * ratio;


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



// ===============================
// ANIMATION LOOP
// ===============================

let start =
performance.now();


function render(){

    let now =
    performance.now();


    let elapsed =
    (now-start)/1000;


    gl.uniform1f(
        timeUniform,
        elapsed
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



// ===============================
// MOBILE MEMORY CONTROL
// ===============================

document.addEventListener(
"visibilitychange",
()=>{

    if(document.hidden){

        gl.finish();

    }

});
