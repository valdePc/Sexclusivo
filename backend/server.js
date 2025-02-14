const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const Airtable = require('airtable');

const app = express();
const PORT = process.env.PORT || 5500;

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Airtable con los datos que me diste
const apiKey = 'patPBIPIWBBIpocvV.0971c50a0158c9984a3ace17e447d589cf34e1c04db80af25ebc76b58c95b723';
const base = new Airtable({ apiKey }).base('appnIdxIuAdZLiYcX');

// **Ruta de archivos estáticos**
const staticPath = path.join(__dirname, '../frontend/assets');
app.use(express.static(staticPath));

// **Servir `index.html` al acceder a `/`**
app.get('/', (req, res) => {
  res.sendFile(path.join(staticPath, 'index.html'));
});

// **Endpoint de login con Airtable**
app.post('/api/login', (req, res) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ success: false, message: 'Faltan datos.' });
  }

  const filterFormula = `AND({Email} = '${identifier}', {Password} = '${password}')`;

  base('Xclusivo').select({
    filterByFormula: filterFormula,
    maxRecords: 1
  }).firstPage((err, records) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ success: false, message: 'Error de base de datos.' });
    }
    if (records.length > 0) {
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Credenciales incorrectas.' });
    }
  });
});

// **Iniciar servidor**
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
