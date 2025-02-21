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
console.log('Valor de GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Instanciar el cliente de TTS
const ttsClient = new textToSpeech.TextToSpeechClient();

// Configurar __filename y __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5500;
const upload = multer({ dest: 'uploads/' });

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --------------------
// DEFINICIÓN DE ENDPOINTS API
// --------------------

// Endpoint TTS: Genera audio MP3 a partir del texto enviado
app.post('/api/tts', async (req, res) => {
  console.log("🟢 Petición TTS recibida:", req.body);
  try {
    const request = {
      input: { text: req.body.text },
      voice: { languageCode: 'es-ES', name: 'es-ES-Wavenet-C', ssmlGender: 'FEMALE' },
      audioConfig: { audioEncoding: 'MP3', speakingRate: 1.0, pitch: 0 }
    };

    console.log("🟡 Enviando solicitud a Google Cloud TTS...");
    const [response] = await ttsClient.synthesizeSpeech(request);
    if (response && response.audioContent) {
      console.log("✅ Se recibió audio desde Google TTS. Tamaño:", response.audioContent.length, "bytes");
    } else {
      console.log("⚠️ La respuesta de TTS no contiene audio.");
    }

    // Convertir la cadena base64 a Buffer para enviar el audio MP3
    const audioBuffer = Buffer.from(response.audioContent, 'base64');

    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Disposition': 'inline; filename="tts-audio.mp3"'
    });
    res.send(audioBuffer);
  } catch (err) {
    console.error("❌ Error en TTS:", err);
    res.status(500).json({ error: "Error interno al sintetizar el audio" });
  }
});

// Endpoint para subir imágenes (placeholder)
app.post('/subir-imagen', upload.single('photo'), (req, res) => {
  res.json({ message: "Funcionalidad no implementada en este ejemplo." });
});

// Endpoint de análisis de imágenes (placeholder)
app.post('/analizar-imagen', async (req, res) => {
  res.json({ message: "Funcionalidad no implementada en este ejemplo." });
});

// Importar y usar otras rutas (por ejemplo, auth y subscription)
import authRoutes from './routes/auth.js';
import subscriptionRoutes from './routes/subscription.js';
app.use('/api/auth', authRoutes);
app.use('/api/subscription', subscriptionRoutes);

// --------------------
// FIN DE ENDPOINTS API
// --------------------

// Middleware para servir archivos estáticos desde la raíz del proyecto (sube un nivel desde 'backend')
app.use(express.static(path.join(__dirname, '..')));

// Servir también la carpeta 'uploads'
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ruta para 'index.html' en la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error("❌ Error en el servidor:", err);
  res.status(500).json({ error: "Ocurrió un error interno en el servidor" });
});

// Iniciar servidor en todas las interfaces (0.0.0.0)
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en: http://localhost:${port}`);
});
