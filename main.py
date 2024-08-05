import subprocess
import threading
import server
import logger
import wifi

# Disable Low Power Mode of the RPI's Wifi Module
subprocess.run(['sudo', 'iwconfig', 'wlan0', 'power', 'off'])

# Start Server and Logger
threading.Thread(target=server.startServer).start()
threading.Thread(target=logger.startLogging).start()
threading.Thread(target=wifi.startWatchdog).start()
