console.log('🚀 Iniciando server.js');

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
const bodyParser = require('body-parser');
const Airtable = require('airtable');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5500; // Aseguramos que se usa el puerto correcto

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuración de Airtable
const apiKey = process.env.AIRTABLE_API_KEY;
const base = new Airtable({ apiKey }).base('app4hvr9H3C5RzRLh');

// Importar rutas
const authRoutes = require('./routes/auth');
const subscriptionRoutes = require('./routes/subscription');

// Configuración de rutas
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Servir archivos estáticos (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Ruta principal para cargar index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta de prueba para verificar conexión con Airtable
app.get('/ver-usuarios', async (req, res) => {
    try {
        const response = await axios.get(`https://api.airtable.com/v0/app4hvr9H3C5RzRLh/Usuarios`, {
            headers: { Authorization: `Bearer ${process.env.AIRTABLE_API_KEY}` }
        });
        res.json(response.data.records);
    } catch (error) {
        console.error("Error obteniendo datos de Airtable:", error);
        res.status(500).json({ message: "Error en la conexión con Airtable" });
    }
});

// Endpoint de login con Airtable
app.post('/api/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
        return res.status(400).json({ success: false, message: 'Faltan datos.' });
    }

    const filterFormula = `AND({Email} = '${identifier}', {Password} = '${password}')`;
    
    base('Usuarios').select({
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

// Manejador de errores global
app.use((err, req, res, next) => {
    console.error("Error en el servidor:", err);
    res.status(500).json({ error: "Ocurrió un error interno en el servidor" });
});

// Iniciar servidor
app.listen(port, () => {
    console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});
