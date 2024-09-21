import requests
import time
import json

def sendTelegramMessage(message):
    with open('config.json', 'r') as file:
        config = json.load(file)
    if not config["telegram"]["enabled"]: return

    url = f'https://api.telegram.org/bot{config["telegram"]["botToken"]}/sendMessage'
    payload = {
        'chat_id': config["telegram"]["channelId"],
        'text': message
    }
    try:
        response = requests.post(url, data=payload, timeout=5)  # Added timeout for safety
        if response.status_code == 200:
            print('Nachricht erfolgreich gesendet')
        else:
            print(f'Fehler beim Senden der Nachricht: {response.status_code}')
            print(response.text)
    except requests.exceptions.RequestException as e:
        print(f"Exception occurred while sending Telegram message: {e}")
