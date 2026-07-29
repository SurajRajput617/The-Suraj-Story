// Lightweight Mobile Friendly Ocean Background

const canvas = document.getElementById("webgl_canvas");

const ctx = canvas.getContext("2d", {
    alpha: false,
    desynchronized: true
});


let width = 0;
let height = 0;
let time = 0;


function resizeCanvas(){

    const dpr = Math.min(window.devicePixelRatio || 1, 1.2);

    width = window.innerWidth;
    height = window.innerHeight;


    canvas.width = width * dpr;
    canvas.height = height * dpr;


    canvas.style.width = width + "px";
    canvas.style.height = height + "px";


    ctx.setTransform(dpr,0,0,dpr,0,0);
}


resizeCanvas();

window.addEventListener(
    "resize",
    resizeCanvas,
    {passive:true}
);



// Draw water

function drawOcean(){


    time += 0.015;


    // sky + ocean background

    let gradient = ctx.createLinearGradient(
        0,
        0,
        0,
        height
    );


    gradient.addColorStop(
        0,
        "#071827"
    );

    gradient.addColorStop(
        0.55,
        "#092f4a"
    );

    gradient.addColorStop(
        1,
        "#020b14"
    );


    ctx.fillStyle = gradient;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );



    // 3 water layers only for mobile performance

    for(let layer = 0; layer < 3; layer++){


        ctx.beginPath();


        let base =
        height * 0.55 +
        layer * 45;


        ctx.moveTo(
            0,
            height
        );


        for(
            let x = 0;
            x <= width;
            x += 25
        ){


            let wave =
            Math.sin(
                x * 0.018 +
                time +
                layer
            ) * 18;


            let y =
            base + wave;


            ctx.lineTo(
                x,
                y
            );
        }



        ctx.lineTo(
            width,
            height
        );


        ctx.closePath();



        ctx.fillStyle =
        `rgba(20,120,180,${0.18-layer*0.03})`;


        ctx.fill();

    }




    requestAnimationFrame(drawOcean);

}


drawOcean();



// Stop animation when tab hidden
// saves mobile memory

document.addEventListener(
"visibilitychange",
()=>{

    if(document.hidden){
        cancelAnimationFrame(drawOcean);
    }

});
