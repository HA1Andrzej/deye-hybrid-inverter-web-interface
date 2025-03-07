import json

def merge_dicts(base, override):
   for key, value in override.items():
      if isinstance(value, dict) and key in base and isinstance(base[key], dict):
         merge_dicts(base[key], value)
      else:
         base[key] = value

def getConfig(withSecrets=True):
   with open('config.json', 'r') as file:
      config = json.load(file)

   if withSecrets:
      try:
         with open('secrets.json', 'r') as file:
            secrets = json.load(file)
         merge_dicts(config, secrets)
      except FileNotFoundError:
         print("Warnung: secrets.json nicht gefunden. Nutze nur config.json.")

   return config
