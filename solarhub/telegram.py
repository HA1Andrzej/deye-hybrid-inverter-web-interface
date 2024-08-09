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
   response = requests.post(url, data=payload)
   if response.status_code == 200:
      print('Nachricht erfolgreich gesendet')
   else:
      print(f'Fehler beim Senden der Nachricht: {response.status_code}')
      print(response.text)
