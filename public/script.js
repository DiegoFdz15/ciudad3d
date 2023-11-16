mapboxgl.accessToken = '[your-mapbox-token]';
const map = new mapboxgl.Map({
    style:'mapbox://styles/mapbox/dark-v11',
    center: [-54.61028514552068, -25.509389375238143],
    zoom: 18,
    pitch: 45,
    bearing: -17.6,
    container: 'map',
    antialias: true,
    hash:true
});

map.on('style.load', () => {

    const layers = map.getStyle().layers;
    const labelLayerId = layers.find(
    (layer) => layer.type === 'symbol' && layer.layout['text-field']
    ).id;
    
    mapa3d(map,labelLayerId)

    ////////// SOURCES /////////

    map.addSource('plazacity-source',{
        type:'geojson',
        data:'layers/plazacity.geojson',
        generateId: true
    });

    map.addSource('all_routes_source',{
        type:'geojson',
        data:'layers/Roads-polyline.geojson',
        generateId: true
    });

    map.addSource('asfalt_layer',{
        type:'geojson',
        data:'layers/asphalt_road.geojson',
        generateId: true
    });

    map.addSource('dirt_layer',{
        type:'geojson',
        data:'layers/dirt_road.geojson',
        generateId: true
    });

    map.addSource('paved_layer',{
        type:'geojson',
        data:'layers/paved_road.geojson',
        generateId: true
    });

    ///////////////// checkboxes /////////////////////

    addMapLayer('calle_1',"all_routes_source","line",line_style('#59c2ff',5));
    addMapLayer('r_asfaltado',"asfalt_layer","line",line_style('#000000'));
    addMapLayer('r_tierra',"dirt_layer","line",line_style('#65661a'));
    addMapLayer('r_empedrado',"paved_layer","line",line_style('#a3a3a3'));

    let c2 = document.getElementById('plazacity');
    let added = false;

    c2.addEventListener('change', function() {
        if (this.checked) {
            map.removeLayer('add-3d-buildings');
            map.addLayer({
                id:c2.id,
                source:'plazacity-source',
                type:'fill-extrusion',
                paint:{
                    'fill-extrusion-color':[
                        'case',
                        ['boolean',
                            ['feature-state', 'hover'],
                        false]
                        ,'#000000','#9aad9f'
                    ],
                    'fill-extrusion-height':3,
                    'fill-extrusion-opacity': 0.8
                } 
            });
            added = true;
        } else {
            map.removeLayer(c2.id)
            added = false;
            mapa3d(map,labelLayerId)
        }
    });

    /////////// 3d button ////////////

    let clicked = true;

    let b_3d = document.getElementById('b_3d');
    b_3d.addEventListener("click", () => {
        if (clicked){
            if (added) map.removeLayer('plazacity');
            map.removeLayer('add-3d-buildings');
            b_3d.value = "3D"
            clicked = false;
        }else{
            b_3d.value = "2D"
            mapa3d(map,labelLayerId)
            clicked = true;
        }
    })

    /////////// style button ////////////

    document.getElementById('b_style').addEventListener("click", () => {
        if(map.getStyle().sprite === "mapbox://sprites/mapbox/dark-v11"){
            map.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
        }else{
            map.setStyle("mapbox://styles/mapbox/dark-v11");
        }


    })

    //map.setStyle("mapbox://styles/mapbox/dark-v11");
    //map.setStyle("mapbox://styles/mapbox/satellite-streets-v12");

    /////////// LAYERS ////////////////

    let quakeId = null

    map.on('mousemove','add-3d-buildings', (e) => {

        if (quakeId != e.features[0].id){
            map.setFeatureState({
                source: 'composite',
                id: quakeId,
                sourceLayer:'building'
            },{
                hover:false
            });
        }

        quakeId = e.features[0].id;

        map.setFeatureState({
            source: 'composite',
            id: quakeId,
            sourceLayer:'building'
        },{
            hover:true
        });

        feature = map.getFeatureState({
            source: 'composite',
            id: quakeId,
            sourceLayer:'building'
        });
        
        if (feature){
            change_inf("Altura: "+e.features[0].properties.height + "mts.","n")
        }
    });
});

let quakeId2 = null

map.on('mousemove','plazacity', (e) => {

    if (quakeId2 != e.features[0].id){
        map.setFeatureState({
            source: 'plazacity-source',
            id: quakeId2
        },{
            hover:false
        });
    }

    quakeId2 = e.features[0].id;

    map.setFeatureState({
        source: 'plazacity-source',
        id: quakeId2
    },{
        hover:true
    });

    let isHovered = map.getFeatureState({
        source: 'plazacity-source',
        id: quakeId2
    });
    
    if (isHovered){
        
        change_inf(e.features[0].properties.name,"building_name")
        change_inf(e.features[0].properties.descripcion,"building_description")
    }
});

function mapa3d(map,labelLayerId){
    map.addLayer({
        'id': 'add-3d-buildings',
        'source': 'composite',
        'source-layer': 'building',
        'filter': ['==', 'extrude', 'true'],
        'type': 'fill-extrusion',
        'minzoom': 10,
        'paint': {
        'fill-extrusion-color': [
            'case',
            ['boolean',
                ['feature-state', 'hover'],
            false]
            ,'#000000','#9aad9f'
        ],
        'fill-extrusion-height': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'height']
        ],
        'fill-extrusion-base': [
        'interpolate',
        ['linear'],
        ['zoom'],
        15,
        0,
        15.05,
        ['get', 'min_height']
        ],
        'fill-extrusion-opacity': 0.8
        }
    },
    labelLayerId
    );
}

function change_inf(properties,id){
    document.getElementById("n").innerText = " ";
    let direccion = document.getElementById(id);
    direccion.innerText = properties;
}

function addMapLayer(btnId,source,type,style){
    let c1 = document.getElementById(btnId);
    c1.addEventListener('change', function() {
        if (this.checked) {
            map.addLayer({
                id:c1.id,
                source:source,
                type:type,
                paint:style
            });
        } else {
            map.removeLayer(c1.id)
        }
    });
}

function line_style(color, width=10){
    return {
        'line-color':color,
        'line-width':width
    }
}