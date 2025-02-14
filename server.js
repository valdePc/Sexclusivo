console.log('Iniciando server.js');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Importa las rutas (asegúrate de que los archivos existan en la carpeta routes/)
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');

// Configura las rutas base
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Servir archivos estáticos (frontend)
app.use(express.static('public'));

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
