const canvas = document.getElementById("webgl_canvas");
const ctx = canvas.getContext("2d");

let width;
let height;
let time = 0;

function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener("resize", resize);
resize();


function drawOcean() {

    time += 0.02;

    ctx.clearRect(0, 0, width, height);


    // Sky background
    let sky = ctx.createLinearGradient(0, 0, 0, height);
    sky.addColorStop(0, "#071526");
    sky.addColorStop(0.5, "#092d46");
    sky.addColorStop(1, "#02080f");

    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, width, height);



    // Water waves
    for (let layer = 0; layer < 8; layer++) {

        ctx.beginPath();

        let base = height * 0.55 + layer * 40;

        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 10) {

            let wave =
                Math.sin(
                    x * 0.015 +
                    time * (1 + layer * 0.15)
                ) * 20;

            let y = base + wave;

            ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();


        ctx.fillStyle =
            `rgba(20,120,170,${0.08 + layer * 0.02})`;

        ctx.fill();
    }



    // Reflection light

    for(let i=0;i<20;i++){

        let x = (width/2) + 
            Math.sin(time+i)*120;

        let y = height*0.55 + i*8;


        ctx.beginPath();

        ctx.arc(
            x,
            y,
            2,
            0,
            Math.PI*2
        );

        ctx.fillStyle="rgba(255,220,150,0.3)";
        ctx.fill();
    }


    requestAnimationFrame(drawOcean);
}


drawOcean();
