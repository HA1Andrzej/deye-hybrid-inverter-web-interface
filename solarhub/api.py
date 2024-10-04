import dbManager
import json
import wifiManager

def request(path, params):
   liveDataJson = dbManager.query("SELECT * FROM live")
   liveData = json.loads(liveDataJson)

   # Live Data
   if path.startswith('live/'):
      action = path[len('live/'):]
      if action == "raw":
         return liveDataJson
      if action == "solar_power":
         return liveData[0]["p_sun"]
      if action == "load_power":
         return liveData[0]["p_load"]
      if action == "batt_soc":
         return liveData[0]["batt_soc"]
      if action == "summary":
         answer = "Die Solaranlage produziert gerade " + str(liveData[0]["p_sun"]) + " Watt, der Verbrauch liegt bei " + str(liveData[0]["p_load"]) + " Watt. Die Batterie ist zu " + str(liveData[0]["batt_soc"]) + " Prozent geladen."
         return answer

   # Historical Data
   if path.startswith('historical/'):
      action = path[len('historical/'):]
      if action == "raw":
         start = params.get("start", 0);
         end = params.get("end", 0);
         blockLength = params.get("blockLength", 0);
         queryString = f"""
            SELECT
              MIN(timestamp) AS timestamp_start,
              MAX(timestamp) AS timestamp_end,
              AVG(batt_soc) AS batt_soc,
              AVG(p_sun) AS p_sun,
              AVG(p_load) AS p_load,
              AVG(p_losses) AS p_losses,
              AVG(p_grid) AS p_grid,
              AVG(p_grid_import) AS p_grid_import,
              AVG(p_grid_export) AS p_grid_export,
              AVG(p_inverter) AS p_inverter,
              AVG(p_batt) AS p_batt
           FROM
              logs
           WHERE
              timestamp BETWEEN {start} AND {end}
           GROUP BY
              FLOOR((timestamp - {start}) / {blockLength})
           ORDER BY
              timestamp_start
         """
         data = dbManager.query(queryString)
         return data
      if action == "peak":
         start = params.get("start", 0);
         end = params.get("end", 0);
         key = params.get("key", 0);
         queryString = f"""
            SELECT
               {key} AS val,
               timestamp
            FROM
               logs
            WHERE
               timestamp BETWEEN {start} AND {end}
            ORDER BY
               {key} DESC
            LIMIT 1;
         """
         data = dbManager.query(queryString)
         return json.dumps(json.loads(data)[0])
      if action == "oldest":
         queryString = f"""
            SELECT *
               FROM logs
            ORDER BY timestamp ASC
            LIMIT 1;
         """
         data = dbManager.query(queryString)
         return json.dumps(json.loads(data)[0])



   # General Data
   if path == "config":
      with open('config.json', 'r') as config_file:
         config_data = json.load(config_file)
      return json.dumps(config_data)
   if path == "networks":
      networks = wifiManager.getAvailableNetworks()
      return json.dumps(networks)

   # Default Answer
   return ("Invalid API Request: " + path)
