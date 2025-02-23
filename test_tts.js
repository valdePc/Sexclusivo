import textToSpeech from '@google-cloud/text-to-speech';
import fs from 'fs';

console.log("Inicio del script TTS");

const client = new textToSpeech.TextToSpeechClient();

async function generateTTS() {
    console.log("Ejecutando generateTTS...");
    const request = {
        input: { text: "Hola, soy tu clon y ahora hablo con una voz más realista." },
        voice: { languageCode: 'es-ES', name: 'es-ES-Wavenet-C', ssmlGender: 'FEMALE' },
        audioConfig: { audioEncoding: 'MP3' },
    };

    try {
        console.log("Enviando solicitud a Google Cloud TTS...");
        const [response] = await client.synthesizeSpeech(request);
        console.log("Respuesta recibida. Tamaño del audio:", response.audioContent.length, "bytes");
        fs.writeFileSync('tts-test.mp3', Buffer.from(response.audioContent, 'base64'));
        console.log("Audio guardado como tts-test.mp3. ¡Intenta reproducirlo!");
    } catch (error) {
        console.error("Error en Google TTS:", error);
    }
}

generateTTS().then(() => {
  console.log("generateTTS finalizado");
});

console.log("Fin del script TTS (sincrónico)");
