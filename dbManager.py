import sqlite3
import json

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
