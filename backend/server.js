console.log('🚀 Iniciando server.js');

import express from 'express';
import cors from 'cors';
import path from 'path';
import axios from 'axios';
import bodyParser from 'body-parser';
import Airtable from 'airtable';
import Stripe from 'stripe';
import multer from 'multer';
import textToSpeech from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

// Configuración de las credenciales de Google TTS
let ttsClient;
try {
  if (!process.env.GOOGLE_CREDENTIALS_JSON) {
    throw new Error("No se definió la variable de entorno GOOGLE_CREDENTIALS_JSON");
  }
  const googleCreds = JSON.parse(process.env.GOOGLE_CREDENTIALS_JSON);
  ttsClient = new textToSpeech.TextToSpeechClient({
    credentials: {
      client_email: googleCreds.client_email,
      private_key: googleCreds.private_key,
    },
    projectId: googleCreds.project_id, // opcional
  });
  console.log("✅ Cargando credenciales desde GOOGLE_CREDENTIALS_JSON");
} catch (error) {
  console.error("❌ Error al cargar las credenciales:", error);
  process.exit(1);
}



// Configurar __filename y __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5500;
const upload = multer({ dest: 'uploads/' });

// Middleware para establecer Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", "default-src *; connect-src *;");
  next();
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------
// 📌 ENDPOINTS API
// --------------------

// 🎙 **Text-to-Speech (TTS) Endpoint**
app.post('/api/tts', cors(), async (req, res) => {
  console.log("🟢 Petición TTS recibida:", req.body);

  const text = req.body.text?.trim();
  if (!text) {
    console.error("⚠️ Error: No se recibió texto válido para TTS.");
    return res.status(400).json({ error: "Debe proporcionar un texto para sintetizar." });
  }

  try {
    console.log("🟡 Enviando solicitud a Google Cloud TTS...");
    const request = {
      input: { text },
      voice: { languageCode: 'es-ES', name: 'es-ES-Wavenet-C', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0 }
    };

    const [response] = await ttsClient.synthesizeSpeech(request);

    if (!response.audioContent) {
      console.error("⚠️ Error: Google TTS no devolvió contenido de audio.");
      return res.status(500).json({ error: "Error al generar el audio." });
    }

    console.log("✅ Audio generado correctamente. Enviando al cliente...");
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="tts-audio.mp3"'
    });
    res.send(response.audioContent);
  } catch (err) {
    console.error("❌ Error en TTS:", err);
    res.status(500).json({ error: "Error interno al sintetizar el audio." });
  }
});

// 📸 **Placeholder: Subida de imágenes**
app.post('/subir-imagen', upload.single('photo'), (req, res) => {
  res.json({ message: "Funcionalidad no implementada en este ejemplo." });
});

// 🔍 **Placeholder: Análisis de imágenes**
app.post('/analizar-imagen', async (req, res) => {
  res.json({ message: "Funcionalidad no implementada en este ejemplo." });
});

// 🔑 **Autenticación & Suscripciones**
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// --------------------
// 🌍 SERVIR ARCHIVOS ESTÁTICOS
// --------------------

app.use(express.static(path.join(__dirname, '..')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// 📌 **Manejo global de errores**
app.use((err, req, res, next) => {
  console.error("❌ Error en el servidor:", err);
  res.status(500).json({ error: "Ocurrió un error interno en el servidor." });
});

// 🚀 **Iniciar servidor**
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});
