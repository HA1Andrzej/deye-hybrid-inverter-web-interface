import os
import subprocess
import re
import time
from shutil import copy2
from datetime import UTC, datetime

BACKUP_INTERVAL = 1*60*60 # Hourly
MIN_FREE_SPACE_MB = 1000

def start():
   mountPoint = "/mnt/backupusb/"
   while not mountUsbStick(mountPoint):
      print('Mounting failed, retrying in 10 seconds...')
      time.sleep(10)

   backupPath = os.path.join(mountPoint, 'dbBackups')
   if not os.path.exists(backupPath): os.makedirs(backupPath)
   while True:
      backupDB(backupPath)
      time.sleep(BACKUP_INTERVAL)

# Backups the DataBase to the specified folder
def backupDB(backupPath):
   if not os.path.exists(backupPath): return False
   backup_date = datetime.now(UTC).strftime('%Y-%m-%d')
   try:
      copy2('database.db', os.path.join(backupPath, f'database_{backup_date}.db'))
      if os.path.exists('database.db-wal'):
         copy2('database.db-wal', os.path.join(backupPath, f'database_{backup_date}.db-wal'))
   except Exception as e:
      print(f"Fehler beim Backup: {e}")
      return False
   # Delete Oldest Files until enough space is free
   while getFreeSpace(backupPath) < MIN_FREE_SPACE_MB:
      files = [os.path.join(backupPath, f) for f in os.listdir(backupPath) if os.path.isfile(os.path.join(backupPath, f))]
      if not files: break
      oldest_file = min(files, key=os.path.getmtime)
      os.remove(oldest_file)
      print(f"Deleted {oldest_file} to free up space.")

def getFreeSpace(path):
   result = subprocess.run(['df', path], stdout=subprocess.PIPE)
   output = result.stdout.decode('utf-8')
   lines = output.splitlines()
   data_line = lines[1]
   columns = data_line.split()
   free_space_kb = int(columns[3])
   return int(free_space_kb / 1024)

# Mount USB Stick
def mountUsbStick(mount_point):
   cmd = "lsblk -l -o NAME,RM,SIZE,TYPE,MOUNTPOINT | grep ' 1 ' | grep -E 'part\s*$' | awk '{print $1}'"
   result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
   partitions = result.stdout.strip().split('\n') if result.stdout else None
   print(partitions)
   if partitions:
      print(partitions[0])
      partition_path = f"/dev/{partitions[0]}"
      res = subprocess.run(f"sudo mount {partition_path} {mount_point}", shell=True)
      if res.returncode == 0:
         print(f"Partition {partition_path} erfolgreich auf {mount_point} gemountet.")
         return True
      else:
         print(f"Fehler beim Mounten von {partition_path} auf {mount_point}.")
   else:
      print("Keine ungemountete USB-Partition gefunden.")
   return False
