// Ruta para almacenar en archivo json varios objetos

// Paso 1
const fs = require("fs");

const express = require('express');
const app = express();
const PORT = 3000;

app.listen(3000, ()=> console.log("Servidor escuchando Puerto: "+PORT));

// Paso 2
app.get("/nuevoUsuario", (req, res) => {
    // Paso 3
    const{ rut, name, lastname, email, password } = req.query
    
    // construccion del objeto
    const usuario = {rut, name,lastname,email,password};
    console.log("Valor del objeto: ",usuario);
    
    // Paso 4
    // Paso 4.1
    const data = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
    // Paso 4.2
    const usuarios = data.usuarios;
    // Paso 4.3
    usuarios.push(usuario);
    // Paso 4
    fs.writeFileSync("usuarios.json", JSON.stringify(data));
    
    res.send(
        {
            status: 200,
            error: "false",
            msg: "Usuario almacenado con éxito",
            datos: usuarios
        })

})

//ruta para visualizar a todos los usuarios
app.get('/usuarios',(req, res) =>{
    const data = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
    res.send(data)
});

//ruta para visualizar a un usuario
app.get('/usuario/:rut',(req, res) =>{

    const rut = req.params.rut;
    const data = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
    console.log("valor de data: ", data);
    const usuarios = data.usuarios;
    let busqueda = usuarios.findIndex((elem)=> elem.rut == rut);

    if(busqueda == -1){
        console.log("El usuario rut: " + rut + " no existe");
        return res.send("El usuario buscado no existe")
        
    } else {
        console.log("El usuario es: ", usuarios[busqueda]);
    }




    res.send("busqueda finalizada");
});

//ruta para modificar a un usuario
app.get('/modificar/:rut',(req, res) =>{

});

//ruta para eliminar a un usuario
app.get('/eliminar/:rut',(req, res) =>{
    const rut = req.params.rut;
    const data = JSON.parse(fs.readFileSync("usuarios.json", "utf8"));
    console.log("valor de data: ", data);
    const usuarios = data.usuarios;
    let busqueda = usuarios.findIndex((elem)=> elem.rut == rut);

    if(busqueda == -1){
        console.log("El usuario rut: " + rut + " no existe");
        return res.send("El usuario buscado no existe")
        
    } else {
        console.log("El usuario es: ", usuarios[busqueda]);
        usuarios.splice(busqueda,1);
        fs.writeFileSync("usuarios.json", JSON.stringify(data));
    }




    res.send("Eliminacion finalizada");
});