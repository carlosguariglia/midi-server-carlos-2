const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const easymidi = require('easymidi');
const fs = require('fs');
const readline = require('readline').createInterface({ // ✅ Añadimos readline aquí
  input: process.stdin,
  output: process.stdout
});
const os = require('os');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Eleccion del Dispositivo MIDI

// Obtener entradas MIDI disponibles
const midiInputs = easymidi.getInputs();

// Mostrar opciones por consola
console.log("Entradas MIDI disponibles:");
midiInputs.forEach((device, index) => {
  console.log(`${index}: ${device}`);
});

// Preguntar al usuario por su elección
readline.question("Elige un dispositivo MIDI (introduce un número): ", (respuesta) => {
  const eleccion = parseInt(respuesta);

  // Validar la entrada
  if (isNaN(eleccion) || eleccion < 0 || eleccion >= midiInputs.length || eleccion > 10) {
    console.error("Elección inválida. Debe ser un número entre 0 y 10 y corresponder a un dispositivo listado.");
    process.exit(1); // Salir del proceso si la entrada no es válida
  }

  const midiDevice = midiInputs[eleccion];
  const midiOutput = new easymidi.Output(midiDevice);

  console.log(`Conectado a: ${midiDevice}`);

  // Ruta raíz
  app.get('/', (req,res)=>{
      res.sendFile(__dirname + '/index.html');
  });

  app.get('/config.js', (req, res) => {
    const ip = getLocalIP();
    res.setHeader('Content-Type', 'application/javascript');
    res.send(`const SERVER_IP = "${ip}";`);
});

  // Conexiones WebSocket
  wss.on('connection', (ws) => {
      console.log('Cliente WebSocket conectado');

      // Manejo de mensajes desde el navegador
      ws.on('message', (message) => {
          console.log(`Mensaje recibido del navegador: ${message}`);

          // Analizar el mensaje JSON
          const data = JSON.parse(message);
          const { ccNumber, ccValue} = data;

          // Enviar el mensaje MIDI CC al dispositivo seleccionado
          sendMidiCC(ccNumber, ccValue);
      });
  });

  // Función para enviar un mensaje MIDI CC
  function sendMidiCC(ccNumber, ccValue) {
      // Enviar el mensaje MIDI CC
      midiOutput.send('cc', {
          controller: ccNumber,
          value: ccValue,
          channel: 0, // Canal 1 MIDI (cambia si es necesario)
      });

      // Cerrar la conexión MIDI después de enviar el mensaje NO CERRAR!!!!
      // midiOutput.close();

      console.log(`Enviando CC ${ccNumber} a ${midiDevice} con valor: ${ccValue}`);
  }

  // Iniciar el servidor en el puerto 3001
  const PORT = process.env.PORT || 3001;
  server.listen(PORT, () => {
      const ip = getLocalIP();
      console.log(`Servidor escuchando en http://${ip}:${PORT}`);
      console.log(`Accede desde el celular a: http://${ip}:${PORT}`);
  });

  readline.close(); // ✅ Cerramos readline después de usarlo
});

// Obtener la dirección IP local
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (let dev in interfaces) {
        for (let i = 0; i < interfaces[dev].length; i++) {
            const { family, address, internal } = interfaces[dev][i];
            if (family === 'IPv4' && !internal) return address;
        }
    }
    return 'localhost';
}
