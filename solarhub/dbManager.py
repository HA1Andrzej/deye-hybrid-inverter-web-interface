import sqlite3
import json

# Create and / or Connect to Database
def connect(path):
   global conn, cursor
   conn = sqlite3.connect(path)
   cursor = conn.cursor()
   #cursor.execute("VACUUM") # Bleibt manchmal unendlich lange hängen und blockiert alles andere
   cursor.execute("CREATE TABLE IF NOT EXISTS live (timestamp INTEGER)")
   cursor.execute("CREATE TABLE IF NOT EXISTS logs (timestamp INTEGER)")
   cursor.execute("CREATE INDEX IF NOT EXISTS idx_timestamp ON logs (timestamp)")
   conn.execute('PRAGMA journal_mode=WAL;')
   conn.commit()
   return cursor, conn

# Adds a new row of data to a given table
def addRowToTable(tableName, dict):
   columns = ", ".join(dict.keys())
   placeholders = ", ".join("?" * len(dict))
   values = list(dict.values())
   cursor.execute(f"PRAGMA table_info({tableName})")
   existing_columns = {info[1] for info in cursor.fetchall()}
   for key in dict.keys():
      if key not in existing_columns:
         cursor.execute(f"ALTER TABLE {tableName} ADD COLUMN {key} INTEGER DEFAULT 0")
   cursor.execute(f"INSERT INTO {tableName} ({columns}) VALUES ({placeholders})", values)

# Empties Table
def emptyTable(tableName):
   cursor.execute(f"DELETE FROM {tableName}")

# Query the Database
def query(queryString):
   conn = sqlite3.connect('database.db')
   cursor = conn.cursor()
   cursor.execute(queryString)
   rows = cursor.fetchall()

   if rows:
      columns = [description[0] for description in cursor.description]
      results = [dict(zip(columns, row)) for row in rows]
      conn.close()
      return json.dumps(results)
   else:
      conn.close()
      return json.dumps([])
