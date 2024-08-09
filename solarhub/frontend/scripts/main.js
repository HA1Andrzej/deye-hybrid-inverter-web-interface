import DOM from "./dom.js";
import * as LiveView from "./liveView.js";
import * as StatsView from "./statsView.js";
import { setSafariUIColor, isDarkMode } from "./helper.js";

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

// iPad View (Broken Screen)
let iPadViewEnabled = JSON.parse(localStorage.getItem("iPadViewEnabled")) ?? false;
setTimeout(() => {
   iPadView(iPadViewEnabled);
   DOM.select("divider").onClick(() => {
      iPadViewEnabled = !iPadViewEnabled;
      iPadView(iPadViewEnabled);
      localStorage.setItem("iPadViewEnabled", iPadViewEnabled);
   });
}, 1000);
function iPadView(enabled) {
   if (enabled) {
      DOM.select("liveContainer").setStyle({ maxWidth: "calc(50% - 175px)" });
      divider.setStyle({
         backgroundColor: "black",
         opacity: "1",
         height: "100vh",
         borderRadius: "0",
         width: "175px",
      });
      setSafariUIColor("#000000");
   } else {
      DOM.select("liveContainer").setStyle({ maxWidth: "" });
      divider.setStyle({
         backgroundColor: "",
         opacity: "",
         height: "",
         borderRadius: "",
         width: "",
      });
      setSafariUIColor(isDarkMode() ? "black" : "white");
   }
}
