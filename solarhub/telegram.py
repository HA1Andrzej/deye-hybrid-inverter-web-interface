import requests
import json
import helper

def sendTelegramMessage(message, pin=False, silent=False):
   config = helper.getConfig()
   if not config["telegram"]["enabled"]:
      return

   url = f'https://api.telegram.org/bot{config["telegram"]["botToken"]}/sendMessage'
   payload = {
      'chat_id': config["telegram"]["channelId"],
      'text': message,
      'disable_notification': silent  # Silent senden, wenn gewünscht
   }
   try:
      response = requests.post(url, data=payload, timeout=5)
      if response.status_code == 200:
         print('Nachricht erfolgreich gesendet')
         response_data = response.json()
         message_id = response_data.get("result", {}).get("message_id")

         if pin and message_id:
            pin_url = f'https://api.telegram.org/bot{config["telegram"]["botToken"]}/pinChatMessage'
            pin_payload = {
               'chat_id': config["telegram"]["channelId"],
               'message_id': message_id,
               'disable_notification': True  # Silent Pinning
            }
            pin_response = requests.post(pin_url, data=pin_payload, timeout=5)
            if pin_response.status_code == 200:
               print('Nachricht erfolgreich (silent) angepinnt')
            else:
               print(f'Fehler beim Anpinnen der Nachricht: {pin_response.status_code}')
               print(pin_response.text)
      else:
         print(f'Fehler beim Senden der Nachricht: {response.status_code}')
         print(response.text)
   except requests.exceptions.RequestException as e:
      print(f"Exception occurred while sending Telegram message: {e}")
