import { constants } from "./helper.js";

export async function getWifiNetworks() {
   const res = await communicateWithServer("getWifiNetworks", JSON.stringify([]));
   return JSON.parse(res).data;
}

export async function updateWifi(ssid, password, staticIp) {
   const data = { ssid: ssid, password: password, staticip: staticIp };
   const res = await communicateWithServer("updateWifi", JSON.stringify(data));
   console.log(JSON.parse(res));
   return JSON.parse(res).success;
}

export async function getConfig() {
   const res = await communicateWithServer("getConfig", JSON.stringify([]));
   return JSON.parse(res).data;
}

export async function getLiveData() {
   const query = "SELECT * FROM live";
   const res = await communicateWithServer("dbQuery", query);
   const data = JSON.parse(res);
   return data[0];
}

export async function getPeakValues(param = "p_sun", start, end) {
   const query = `
      SELECT
          ${param} AS val,
          timestamp
      FROM
          logs
      WHERE
          timestamp BETWEEN ${start} AND ${end}
      ORDER BY
          ${param} DESC
      LIMIT 1;
   `;
   const res = await communicateWithServer("dbQuery", query);
   const data = JSON.parse(res);
   return data[0];
}

export async function predictBatteryRemainingTime(soc, minutes = 7) {
   const end = Date.now();
   const start = end - minutes * 60 * 1000;
   const data = await getRawData(start, end, end - start);
   const averagePower = -data[0].p_batt;
   const remainingSoC = (averagePower < 0 ? constants.battery.dischargeLimit.soc : constants.battery.chargeLimit.soc) - soc / 100;
   const remainingTime = Math.abs((constants.battery.capactiy * remainingSoC) / averagePower);
   const hoursRemaining = Math.floor(remainingTime);
   const minutesRemaining = Math.floor((remainingTime - hoursRemaining) * 60);
   return {
      hours: hoursRemaining,
      minutes: minutesRemaining,
      charging: averagePower > 0,
      averagePower: averagePower,
   };
}

export async function getOldestTimestamp() {
   const query = `
      SELECT
         MIN(timestamp) AS oldest_timestamp
      FROM
         logs
   `;
   const res = await communicateWithServer("dbQuery", query);
   const data = JSON.parse(res);
   return data[0].oldest_timestamp;
}

export async function getRawData(from, to, blockLength) {
   blockLength = Math.round(blockLength);
   if (blockLength == undefined || blockLength < 1) blockLength = 1;
   const query = `
      SELECT
         MIN(timestamp) AS timestamp_start,
         MAX(timestamp) AS timestamp_end,
         AVG(batt_soc) AS batt_soc,
         AVG(p_sun) AS p_sun,
         AVG(p_load) AS p_load,
         AVG(p_losses) AS p_losses,
         AVG(p_grid) AS p_grid,
         AVG(p_inverter) AS p_inverter,
         AVG(p_batt) AS p_batt
      FROM
         logs
      WHERE
         timestamp BETWEEN ${from} AND ${to}
      GROUP BY
         FLOOR((timestamp - ${from}) / ${blockLength})
      ORDER BY
         timestamp_start
   `;
   const res = await communicateWithServer("dbQuery", query);
   const data = JSON.parse(res);
   return data;
}

// Sends Data to the Backend and returns the answer
async function communicateWithServer(action, data) {
   return new Promise(async (resolve, _) => {
      let response = await fetch(action, {
         method: "POST",
         body: data,
      });
      let obj = response.ok ? await response.json() : [];
      resolve(obj.answer);
   });
}
