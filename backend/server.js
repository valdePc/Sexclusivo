import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import axios from 'axios';

const app = express();

// Habilitar CORS correctamente
app.use(cors({
  origin: '*',  // Permite cualquier origen (puedes restringirlo en producción)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Middleware para parsear JSON
app.use(express.json());

// Ruta simple de verificación
app.get('/', (req, res) => {
  res.send('Servidor funcionando.');
});

const PORT = process.env.PORT || 5501;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID;

// Validar que las variables de entorno estén cargadas
if (!OPENAI_API_KEY || !ELEVENLABS_API_KEY || !ELEVENLABS_VOICE_ID) {
  console.error('Error: Faltan variables de entorno.');
  process.exit(1); // Detener la ejecución si faltan variables críticas
}

// Middleware para manejar CORS en cada solicitud
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Función común para procesar la solicitud y generar la respuesta en audio
async function handleResponse(req, res) {
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200); // Manejar solicitudes OPTIONS
  }

  const userText = req.body.text;
  const recordId = req.body.recordId; // Si usas recordId para algo dinámico

  if (!userText) {
    return res.status(400).json({ error: 'Texto vacío' });
  }

  try {
    console.log('Recibido texto:', userText);
    console.log('Usando OPENAI_API_KEY:', OPENAI_API_KEY ? 'Cargada' : 'No encontrada');
    console.log('ELEVENLABS_API_KEY:', ELEVENLABS_API_KEY ? 'Cargada' : 'No encontrada');
    console.log('ELEVENLABS_VOICE_ID:', ELEVENLABS_VOICE_ID ? 'Cargada' : 'No encontrada');

    // Enviar el mensaje a GPT-4
    const gptResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'Eres un clon realista.' },
          { role: 'user', content: userText },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Respuesta de GPT:', gptResponse.data);
    const botReply = gptResponse.data.choices[0].message.content;
    console.log('Respuesta del bot:', botReply);

    // Convertir la respuesta a voz con ElevenLabs
    const elevenLabsResponse = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
      {
        text: botReply,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5,
        },
      },
      {
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
          'Content-Type': 'application/json',
        },
        responseType: 'arraybuffer',
      }
    );

    console.log('Respuesta de ElevenLabs recibida');
    res.set({
      'Content-Type': 'audio/mpeg',
      'Access-Control-Allow-Origin': '*',  // Permitir acceso CORS en la respuesta
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });

    res.send(elevenLabsResponse.data);
  } catch (error) {
    console.error('Error completo:', error);
    console.error('Detalle:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'No se pudo generar la respuesta.' });
  }
}

// Definir endpoints que usan la misma lógica
app.post('/api/getResponse', handleResponse);
app.post('/api/getCloneResponse', handleResponse);
app.post('/api/tts', handleResponse);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
