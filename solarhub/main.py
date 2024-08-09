import subprocess
import threading
import server
import logger
import wifiManager
import backupManager

# Disable Low Power Mode of the RPI's Wifi Module for better reliability
subprocess.run(['sudo', 'iwconfig', 'wlan0', 'power', 'off'])

# Start Server and Logger
threading.Thread(target=server.start).start()
threading.Thread(target=logger.start).start()
threading.Thread(target=wifiManager.start).start()
threading.Thread(target=backupManager.start).start()
