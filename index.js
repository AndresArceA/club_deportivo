// Paso 1
const fs = require("fs");

const express = require("express");
const app = express();
const axios = require("axios");
const PORT = process.env.PORT || 3000;

//levanto servidor en puerto PORT.
app.listen(PORT, () => {
  console.log("Servidor Express iniciado en el puerto" + PORT);
});
// Ruta raíz para mostrar el HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

//ruta que Sirve los datos de Deportes.json y los muestra en la pagina
app.get("/deportes", (req, res) => {
  try {
    // Leer el archivo JSON de forma síncrona
    const data = fs.readFileSync("Deportes.json", "utf-8");
    const deportes = JSON.parse(data).deportes;
    // Enviar los datos de los deportes como respuesta en formato JSON
    res.json({ deportes: deportes });
  } catch (error) {
    console.error("Error al leer el archivo JSON:", error);
    res.status(500).send("Error interno del servidor");
  }
});

// Ruta para almacenar en archivo json los deportes agregados

app.get("/agregar", (req, res) => {
  try {
    const { nombre, precio } = req.query;
    if (!nombre || !precio) {
      return res
        .status(400)
        .send("Se requieren los parámetros 'nombre' y 'precio'");
    }
    const deporte = { nombre, precio };
    let deportes = [];
    try {
      const data = fs.readFileSync("Deportes.json", "utf-8");
      if (data) {
        deportes = JSON.parse(data).deportes;
      }
    } catch (error) {
      // Si el archivo no existe o no es válido, se maneja aquí
    }

    // Validar que el nombre del deporte no esté repetido
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

//ruta para la edicion del precio del deporte
app.get("/editar", (req, res) => {
  try {
    const { nombre, precio } = req.query;
    if (
      !nombre ||
      !precio ||
      precio === isNaN ||
      (!isNaN(precio) && precio < 0)
    ) {
      return res
        .status(400)
        .send("Por favor, ingrese un nombre y un precio válido.");
    }

    let deportes = [];
    try {
      const data = fs.readFileSync("Deportes.json", "utf-8");
      if (data) {
        deportes = JSON.parse(data).deportes;
      }

      // Buscar si el deporte ya existe en la lista
      const deporteRepetido = deportes.find((d) => d.nombre === nombre);
      if (deporteRepetido) {
        // Actualizar el precio del deporte existente
        deporteRepetido.precio = precio;
      } else {
        // Si no existe, agregarlo a la lista
        res
          .status(405)
          .send(
            "Si desea agregar un deporte nuevo, utilize la ruta /agregar , para editar debe existir el deporte en la lista, revise el nombre del deporte."
          );
        const html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Popup desde Express</title>
            <script>
                window.onload = function() {
                    alert('¡Este es un popup desde Express!');
                };
            </script>
        </head>
        <body>
            <h1>Página con Popup</h1>
        </body>
        </html>`;
        res.send(html);
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


//ruta para eliminar deporte
// app.get("/eliminar/:nombre", (req, res) => {
//   const nombre = req.params.nombre;
//   const data = JSON.parse(fs.readFileSync("Deportes.json", "utf8"));
//   let deportes = data.deportes;
//   let deporteEncontrado = false;

//   deportes.forEach((deporte, index) => {
//       if (deporte.nombre === nombre) {
//           // Eliminar el deporte encontrado
//           deportes.splice(index, 1);
//           deporteEncontrado = true;
//       }
//   });

//   if (deporteEncontrado) {
//       fs.writeFileSync("Deportes.json", JSON.stringify(data));
//       res.send("Deporte eliminado correctamente");
//   } else {
//       res.send("El deporte buscado no existe");
//   }
// });

app.get("/eliminar/:nombre", (req, res) => {
  try {
    const { nombre } = req.params; // Usar req.params para obtener los parámetros de la ruta

    if (!nombre) {
      return res.status(400).send("Por favor, ingrese un nombre válido para eliminar.");
    }

    let deportes = [];
    try {
      const data = fs.readFileSync("Deportes.json", "utf-8");
      if (data) {
        deportes = JSON.parse(data).deportes;
      }

      // Filtrar el deporte a eliminar
      const deportesActualizados = deportes.filter((d) => d.nombre !== nombre);

      if (deportesActualizados.length === deportes.length) {
        // Si la longitud es la misma, el deporte no fue eliminado
        return res.status(404).send("El deporte no existe en la lista.");
      }

      // Escribir la lista actualizada en el archivo
      fs.writeFileSync("Deportes.json", JSON.stringify({ deportes: deportesActualizados }));

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

// Ruta genérica para manejar solicitudes a rutas no existentes
app.get('*', (req, res) => {
  res.status(404).send("La ruta solicitada no existe en el servidor.");
});