import os
import requests
from dotenv import load_dotenv

# Cargar variables del archivo .env
load_dotenv()

API_KEY = os.getenv("ELEVENLABS_API_KEY")
VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Puedes cambiarlo por otro ID de voz de ElevenLabs

# Verificar si la API Key se cargó correctamente
if not API_KEY:
    print("❌ ERROR: La API Key no se ha cargado. Verifica tu archivo .env.")
    exit()

# Texto que quieres convertir en voz
texto = "Hola, esta es una prueba de mi clon con voz humana."

# Configurar la solicitud a ElevenLabs
url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
headers = {
    "xi-api-key": API_KEY,
    "Content-Type": "application/json"
}
data = {
    "text": texto,
    "voice_settings": {
        "stability": 0.5,
        "similarity_boost": 0.8
    }
}

# Hacer la petición a la API
response = requests.post(url, json=data, headers=headers)

# Guardar el audio si la respuesta es correcta
if response.status_code == 200:
    with open("voz_generada.mp3", "wb") as file:
        file.write(response.content)
    print("✅ Voz generada con éxito. Escúchala en 'voz_generada.mp3'")
else:
    print("❌ Error:", response.status_code, response.text)
