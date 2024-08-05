import DOM from "./dom.js";
import { getLiveData, getPeakValues, predictBatteryRemainingTime, updateWifi } from "./com.js";
import { constants } from "./helper.js";
import StateBar from "./stateBar.js";

// Variables
const liveContainer = DOM.create("div.sideContainer#liveContainer");
const timeTextView = DOM.create("t#time");
const dateTextView = DOM.create("t#date");
const sunPowerBar = new StateBar();
const loadPowerBar = new StateBar();
const batterySocBar = new StateBar();
const gridPowerBar = new StateBar();

export async function build(mainContainer) {
   liveContainer.appendTo(mainContainer);
   DOM.create("div").setStyle({ flexGrow: 1 }).appendTo(liveContainer);
   buildWifiButton();

   DOM.create("div#dateTimeContainer").append(timeTextView).append(dateTextView).appendTo(liveContainer);
   DOM.create("div").setStyle({ flexGrow: 1 }).appendTo(liveContainer);

   sunPowerBar.setIcon("sun.png");
   sunPowerBar.setColor({ r: 255, g: 199, b: 0 });
   sunPowerBar.setUnit("Watt");
   sunPowerBar.container.appendTo(liveContainer);

   loadPowerBar.setIcon("house.png");
   loadPowerBar.setColor({ r: 96, g: 183, b: 255 });
   loadPowerBar.setUnit("Watt");
   loadPowerBar.container.appendTo(liveContainer);

   batterySocBar.setIcon("battery.png");
   batterySocBar.setColor({ r: 0, g: 210, b: 140 });
   batterySocBar.setUnit("%");
   batterySocBar.setMax(100);
   batterySocBar.container.appendTo(liveContainer);

   gridPowerBar.setUnit("Watt");
   gridPowerBar.container.appendTo(liveContainer);

   DOM.create("div").setStyle({ flexGrow: 2 }).appendTo(liveContainer);

   updateLiveData();
   setInterval(updateLiveData, 1000);
   updateMaxValues();
   setInterval(updateMaxValues, 60 * 1000);
}

// Update Live Data & Time every Second
function updateLiveData() {
   getLiveData().then((data) => {
      if (!data) return;
      const serverTime = new Date(data.timestamp);
      const hours = String(serverTime.getHours()).padStart(2, "0");
      const minutes = String(serverTime.getMinutes()).padStart(2, "0");
      const day = String(serverTime.getDate()).padStart(2, "0");
      const month = serverTime.toLocaleString("default", { month: "long" });
      const year = serverTime.getFullYear();
      timeTextView.setText(`${hours}:${minutes}`);
      dateTextView.setText(`${day}. ${month} ${year}`);

      sunPowerBar.setValue(data.p_sun);
      loadPowerBar.setValue(data.p_inverter);
      batterySocBar.setValue(data.batt_soc);
      if (data.batt_soc >= constants.batteryMaxSoC * 100) {
         batterySocBar.setInfoText("Batterie voll");
      } else {
         const power = -data.p_batt;
         const powerString = (power > 0 ? "+" : "") + power.toLocaleString("de-DE");
         predictBatteryRemainingTime(data.batt_soc).then((prediction) => {
            if (Math.abs(prediction.averagePower) <= 15) {
               batterySocBar.setInfoText(`${powerString} Watt`);
               return;
            }
            const timePredString = `${prediction.hours}:${prediction.minutes.toString().padStart(2, "0")} Std. bis ${prediction.charging ? "voll" : "leer"}`;
            batterySocBar.setInfoText(`${powerString} Watt ➜ ${timePredString}`);
         });
      }
      gridPowerBar.setValue(Math.abs(data.p_grid));
      if (data.p_grid <= 0) {
         gridPowerBar.setIcon("gridIn.png");
         gridPowerBar.setColor({ r: 0, g: 176, b: 155 });
         gridPowerBar.setInfoText(`+${constants.earningsPerKwh.toString().replace(".", ",")} € / kWh`);
      } else {
         gridPowerBar.setIcon("gridOut.png");
         gridPowerBar.setColor({ r: 255, g: 44, b: 133 });
         gridPowerBar.setInfoText(`-${constants.costPerKwh.toString().replace(".", ",")} € / kWh`);
      }
   });
}

// Update all Values that don't need to be updated every second.
function updateMaxValues() {
   const end = Date.now();
   const start = end - 7 * 24 * 60 * 60 * 1000;
   let maxSunPower, maxLoadPower;
   getPeakValues("p_sun", start, end).then((res) => {
      maxSunPower = Math.round(res.val);
      sunPowerBar.setInfoText(`Max. ${maxSunPower.toLocaleString("de-DE")} Watt`);
   });
   getPeakValues("p_load", start, end).then((res) => {
      maxLoadPower = Math.round(res.val);
      loadPowerBar.setInfoText(`Max. ${maxLoadPower.toLocaleString("de-DE")} Watt`);
   });
   const interval = setInterval(() => {
      if (maxSunPower == undefined || maxLoadPower == undefined) return;
      clearInterval(interval);
      const peakPower = Math.max(maxSunPower, maxLoadPower);
      sunPowerBar.setMax(peakPower);
      loadPowerBar.setMax(peakPower);
      gridPowerBar.setMax(peakPower);
   }, 50);
}

// Builds the Wifi button
function buildWifiButton() {
   DOM.create("div#wifiButton")
      .appendTo(liveContainer)
      .onClick(() => {
         const ssid = prompt("SSID des neuen Netzwerks eingeben:");
         if (ssid === null) return;
         const password = prompt(`Passwort für ${ssid} eingeben:`);
         if (password === null) return;
         let userConfirmed = confirm(`Sicher, dass das Netzwerk zu ${ssid} (${password}) geändert werden soll? Das bisherige Netzwerk funktioniert dann nicht mehr.`);
         if (userConfirmed) {
            updateWifi(ssid, password).then((res) => {
               if (res) {
                  window.alert("WLAN erfolgreich aktualisiert. Die Änderung könnte einige Sekunden in Anspruch nehmen.");
               } else {
                  window.alert("Ein Problem ist aufgetreten. Bitte versuche es erneut.");
               }
            });
         } else {
            window.alert("Abgebrochen. Altes Netzwerk wird beibehalten.");
         }
      });
}
