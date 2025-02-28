console.log('🚀 Iniciando server.js');

import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import textToSpeech from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;
const upload = multer({ dest: 'uploads/' });

// Configuración explícita de CORS para todas las rutas
const corsOptions = {
  origin: '*', // Si deseas restringir a un dominio en específico, reemplaza '*' por el dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Manejo de solicitudes preflight para todas las rutas

// Middlewares para parsear el body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializamos el cliente de TTS usando las credenciales de la variable de entorno
let googleCredentials;
try {
  googleCredentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
} catch (e) {
  console.error("❌ Error al parsear GOOGLE_APPLICATION_CREDENTIALS_JSON:", e);
  process.exit(1);
}
const ttsClient = new textToSpeech.TextToSpeechClient({ credentials: googleCredentials });
console.log('✅ TTS Client inicializado con configuración por defecto.');

// 🎙 Endpoint Text-to-Speech (TTS) con manejo de errores
app.post('/api/tts', async (req, res) => { 
  console.log("🟢 Petición TTS recibida:", req.body);

  const text = req.body.text?.trim();
  if (!text) {
    console.error("⚠️ Error: No se recibió texto válido para TTS.");
    return res.status(400).json({ error: "Debe proporcionar un texto para sintetizar." });
  }

  try {
    console.log("🟡 Enviando solicitud a Google Cloud TTS...");

    const requestBody = {
      input: { text },
      voice: { languageCode: 'es-ES', name: 'es-ES-Wavenet-C', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0 }
    };

    console.log("📤 Request TTS:", JSON.stringify(requestBody, null, 2));

    // Usamos el cliente de TTS
    const [response] = await ttsClient.synthesizeSpeech(requestBody);

    if (!response.audioContent) {
      console.error("⚠️ Error: TTS no devolvió contenido de audio.", response);
      return res.status(500).json({ error: "Error al generar el audio." });
    }

    console.log("✅ Audio generado correctamente. Enviando al cliente...");
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="tts-audio.mp3"'
    });
    res.send(Buffer.from(response.audioContent, 'base64'));
  } catch (err) {
    console.error("❌ Error en TTS:", err.stack);
    res.status(500).json({ 
      error: "Error interno al sintetizar el audio.", 
      details: err.message 
    });
  }
});

// 📸 Placeholder: Subida de imágenes
app.post('/subir-imagen', upload.single('photo'), (req, res) => {
  res.json({ message: "Funcionalidad no implementada en este ejemplo." });
});

// 🔍 Placeholder: Análisis de imágenes
app.post('/analizar-imagen', async (req, res) => {
  res.json({ message: "Funcionalidad no implementada en este ejemplo." });
});

// 🔑 Rutas de autenticación y suscripciones
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// SERVIR ARCHIVOS ESTÁTICOS
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("❌ Error en el servidor:", err);
  res.status(500).json({ error: "Ocurrió un error interno en el servidor." });
});

// Iniciar servidor usando el puerto configurado
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});
