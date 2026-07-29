const canvas = document.getElementById("webgl_canvas");

const gl =
canvas.getContext("webgl2", {
    alpha:false,
    antialias:false
})
||
canvas.getContext("webgl", {
    alpha:false,
    antialias:false
});


if(!gl){
    canvas.style.background="#071522";
    throw "WebGL not supported";
}



const vertex = `
attribute vec2 position;

void main(){
    gl_Position = vec4(position,0.0,1.0);
}
`;



const fragment = `

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
    gl_FragCoord.xy / resolution.xy;



    // WEATHER COLORS

    vec3 dawn =
    vec3(0.65,0.45,0.38);

    vec3 day =
    vec3(0.20,0.55,0.95);

    vec3 storm =
    vec3(0.15,0.18,0.25);

    vec3 night =
    vec3(0.01,0.02,0.08);



    vec3 sky;


    if(scroll < .33){

        sky=mix(
            dawn,
            day,
            scroll*3.0
        );

    }
    else if(scroll < .66){

        sky=mix(
            day,
            storm,
            (scroll-.33)*3.0
        );

    }
    else{

        sky=mix(
            storm,
            night,
            (scroll-.66)*3.0
        );

    }



    // SUN

    float sun =
    exp(
        -distance(
            uv,
            vec2(.5,.35)
        )*25.0
    );


    sky +=
    vec3(1.0,.7,.3)
    *
    sun
    *
    (1.0-scroll);



    // OCEAN

    float wave =
    (
        sin(
            uv.x*25.0+time
        )
        +
        sin(
            uv.x*12.0-time*.5
        )
    )
    *.015;



    float horizon =
    smoothstep(
        .40,
        .65,
        uv.y+wave
    );



    vec3 water =
    vec3(
        .01,
        .16,
        .28
    );



    // WATER LIGHT

    float reflection =
    sin(
        uv.x*40.0+
        time*2.0
    )*.03;


    water += reflection;



    vec3 color =
    mix(
        water,
        sky,
        horizon
    );



    // RAIN

    if(scroll>.40 && scroll<.75){

        float rain =
        noise(
            gl_FragCoord.xy*.08+
            time
        );


        color +=
        vec3(rain)*.12;

    }



    // STARS

    if(scroll>.75){

        float star =
        step(
            .997,
            noise(
                gl_FragCoord.xy*.3
            )
        );


        color +=
        vec3(star);

    }



    gl_FragColor =
    vec4(color,1.0);

}

`;



function shader(type,source){

    let s=gl.createShader(type);

    gl.shaderSource(s,source);

    gl.compileShader(s);

    return s;
}



let program=gl.createProgram();


gl.attachShader(
program,
shader(
gl.VERTEX_SHADER,
vertex
)
);


gl.attachShader(
program,
shader(
gl.FRAGMENT_SHADER,
fragment
)
);


gl.linkProgram(program);

gl.useProgram(program);



let buffer=gl.createBuffer();

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



let position=
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



let res=
gl.getUniformLocation(
program,
"resolution"
);


let tm=
gl.getUniformLocation(
program,
"time"
);


let scr=
gl.getUniformLocation(
program,
"scroll"
);




function resize(){

let dpr=Math.min(
window.devicePixelRatio||1,
1.2
);


canvas.width=
innerWidth*dpr;


canvas.height=
innerHeight*dpr;


gl.viewport(
0,
0,
canvas.width,
canvas.height
);


gl.uniform2f(
res,
canvas.width,
canvas.height
);

}


resize();

window.addEventListener(
"resize",
resize
);



let scroll=0;


window.addEventListener(
"scroll",
()=>{

let max=
document.body.scrollHeight-innerHeight;

scroll=
max>0?
scrollY/max:
0;

});



let start=performance.now();


function animate(){

let t=
(performance.now()-start)/1000;


gl.uniform1f(
tm,
t
);


gl.uniform1f(
scr,
scroll
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




==============================
