// importo modulos
const fs = require("fs");
const express = require("express");
const app = express();
const axios = require("axios");

//defino numero de puerto para el servidor
const PORT = process.env.PORT || 3000;

//levanto servidor en puerto PORT.
app.listen(PORT, () => {
  console.log("Servidor Express iniciado en el puerto" + PORT);
});

// Ruta raíz para mostrar el HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//------------------REQUERIMIENTO 1-----------------

//ruta que Sirve los datos de Deportes.json y los muestra en la pagina
app.get("/deportes", (req, res) => {
  try {
    const data = fs.readFileSync("Deportes.json", "utf-8"); //leo el archivo json
    const deportes = JSON.parse(data).deportes;
    res.json({ deportes: deportes });
  } catch (error) {
    if (error.code === "ENOENT") {
      // Error: archivo no encontrado
      console.error('Error: El archivo "Deportes.json" no existe.');
      // Informo al usuario sobre cómo crear el archivo
      return res
        .status(404)
        .send(
          'El archivo "Deportes.json" no existe; vaya a /agregar?nombre="deporte"&precio="precio" para crearlo.'
        );
    } else {
      // Otro tipo de error al leer el archivo
      console.error('Error al leer el archivo "Deportes.json":', error);
      return res.status(500).send("Error interno del servidor");
    }
  }
});

//------------------REQUERIMIENTO 2-----------------

// Ruta para almacenar en archivo json los deportes agregados

app.get("/agregar", (req, res) => {
  try {
    const { nombre, precio } = req.query;
    if (!nombre || !precio) {
      //valido que existan los parametros
      return res
        .status(400)
        .send(
          "Se requieren los parámetros 'nombre' y 'precio' en el siguiente formato ?nombre=deporte&precio=valor"
        );
    }
    const deporte = { nombre, precio }; //creo el objeto deporte
    let deportes = []; //creo el arreglo deportes
    try {
      const data = fs.readFileSync("Deportes.json", "utf-8"); //leo el archivo
      if (data) {
        deportes = JSON.parse(data).deportes;
      }
    } catch (error) {
      // error para la falta de archivo
      if (error.code === "ENOENT") {
        // Error de archivo no encontrado
        console.error('El archivo "Deportes.json" no existe.');
      } else {
        // Otro tipo de error al leer el archivo
        console.error('Error al leer el archivo "Deportes.json":', error);
        return res.status(500).send("Error interno del servidor");
      }
    }

    // Valido que el nombre del deporte no esté repetido
    const deporteRepetido = deportes.find((d) => d.nombre === nombre);
    if (deporteRepetido) {
      return res.status(400).send("El nombre del deporte ya existe");
    }
    // agregar deporte al archivo json

    deportes.push(deporte);
    fs.writeFileSync("Deportes.json", JSON.stringify({ deportes }));
    res.send("Deporte agregado correctamente");
  } catch (error) {
    console.error("Error al agregar deporte:", error);
    res.status(500).send("Error interno del servidor");
  }
});

//------------------REQUERIMIENTO 3-----------------

//ruta para la edicion del precio del deporte
app.get("/editar", (req, res) => {
  try {
    const { nombre, precio } = req.query;
    if (
      !nombre ||
      !precio ||
      precio === isNaN ||
      (!isNaN(precio) && precio < 0) //valido que el precio sea un numero y sea mayor a 0
    ) {
      return res
        .status(400)
        .send("Por favor, ingrese un nombre y un precio válido.");
      
    }

    let deportes = []; // creo el arreglo deportes
    try {
      const data = fs.readFileSync("Deportes.json", "utf-8");
      if (data) {
        deportes = JSON.parse(data).deportes; //cargo los datos del archivo en la variable deportes
      }

      // Busco si el deporte ya existe en la lista
      const deporteRepetido = deportes.find((d) => d.nombre === nombre);
      if (deporteRepetido) {
        // Actualizo el precio del deporte existente
        deporteRepetido.precio = precio;
      } else {
        // Si no existe, informo de como agregarlo a la lista
        res
          .status(405)
          .send(
            "Si desea agregar un deporte nuevo, utilize la ruta /agregar , para editar debe existir el deporte en la lista, revise el nombre del deporte."
          );
      }

      // Escribir la lista actualizada en el archivo
      fs.writeFileSync("Deportes.json", JSON.stringify({ deportes }));

      res.send("Precio actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar el precio:", error);
      res.status(500).send("Error interno del servidor");
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    res.status(500).send("Error interno del servidor");
  }
});

//------------------REQUERIMIENTO 4-----------------

//ruta para la eliminacion del deporte de la lista
app.get("/eliminar/:nombre", (req, res) => {
  try {
    const { nombre } = req.params; // Uso req.params para obtener los parámetros de la ruta

    if (!nombre) {
      return res
        .status(400)
        .send("Por favor, ingrese un nombre válido para eliminar.");
    }

    let deportes = []; //creo el array y almaceno el contenido del json en el array
    try {
      const data = fs.readFileSync("Deportes.json", "utf-8");
      if (data) {
        deportes = JSON.parse(data).deportes;
      }

      // Filtro el deporte a eliminar para excluir el deporte con el nombre proporcionado
      const deportesActualizados = deportes.filter((d) => d.nombre !== nombre);

      if (deportesActualizados.length === deportes.length) {
        // Si la longitud es la misma de los arreglos, el deporte no fue eliminado
        return res.status(404).send("El deporte no existe en la lista.");
      }

      // Escribir la lista actualizada en el archivo
      fs.writeFileSync(
        "Deportes.json",
        JSON.stringify({ deportes: deportesActualizados })
      );

      res.send("Deporte eliminado correctamente");
    } catch (error) {
      console.error("Error al eliminar el deporte:", error);
      res.status(500).send("Error interno del servidor");
    }
  } catch (error) {
    console.error("Error en la solicitud:", error);
    res.status(500).send("Error interno del servidor");
  }
});

//------------------REQUERIMIENTO 5-----------------

// Ruta genérica para manejar solicitudes a rutas no existentes
app.get("*", (req, res) => {
  res.status(404).send("La ruta solicitada no existe en el servidor.");
});
