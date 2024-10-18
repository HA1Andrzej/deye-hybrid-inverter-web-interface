import { getConfig } from "./com.js";

// Constants
export let constants = {};
getConfig().then((res) => {
   constants = res;
   console.log(constants);
});

// Better mod function accounting for negative numbers correctly
export function mod(n, m) {
   return ((n % m) + m) % m;
}

// Get Week number (Kalenderwoche)
export function getWeekNumber(date) {
   date = new Date(typeof date === "number" ? date : date.getTime());
   date.setHours(0, 0, 0, 0);
   date.setDate(date.getDate() + 3 - ((date.getDay() + 6) % 7));
   const week1 = new Date(date.getFullYear(), 0, 4);
   const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
   return weekNumber;
}

// Formats a Number to a Euro String (0,7 -> "0,70 €")
Number.prototype.toEuroString = function () {
   let res = (Math.round(this * 100) / 100).toString();
   if (!res.includes(".")) {
      res += ",00";
   } else {
      const decimalPart = res.split(".")[1];
      if (decimalPart.length === 1) {
         res += "0";
      }
   }
   return res.replace(".", ",") + " €";
};

// Formats a Number to a String (726,4 -> "726,400")
Number.prototype.toThreeDecimalString = function () {
   let res = (Math.round(this * 1000) / 1000).toString();
   if (!res.includes(".")) {
      res += ",000";
   } else {
      const decimalPart = res.split(".")[1];
      if (decimalPart.length === 1) res += "00";
      if (decimalPart.length === 2) res += "0";
   }
   return res.replace(".", ",");
};

// Formats a Number to a String (726,4 -> "726,40")
Number.prototype.toTwoDecimalString = function (decimalCutoffThreshold) {
   if (decimalCutoffThreshold && this >= decimalCutoffThreshold) {
      return Math.round(this).toLocaleString("de-DE");
   }
   let res = (Math.round(this * 100) / 100).toString();
   if (!res.includes(".")) {
      res += ",00";
   } else {
      const decimalPart = res.split(".")[1];
      if (decimalPart.length === 1) res += "0";
   }
   return res.replace(".", ",");
};

export function setDateTimeFromUnix(unixTimestamp) {
   // Erstelle ein Datum basierend auf dem Unix-Timestamp
   const date = new Date(unixTimestamp);

   // Erstelle das Format YYYY-MM-DDTHH:MM
   const year = date.getFullYear();
   const month = String(date.getMonth() + 1).padStart(2, "0"); // Monate von 0-11, daher +1
   const day = String(date.getDate()).padStart(2, "0");
   const hours = String(date.getHours()).padStart(2, "0");
   const minutes = String(date.getMinutes()).padStart(2, "0");

   // Formatiere das Datum wie von "datetime-local" erwartet
   return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Sets the Status Bar and Tab Bar Color of Safari
export function setSafariUIColor(color) {
   let themeMetaTag = document.querySelector('meta[name="theme-color"]');
   let statusBarMetaTag = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
   if (!themeMetaTag) {
      themeMetaTag = document.createElement("meta");
      themeMetaTag.name = "theme-color";
      document.head.appendChild(themeMetaTag);
   }
   if (!statusBarMetaTag) {
      statusBarMetaTag = document.createElement("meta");
      statusBarMetaTag.name = "apple-mobile-web-app-status-bar-style";
      document.head.appendChild(statusBarMetaTag);
   }
   themeMetaTag.content = color;
   statusBarMetaTag.content = color;
   document.body.style.backgroundColor = color;
}

// Checks if Darkmode is enabled
export function isDarkMode() {
   return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
