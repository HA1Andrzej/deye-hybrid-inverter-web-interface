import os
import subprocess
import wifi

def installDependencies():
   subprocess.run(['sudo', 'apt-get', 'update'])
   subprocess.run(['sudo', 'apt-get', 'install', '-y', 'python3-pymodbus', 'hostapd', 'dnsmasq'])

def createService():
   service_content = """
   [Unit]
   Description=PVSchulz
   After=multi-user.target

   [Service]
   Type=simple
   ExecStart=/usr/bin/python3 /home/merlin/pvschulz/main.py
   WorkingDirectory=/home/merlin/pvschulz/
   Restart=always
   User=root
   Environment=HOME=/root

   [Install]
   WantedBy=multi-user.target
   """

   try:
      with open("/etc/systemd/system/pvschulz.service", 'w') as service_file:
         service_file.write(service_content)
      subprocess.run(["sudo", "systemctl", "daemon-reload"], check=True)
      subprocess.run(["sudo", "systemctl", "enable", "pvschulz.service"], check=True)
      subprocess.run(["sudo", "systemctl", "start", "pvschulz.service"], check=True)
      print(f"Service pvschulz.service erfolgreich erstellt und gestartet.")
   except Exception as e:
      print(f"Fehler beim Erstellen oder Starten des Dienstes: {e}")

def setStaticIp():
   ip = input("Please enter your desired static IP address (e.g., 192.168.31.13): ")
   wifi.setStaticIp(ip)

if __name__ == "__main__":
   installDependencies()
   createService()
   setStaticIp()
