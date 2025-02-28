const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');

// Crea un cliente de Text-to-Speech.
// Google usará las credenciales definidas en la variable de entorno GOOGLE_APPLICATION_CREDENTIALS
const client = new textToSpeech.TextToSpeechClient();

async function synthesizeSpeech(text, outputFile) {
  const request = {
    input: { text: text },
    // Configura el idioma y el género de la voz (ajusta según tus necesidades)
    voice: { languageCode: 'es-ES', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' },
  };

  // Realiza la solicitud a la API
  const [response] = await client.synthesizeSpeech(request);
  // Escribe el contenido de audio en un archivo
  const writeFile = util.promisify(fs.writeFile);
  await writeFile(outputFile, response.audioContent, 'binary');
  console.log('Audio guardado en: ' + outputFile);
}

// Ejemplo de uso:
synthesizeSpeech("Hola, ¿en qué puedo ayudarte?", "output.mp3");
