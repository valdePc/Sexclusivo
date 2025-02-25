console.log('🚀 Iniciando server.js');

import express from 'express';
import cors from 'cors';
import path from 'path';
import bodyParser from 'body-parser';
import multer from 'multer';
import textToSpeech from '@google-cloud/text-to-speech';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const app = express();
const port = process.env.PORT || 5500;
const upload = multer({ dest: 'uploads/' });

// Configuración de las credenciales de Google TTS leyendo el archivo JSON
let ttsClient;
try {
  const credsPath = process.env.GOOGLE_CREDENTIALS_JSON;
  if (!credsPath) {
    throw new Error("No se definió la variable de entorno GOOGLE_CREDENTIALS_JSON");
  }
  const credsData = fs.readFileSync(credsPath, 'utf8');
  const googleCreds = JSON.parse(credsData);
  ttsClient = new textToSpeech.TextToSpeechClient({
    credentials: {
      client_email: googleCreds.client_email,
      private_key: googleCreds.private_key,
    },
    projectId: googleCreds.project_id, // opcional
  });
  console.log(`✅ Cargando credenciales desde ${credsPath}`);
} catch (error) {
  console.error("❌ Error al cargar las credenciales:", error);
  process.exit(1);
}

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 📌 ENDPOINTS API

// 🎙 Endpoint Text-to-Speech (TTS) usando el cliente oficial
app.post('/api/tts', cors(), async (req, res) => { 
  console.log("🟢 Petición TTS recibida:", req.body);

  const text = req.body.text?.trim();
  if (!text) {
    console.error("⚠️ Error: No se recibió texto válido para TTS.");
    return res.status(400).json({ error: "Debe proporcionar un texto para sintetizar." });
  }

  try {
    console.log("🟡 Enviando solicitud a Google Cloud TTS usando cliente oficial...");

    const requestBody = {
      input: { text },
      voice: { languageCode: 'es-ES', name: 'es-ES-Wavenet-C', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0 }
    };

    // Usamos el cliente oficial ya autenticado
    const [response] = await ttsClient.synthesizeSpeech(requestBody);

    if (!response.audioContent) {
      console.error("⚠️ Error: Google TTS no devolvió contenido de audio.", response);
      return res.status(500).json({ error: "Error al generar el audio." });
    }

    console.log("✅ Audio generado correctamente. Enviando al cliente...");
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="tts-audio.mp3"'
    });
    res.send(Buffer.from(response.audioContent, 'base64'));
  } catch (err) {
    console.error("❌ Error en TTS:", err);
    res.status(500).json({ error: "Error interno al sintetizar el audio." });
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

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});
