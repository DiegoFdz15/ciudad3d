const inf = document.getElementById("sidebar_informacion");
const capas = document.getElementById("sidebar_capas");
const norm = document.getElementById("sidebar_normativas");

const btninf = document.getElementById('btn_inf');
const btn_layers = document.getElementById('btn_layers');
const btn_rules = document.getElementById('btn_rules');

btninf.addEventListener('click', (e) => {
    if (inf.style.visibility === "visible"){
        inf.style.visibility = "hidden";
    }else{
        disable_all();
        inf.style.visibility = "visible";   
    }
});

btn_layers.addEventListener('click', (e) => {
    if (capas.style.visibility === "visible"){
        capas.style.visibility = "hidden";
    }else{
        disable_all();
        capas.style.visibility = "visible";   
    }
});

btn_rules.addEventListener('click', (e) => {
    if (norm.style.visibility === "visible"){
        norm.style.visibility = "hidden";
    }else{
        disable_all();
        norm.style.visibility = "visible";   
    }
});

function disable_all(){
    inf.style.visibility = "hidden";
    norm.style.visibility = "hidden";
    capas.style.visibility = "hidden";
}

disable_all();