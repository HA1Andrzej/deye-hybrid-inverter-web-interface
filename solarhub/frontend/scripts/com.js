import { constants } from "./helper.js";

export async function getWifiNetworks() {
   return await apiCall("/api/networks", true);
}

export async function getConfig() {
   const config = await apiCall("/api/config", true);
   console.log(config);
   return config;
}

export async function getLiveData() {
   const res = await apiCall("/api/live/raw", true);
   return res[0];
}

export async function getHistoricalData(start, end, blockLength) {
   blockLength = Math.round(blockLength);
   if (blockLength == undefined || blockLength < 1) blockLength = 1;
   const url = `/api/historical/raw?start=${start}&end=${end}&blockLength=${blockLength}`;
   const res = await apiCall(url, true);
   return res;
}

// Returns the Peak Value including Timestamp
export async function getPeakValues(key = "p_sun", start, end) {
   const url = `/api/historical/peak?start=${start}&end=${end}&key=${key}`;
   const res = await apiCall(url, true);
   return res;
}

// Returns the timestamp of the oldest data
export async function getOldestTimestamp() {
   const url = `/api/historical/oldest`;
   const res = await apiCall(url, true);
   return res.timestamp;
}

// Makes an API (Get) Call
async function apiCall(name, isJson = false) {
   const res = await fetch(name);
   let data = await res.text();
   if (isJson) data = JSON.parse(data);
   return data;
}

export async function predictBatteryRemainingTime(soc, minutes = 7) {
   const end = Date.now();
   const start = end - minutes * 60 * 1000;
   const data = await getHistoricalData(start, end, end - start);
   const averagePower = -data[0].p_batt;
   const remainingSoC = (averagePower < 0 ? constants.battery.discharge.limit : constants.battery.charge.limit) - soc / 100;
   const remainingTime = Math.abs((constants.battery.capacity * remainingSoC) / averagePower);
   const hoursRemaining = Math.floor(remainingTime);
   const minutesRemaining = Math.floor((remainingTime - hoursRemaining) * 60);
   return {
      hours: hoursRemaining,
      minutes: minutesRemaining,
      charging: averagePower > 0,
      averagePower: averagePower,
   };
}

export async function updateWifi(ssid, password, staticIp) {
   const data = { ssid: ssid, password: password, staticip: staticIp };
   const res = await postToServer("updateWifi", JSON.stringify(data));
   console.log(JSON.parse(res));
   return JSON.parse(res).success;
}

// Sends Data to the Backend and returns the answer
async function postToServer(action, data) {
   return new Promise(async (resolve, _) => {
      let response = await fetch(action, {
         method: "POST",
         body: data,
      });
      let obj = response.ok ? await response.json() : [];
      resolve(obj.answer);
   });
}
