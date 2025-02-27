import os
import subprocess
import time
from solarhub import wifiManager

def installDependencies():
   subprocess.run(['sudo', 'apt-get', 'update'])
   subprocess.run(['sudo', 'apt-get', 'install', '-y', 'python3-pymodbus', 'hostapd', 'dnsmasq'])

def createService():
   script_path = os.path.abspath(__file__)
   backend_path = os.path.join(os.path.dirname(script_path), 'solarhub')

   service_content = f"""
   [Unit]
   Description=SolarHub
   After=multi-user.target

   [Service]
   Type=simple
   ExecStart=/usr/bin/python3 {os.path.join(backend_path, "main.py")}
   WorkingDirectory={backend_path}
   Restart=always
   User=root
   Environment=HOME=/root

   [Install]
   WantedBy=multi-user.target
   """

   try:
      with open("/etc/systemd/system/solarhub.service", 'w') as service_file:
         service_file.write(service_content)
      subprocess.run(["sudo", "systemctl", "daemon-reload"], check=True)
      subprocess.run(["sudo", "systemctl", "enable", "solarhub.service"], check=True)
      subprocess.run(["sudo", "systemctl", "start", "solarhub.service"], check=True)
      print(f"Service solarhub.service erfolgreich erstellt und gestartet.")
   except Exception as e:
      print(f"Fehler beim Erstellen oder Starten des Dienstes: {e}")

if __name__ == "__main__":
   installDependencies()
   createService()
   print("---------------------------------------")
   print(f"Done, your service is up now. Visit the interface by entering the IP-Adress (http://{wifiManager.getIpAddress()}) into a browser.")
