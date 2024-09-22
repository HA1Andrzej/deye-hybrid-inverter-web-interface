from pymodbus.client import ModbusSerialClient
import sqlite3
import time
from telegram import sendTelegramMessage
import os
import dbManager
import json
import glob

def start():
   global cursor, conn, config, batteryLimits
   cursor, conn = dbManager.connect("database.db")
   connectToSerialUsbAdapter()

   from datetime import datetime

   # Removing Section of wrong data.
   print("Deleting Section...")
   start_time = int(datetime(2024, 9, 19, 11, 00).timestamp() * 1000)  # 21.09.2024 12:00 Uhr
   end_time = int(datetime(2024, 9, 19, 18, 30).timestamp() * 1000)  # 21.09.2024 18:00 Uhr
   cursor.execute("""
      UPDATE logs
      SET p_grid = 0, p_load = 0
      WHERE timestamp BETWEEN ? AND ?
   """, (start_time, end_time))
   conn.commit()
   print("Updated Section")



   # Reads data from config.json
   with open('config.json', 'r') as file:
      config = json.load(file)

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
      maxDischargeCurrent = 0 if batt_soc <= 100*config["battery"]["dischargeLimit"]["soc"] else config["battery"]["dischargeLimit"]["maxCurrent"]
      writeRegister(config["battery"]["dischargeLimit"]["register"], maxDischargeCurrent)
      maxChargeCurrent = 0 if batt_soc >= 100*config["battery"]["chargeLimit"]["soc"] else config["battery"]["chargeLimit"]["maxCurrent"]
      writeRegister(config["battery"]["chargeLimit"]["register"], maxChargeCurrent)

      # Save all changes and wait
      conn.commit()
      time.sleep(0.7)

# Connect to RS485-Adapter
def connectToSerialUsbAdapter():
   global client
   devices = glob.glob('/dev/ttyUSB*')
   if not devices: return False
   port = devices[0]
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
   registers = config["inverter"]["modbusRegisters"]
   for name in registers:
      address = registers[name]["address"]
      result = readRegister(address)
      if result is None or result.isError(): continue
      val = result.registers[0]
      if registers[name]["isTwosComplement"] and val > 32767: val -= 65536
      buffer[name] = val;
   buffer["timestamp"] = int(time.time()*1000)
   buffer["p_load"] = buffer.get("p_inverter", 0) + buffer.get("p_grid", 0);
   buffer["p_sun"] = buffer.get("p_string1", 0) + buffer.get("p_string2", 0) + buffer.get("p_gen", 0)
   buffer["p_losses"] = buffer.get("p_sun", 0) + buffer.get("p_batt", 0) + buffer.get("p_grid", 0) - buffer.get("p_load", 0)

# Check Data and send warning messages
notifications = {}
def checkAndWarn(buffer):
   global notifications
   batt_soc = buffer.get("batt_soc", 0)
   chargeSocLimit = 100*config["battery"]["chargeLimit"]["soc"]
   dischargeSocLimit = 100*config["battery"]["dischargeLimit"]["soc"]
   for threshold in [dischargeSocLimit+10, dischargeSocLimit+1]:
      if batt_soc <= threshold and not (notifications.get(f"battery{threshold}") or False):
         notifications[f"battery{threshold}"] = True
         sendTelegramMessage(f"⚠️ Batterie fast leer (Noch {batt_soc}%)")
      if batt_soc > threshold:
         notifications[f"battery{threshold}"] = False

   if batt_soc >= chargeSocLimit and not (notifications.get("batteryfull") or False):
      notifications["batteryfull"] = True
      sendTelegramMessage("🥳 Batterie voll")
   if batt_soc < chargeSocLimit - 10:
      notifications["batteryfull"] = False
   # ToDo: Anomalies ("Anomalie erkannt: "...)

# Reads the value of a register at the given address
def readRegister(address):
   try:
      result = client.read_holding_registers(address, 1, slave=0, timeout=0.5)
      return result
   except Exception as e:
      print(f"Exception occurred while reading register {address}: {e}")
      return None

# Writes the given value to the given register
registerCache = {}
def writeRegister(address, value, maxAttempts=5):
   global registerCache
   if registerCache.get(address) == value: return
   registerCache[address] = value
   attemptCounter = 0
   while attemptCounter < maxAttempts:
      try:
         result = client.write_registers(address, [value], slave=0, timeout=0.5)
         if not result.isError():
            print(f"Successfully wrote {value} to register {address}")
            break
      except Exception as e:
         print(f"Exception occurred while writing to register {address}: {e}")
      attemptCounter += 1
      time.sleep(0.1)
   else:
      print(f"Failed to write to register {address} after {maxAttempts} attempts.")


### End of File
