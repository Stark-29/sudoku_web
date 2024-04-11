const express = require('express');
const path = require('path');

const app = express();
const port = 3000;


// Configuración para servir archivos estáticos desde el directorio sudoku_web
app.use(express.static('public'));

// Ruta para manejar solicitudes GET a la raíz
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});


