const canvas = document.getElementById("webgl_canvas");
const ctx = canvas.getContext("2d");

let w,h,t=0;
let scroll=0;


function resize(){

    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;

}

resize();

window.addEventListener("resize",resize);



window.addEventListener("scroll",()=>{

    let max =
    document.body.scrollHeight-window.innerHeight;

    scroll =
    window.scrollY/max || 0;

});



function cloud(x,y,size){

    ctx.beginPath();

    ctx.arc(x,y,size,0,Math.PI*2);
    ctx.arc(x+size,y,size*1.3,0,Math.PI*2);
    ctx.arc(x+size*2,y,size,0,Math.PI*2);

    ctx.fill();

}



function ocean(){

    t+=0.01;


    // Scene colors

    let sky;


    if(scroll < .33){

        // Dawn
        sky =
        ctx.createLinearGradient(0,0,0,h);

        sky.addColorStop(0,"#16345c");
        sky.addColorStop(1,"#f59d72");

    }
    else if(scroll < .66){

        // Storm

        sky =
        ctx.createLinearGradient(0,0,0,h);

        sky.addColorStop(0,"#202838");
        sky.addColorStop(1,"#54657a");

    }
    else{

        // Night

        sky =
        ctx.createLinearGradient(0,0,0,h);

        sky.addColorStop(0,"#020414");
        sky.addColorStop(1,"#10254a");

    }



    ctx.fillStyle=sky;
    ctx.fillRect(0,0,w,h);



    // Clouds

    ctx.fillStyle="rgba(255,255,255,.08)";

    for(let i=0;i<5;i++){

        cloud(
            (i*250+t*20)%w,
            100+i*60,
            40
        );

    }



    // Stars at night

    if(scroll>.65){

        for(let i=0;i<80;i++){

            ctx.fillStyle="rgba(255,255,255,.7)";

            ctx.fillRect(
                Math.random()*w,
                Math.random()*h*.45,
                1,
                1
            );

        }

    }



    // Ocean

    let waterY=h*.55;


    ctx.fillStyle="#062b43";

    ctx.fillRect(
        0,
        waterY,
        w,
        h
    );



    // Waves

    for(let layer=0;layer<5;layer++){

        ctx.beginPath();


        ctx.moveTo(
            0,
            waterY
        );


        for(
        let x=0;
        x<w;
        x+=20
        ){

            let y =
            waterY+
            Math.sin(
            x*.02+t+layer
            )*15+
            layer*35;


            ctx.lineTo(x,y);

        }


        ctx.lineTo(w,h);
        ctx.lineTo(0,h);

        ctx.closePath();


        ctx.fillStyle=
        `rgba(30,120,170,${0.15-layer*.02})`;

        ctx.fill();

    }



    // Water reflection

    let reflection =
    ctx.createLinearGradient(
        0,
        waterY,
        0,
        h
    );

    reflection.addColorStop(
        0,
        "rgba(255,190,100,.25)"
    );

    reflection.addColorStop(
        1,
        "rgba(0,0,0,0)"
    );


    ctx.fillStyle=reflection;

    ctx.fillRect(
        w*.45,
        waterY,
        120,
        h
    );



    requestAnimationFrame(ocean);

}


ocean();
