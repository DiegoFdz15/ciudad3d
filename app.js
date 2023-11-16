const express = require('express');
const path = require('path');
const sanitize = require('express-sanitize');
const {createPool}= require("mysql2/promise");
const { sv, db } = require('./app.config');
const helmet = require('helmet');
const cors = require('cors');

let last_id;

main();

async function main(){

    ///////////// DB CONECT
    conn = await createPool({
    database: db.database,
    user: db.user,
    host: db.host,
    password: db.password,
    ssl: {
        rejectUnauthorized: true
    }
    });

    conn.query("SELECT * FROM [TABLE];").then((data) => {
        last_id = data[0].slice(-1)[0].id;
    }).catch((error) => {
        console.log(error);
    });


    console.log('connection ready');

    ///////////// EXPRESS SERVER
    const app = express();

    ///////////// EXPRESS SERVER -  MIDDLEWARES
    app.use(express.json());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use(sanitize);
    app.use(helmet());
    app.use(cors());
    app.use((req,res,next) => {
        console.log("User "+req.socket.remoteAddress+" connected.");
        next();
    });

    ///////////// MIDDLEWARES - HELMET
    app.disable('x-powered-by');


    ///////////// EXPRESS SERVER - ROUTES
    
    app.get('/', (req,res) => {
        res.status(200).sendFile(path.join(__dirname, "public","index.html"));
    });

    app.get('/parcelas/:idParcela', (req,res) => {
        const parametro = parseInt(req.params.idParcela);
        if (parametro > last_id){
            res.status(400).send("Fuera de rango");
        }else{
            conn.query("SELECT * FROM [TABLE] WHERE id=" + parametro + ";").then((data) => {
                res.status(200).send(data[0]);
            }).catch((err) => {
                res.status(400).send("Ha ocurrido un error al realizar la transaccion.");
            });
        }
    });

    app.get('/parcelas/', (req,res) => {
        conn.query("SELECT * FROM [TABLE];").then((data) => {
            res.status(200).send(data[0]);
        }).catch((err) => {
            res.status(400).send("Ha ocurrido un error al realizar la transaccion.");
        });
    });

    app.post('/parcelas/', (req,res) => {

        var obj = {
            direccion: req.body.direccion,
            barrio: req.body.barrio,
            superficie_edificada: req.body.superficie_edificada,
            superficie_parcela: req.body.superficie_parcela,
            cant_total_unidades_funcionales: req.body.cant_total_unidades_funcionales,
            cant_piso_sobre_rasante: req.body.cant_piso_sobre_rasante,
            cant_piso_bajo_rasante: req.body.cant_piso_bajo_rasante,
            nombre:req.body.name,
            descripcion: req.body.descripcion
        };
        
        let q = "INSERT INTO [TABLE] (id, direccion, barrio, superficie_edificada, superficie_parcela," +
        "cant_total_unidades_funcionales,cant_piso_sobre_rasante,cant_piso_bajo_rasante )VALUES (" + 
        (last_id + 1)+ ", '"+ obj.direccion +"','"+obj.barrio +"','"+obj.superficie_edificada+"','"+ obj.superficie_parcela +
        "','"+ obj.cant_total_unidades_funcionales+"','"+obj.cant_piso_sobre_rasante+"','"+obj.cant_piso_bajo_rasante+"');"

        conn.query(q).then((data) => {
            last_id ++;
            res.status(200).send('La transaccion se ha realizado con exito.');
        }).catch((error) => {
            res.status(400).send(error);
        });
        
    });

    app.delete("/parcelas/:id", (req,res) => {
        const parametro = parseInt(req.params.id);
        if (parametro > last_id) res.status(400).send('Fuera de rango.');else{
            conn.query("DELETE FROM [TABLE] WHERE id=" + parametro + ";").then((data) => {
                res.status(200).send("se ha borrado");
            }).catch((err) => {
                console.log(err)
                res.status(400).send("Ha ocurrido un error al realizar la transaccion.");
            });
        }
    });

    app.put("/parcelas/:id", (req,res) => {

        const parametro = parseInt(req.params.id);
        if (parametro > last_id) res.status(400).send('Fuera de rango.');else{
            let que = "UPDATE [TABLE] " + 
                "SET direccion='" + req.body.direccion + "', " +
                "barrio='" + req.body.barrio + "', " +
                "superficie_edificada='" + req.body.superficie_edificada + "', " +
                "superficie_parcela='" + req.body.superficie_parcela + "', " +
                "cant_total_unidades_funcionales='" + req.body.cant_total_unidades_funcionales + "', " +
                "cant_piso_sobre_rasante='" + req.body.cant_piso_sobre_rasante + "', " +
                "cant_piso_bajo_rasante='" + req.body.cant_piso_bajo_rasante + "' " +
                "WHERE id=" + parametro + ";";
        
            conn.query(que)
            .then((data) => res.status(200).send("Se ha actualizado"))
            .catch(err => res.status(400).send(err));
        }
    });

    app.get('/*', (req,res) => {
        res.status(404).send("Pagina no encontrada.");
    });

    app.listen(sv.port, () => {
        console.log("Servidor a la escucha. [" + sv.port + "]");
    });
}