from pymodbus.client import ModbusSerialClient
import sqlite3
import time
from datetime import UTC, datetime
from telegram import sendTelegramMessage
import os
from shutil import copy2
import dbManager

###### Register Adresses for Deye Hybrid Inverter (48V-Series) ######
# Source 1: https://diysolarforum.com/threads/modbus-comms-with-deye-inverter.46197/
# Source 2: https://github.com/StephanJoubert/home_assistant_solarman/blob/main/custom_components/solarman/inverter_definitions/deye_sg04lp3.yaml
registers = {
   "p_ct_external": {"address": 619, "isTwosComplement": True},
   "batt_soc": {"address": 214, "isTwosComplement": False},
   "p_batt": {"address": 590, "isTwosComplement": True},
   "p_string1": {"address": 672, "isTwosComplement": False},
   "p_string2": {"address": 673, "isTwosComplement": False},
   "p_grid": {"address": 625, "isTwosComplement": True},
   "p_inverter": {"address": 636, "isTwosComplement": False},
   "p_gen": {"address": 667, "isTwosComplement": True},
}

# If you want to disable battery limits, just set the register addr to -1
batteryLimits = {
   "discharge": {"socLimit": 20, "register": 109, "enabledCurrent": 180, "disabledCurrent": 0},
   "charge": {"socLimit": 95, "register": 108, "enabledCurrent": 180, "disabledCurrent": 0}
}

def startLogging():
   global cursor, conn
   cursor, conn = dbManager.connect("database.db")
   connectToUsbAdapter("/dev/ttyUSB0")

   # Log Data roughly once per second
   liveValueBuffer = {}
   valueHistory = {}
   prevTime = time.time()
   while True:
      readLiveValues(liveValueBuffer)
      checkAndWarn(liveValueBuffer);

      # Append liveValues to valueHistory
      for key, value in liveValueBuffer.items():
         valueHistory.setdefault(key, []).append(value)

      # Save Live Data
      dbManager.emptyTable("live")
      dbManager.addRowToTable("live", liveValueBuffer)
      for key, value in liveValueBuffer.items():
         print(f"{key}: {value}")
      print("----------------")

      # Calculate averages & save historical data every minute
      currentTime = time.time()
      if currentTime - prevTime >= 60:
         prevTime = currentTime
         averages = {name: sum(valueHistory[name]) / len(valueHistory[name]) for name in valueHistory}
         valueHistory = {}
         dbManager.addRowToTable("logs", averages)

      # Limit Battery SoC
      batt_soc = liveValueBuffer.get("batt_soc", 0)
      maxDischargeCurrent = batteryLimits["discharge"]["disabledCurrent"] if batt_soc <= batteryLimits["discharge"]["socLimit"] else batteryLimits["discharge"]["enabledCurrent"]
      writeRegister(batteryLimits["discharge"]["register"], maxDischargeCurrent)
      maxChargeCurrent = batteryLimits["charge"]["disabledCurrent"] if batt_soc >= batteryLimits["charge"]["socLimit"] else batteryLimits["charge"]["enabledCurrent"]
      writeRegister(batteryLimits["charge"]["register"], maxChargeCurrent)

      # Backup DB, save all changes and wait
      backupDB()
      conn.commit()
      time.sleep(0.7)

# Connect to RS485-Adapter
def connectToUsbAdapter(port):
   global client
   client = ModbusSerialClient(method="rtu", port=port, baudrate=9600, timeout=1)
   while True:
      try:
         if client.connect():
            print("Modbus connection successful")
            return client
         else:
            print("Modbus connection failed, retrying in 1 second...")
      except Exception as e:
            print(f"Error during connection attempt: {e}, retrying in 1 second...")
      time.sleep(1)

# Read and Process Live Values
def readLiveValues(buffer):
   for name in registers:
      address = registers[name]["address"]
      result = readRegister(address)
      if not result.isError():
         val = result.registers[0]
         if registers[name]["isTwosComplement"] and val > 32767: val -= 65536
         buffer[name] = val;
   buffer["timestamp"] = int(time.time()*1000)
   buffer["p_load"] = buffer.get("p_inverter", 0) + buffer.get("p_grid", 0)
   buffer["p_sun"] = buffer.get("p_string1", 0) + buffer.get("p_string2", 0) + buffer.get("p_gen", 0)
   buffer["p_losses"] = buffer.get("p_sun", 0) + buffer.get("p_batt", 0) + buffer.get("p_grid", 0) - buffer.get("p_load", 0)

# Check Data and send warning messages
notifications = {}
def checkAndWarn(buffer):
   batt_soc = buffer.get("batt_soc", 0)
   chargeSocLimit = batteryLimits["charge"]["socLimit"]
   dischargeSocLimit = batteryLimits["discharge"]["socLimit"]
   for threshold in [dischargeSocLimit+10, dischargeSocLimit+1]:
      if batt_soc <= threshold and not (notifications.get(f"battery{threshold}") or False):
         notifications[f"battery{threshold}"] = True
         sendTelegramMessage(f"⚠️ Batterie fast leer (Noch {batt_soc}%)")
      if batt_soc > threshold:
         notifications[f"battery{threshold}"] = False

   if batt_soc == chargeSocLimit and not (notifications.get("batteryfull") or False):
      notifications["batteryfull"] = True
      sendTelegramMessage("🥳 Batterie voll")
   if batt_soc < chargeSocLimit - 10:
      notifications["batteryfull"] = False
   # ToDo: Anomalies ("Anomalie erkannt: "...)

# Backups the DataBase daily
def backupDB():
   backupFolder = 'dbBackups'
   if not os.path.exists(backupFolder): os.makedirs(backupFolder)
   newestFileAge = float('inf')
   oneMonthAgo = time.time() - 30 * 24 * 60 * 60
   for filename in os.listdir(backupFolder):
      file_path = os.path.join(backupFolder, filename)
      if os.path.isfile(file_path):
         file_age = time.time() - os.path.getmtime(file_path)
         if file_age < newestFileAge:
            newestFileAge = file_age
         if file_age > oneMonthAgo:
            os.remove(file_path)
   if newestFileAge > 86_400:
      backup_date = datetime.now(UTC).strftime('%Y-%m-%d')
      backup_file = os.path.join(backupFolder, f'database_{backup_date}.db')
      backup_wal_file = os.path.join(backupFolder, f'database_{backup_date}.db-wal')
      copy2('database.db', backup_file)
      copy2('database.db-wal', backup_wal_file)
      print("DB Backup Successfull")

# Reads the value of a register at the given address
def readRegister(address):
   return client.read_holding_registers(address, 1, slave=0, timeout=0.5)

# Writes the given value to the given register
registerCache = {}
def writeRegister(address, value, attemptCounter=0):
   if registerCache.get(address) == value: return
   registerCache[address] = value
   result = client.write_registers(address, [value], slave=0, timeout=0.5)
   if result.isError():
      print(f"Failed to write to register {address}, trying again (Attempt {attemptCounter+1})")
      time.sleep(0.1)
      if attemptCounter < 5: writeRegister(address, value, attemptCounter+1)
   else:
      print(f"Successfully wrote {value} to register {address}")

### End of File
