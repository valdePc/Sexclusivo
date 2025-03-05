import os
import requests
from dotenv import load_dotenv
from telegram.ext import Updater, CommandHandler, MessageHandler, Filters

# Cargar variables del archivo .env
load_dotenv()

# Variables de entorno
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Puedes cambiarlo por otro Voice ID de ElevenLabs

def generate_voice(text):
    """
    Envía una petición a la API de ElevenLabs para generar voz a partir del texto.
    Retorna el contenido del audio (en bytes) o None si hay error.
    """
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    headers = {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
    }
    data = {
        "text": text,
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.8
        }
    }
    response = requests.post(url, json=data, headers=headers)
    if response.status_code == 200:
        return response.content
    else:
        print("Error generando voz:", response.status_code, response.text)
        return None

def start(update, context):
    update.message.reply_text("¡Hola! Envíame un mensaje y te responderé con voz.")

def handle_message(update, context):
    text = update.message.text
    audio = generate_voice(text)
    if audio:
        temp_filename = "temp_voice.mp3"
        with open(temp_filename, "wb") as f:
            f.write(audio)
        # Envía el audio como respuesta (como voz)
        update.message.reply_voice(voice=open(temp_filename, "rb"))
        os.remove(temp_filename)
    else:
        update.message.reply_text("Error generando voz. Intenta nuevamente.")

def main():
    updater = Updater(TELEGRAM_TOKEN, use_context=True)
    dp = updater.dispatcher

    dp.add_handler(CommandHandler("start", start))
    dp.add_handler(MessageHandler(Filters.text & ~Filters.command, handle_message))

    updater.start_polling()
    print("Bot iniciado. Esperando mensajes...")
    updater.idle()

if __name__ == "__main__":
    main()
