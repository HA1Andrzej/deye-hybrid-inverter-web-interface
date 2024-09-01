import DOM from "./dom.js";
import * as LiveView from "./liveView.js";
import * as StatsView from "./statsView.js";
import { setSafariUIColor, isDarkMode, mod } from "./helper.js";

// Variables
const mainContainer = DOM.select("mainContainer");
const loadingContainer = DOM.create("div#loadingContainer")
   .append(DOM.create("img#loadingImage [src=/assets/images/sun.png]"))
   .append(DOM.create("t#loadingText").setText("SolarHub"))
   .appendTo(mainContainer);
const divider = DOM.create("div#divider");
setTimeout(() => {
   loadingContainer.setStyle({ opacity: "0" });
}, 1400);
setTimeout(() => {
   LiveView.build(mainContainer);
   divider.appendTo(mainContainer);
   StatsView.build(mainContainer);
}, 400);

// Set Display Mode
// Mode 0 = default,
// Mode 1 = cards,
// Mode 2 = Broken iPad Screen Mode
let displayMode = JSON.parse(localStorage.getItem("displayMode")) ?? 0;
setTimeout(() => {
   setDisplayMode(displayMode);
   DOM.select("divider").onClick(() => {
      displayMode = mod(displayMode + 1, 3);
      setDisplayMode(displayMode);
      localStorage.setItem("displayMode", displayMode);
   });
}, 1000);
function setDisplayMode(mode) {
   if (mode == 0) {
      DOM.select("liveContainer").setStyle({ maxWidth: "" });
      divider.setStyle({
         backgroundColor: "",
         opacity: "",
         height: "",
         borderRadius: "",
         width: "",
      });
      setSafariUIColor(isDarkMode() ? "black" : "var(--themeColor)");
   }

   if (mode == 1) {
      divider.setStyle({
         backgroundColor: "black",
         width: "10px",
      });
      setSafariUIColor("#000000");
   }

   if (mode == 2) {
      DOM.select("liveContainer").setStyle({ maxWidth: "calc(50% - 175px)" });
      divider.setStyle({
         backgroundColor: "black",
         opacity: "1",
         height: "100vh",
         borderRadius: "0",
         width: "175px",
      });
      setSafariUIColor("#000000");
   }
}
