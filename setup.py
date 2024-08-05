import os
import subprocess

def main():
   install()
   wifiAp()
   autostart()

def install():
   subprocess.run(['sudo', 'apt-get', 'update'])
   subprocess.run(['sudo', 'apt-get', 'install', '-y', 'python3-pymodbus', 'hostapd', 'dnsmasq'])

def autostart():
   with open('/etc/rc.local', 'r+') as file:
      lines = file.readlines()
      for i, line in enumerate(lines):
         if line.strip() == 'exit 0':
            lines.insert(i, 'cd /home/merlin/pvschulz && sudo python3 main.py &\n')
            break
      file.seek(0)
      file.writelines(lines)

def wifiAp():
   print("...")
   # ...

if __name__ == "__main__":
    main()
