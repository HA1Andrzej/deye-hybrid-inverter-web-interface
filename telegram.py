import requests
import time

# Telegram-Bot-Details
BOT_TOKEN = '7338008570:AAGfAuDvdC48Nzm3q2GooS5Re292y5MHido'
CHANNEL_ID = '-1002238032049'

def sendTelegramMessage(message):
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    payload = {
        'chat_id': CHANNEL_ID,
        'text': message
    }
    response = requests.post(url, data=payload)
    if response.status_code == 200:
        print('Nachricht erfolgreich gesendet')
    else:
        print(f'Fehler beim Senden der Nachricht: {response.status_code}')
        print(response.text)
