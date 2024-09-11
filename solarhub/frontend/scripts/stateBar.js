import DOM from "./dom.js";

export default class StateBar {
   constructor() {
      this.max = 100;
      this.iconModeEnabled = false;
      this.container = DOM.create("div.stateBarContainer");
      this.iconTextContainer = DOM.create("div.stateBarIconTextContainer").appendTo(this.container);
      this.icon = DOM.create("img.stateBarIcon").appendTo(this.iconTextContainer);
      this.textContainer = DOM.create("div.stateBarTextContainer").appendTo(this.iconTextContainer);
      this.value = DOM.create("t.stateBarValue").setText("0");
      this.unit = DOM.create("t.stateBarUnit");
      this.valueUnitContainer = DOM.create("div").append(this.value).append(this.unit).appendTo(this.textContainer);
      this.spacer = DOM.create("div").setStyle({ flexGrow: "1" }).appendTo(this.textContainer);
      this.infoText = DOM.create("t.stateBarInfoText").appendTo(this.textContainer);
      this.barOuter = DOM.create("div.stateBarOuter").appendTo(this.container);
      this.barInner = DOM.create("div.stateBarInner").appendTo(this.container);
   }
   center() {
      this.container.setStyle({ alignItems: "center" });
      this.icon.setStyle({ display: "none" });
      this.textContainer.setStyle({ flexDirection: "column" });
      this.infoText.setStyle({ margin: "0px" });
   }
   flip() {
      this.container.setStyle({ marginTop: "-20px" });
      this.container.append(this.textContainer.setContent("").append(this.infoText).append(this.valueUnitContainer));
      this.infoText.setStyle({ marginTop: "8px", marginBottom: "3px" });
   }
   iconMode() {
      this.iconModeEnabled = true;
      this.container.append(this.textContainer);
      this.iconTextContainer.setStyle({ marginBottom: "-5px" });
      this.textContainer.setStyle({ marginTop: "10px" });
   }
   setVisibility(visible) {
      this.container.setStyle({ display: visible ? "" : "none" });
   }
   setIcon(icon) {
      this.icon.attr({
         src: "/assets/images/" + icon,
      });
   }
   setColor(color) {
      this.barOuter.setStyle({
         backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 0.15)`,
      });
      this.barInner.setStyle({
         backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, 1)`,
         boxShadow: `0px 5px 20px rgba(${color.r}, ${color.g}, ${color.b}, 0.3)`,
      });
   }
   setUnit(unit) {
      this.unit.setText(unit);
   }
   setInfoText(text) {
      this.infoText.setText(text);
   }
   setMax(val) {
      this.maxValue = val;
   }
   getMax() {
      return this.maxValue;
   }
   setValue(val) {
      const ratio = Math.min((val / this.maxValue) * 100, 100);
      this.barInner.setStyle({
         width: ratio + "%",
      });
      if (this.iconModeEnabled) {
         this.icon.setStyle({
            marginLeft: `clamp(0px, calc(${ratio}% - 18px), calc(100% - 25px))`,
         });
      }
      this.setValueText((Math.round(val * 1000) / 1000).toLocaleString("de-DE"));
   }
   setValueText(text) {
      this.value.setText(text);
   }
}

// Styling
const style = document.createElement("style");
style.innerHTML = `
   .stateBarContainer {
      width: 100%;
      max-width: 550px;
      margin: 25px 0px;
      transition: 0.3s;
      display: flex;
      flex-direction: column;
   }

   .stateBarIconTextContainer {
      display: flex;
      align-items: center;
   }

   .stateBarTextContainer {
      width: 100%;
      display: flex;
      align-items: center;
   }

   .stateBarIcon {
      width: 25px;
      height: 25px;
      margin-right: 15px;
      object-fit: contain;
   }

   .stateBarValue {
      font-family: boldest;
      font-size: 130%;
   }

   .stateBarUnit {
      opacity: 0.26;
      margin-left: 7px;
      font-family: bold;
      margin-bottom: -5px;
      font-size: 90%;
   }

   .stateBarInfoText {
      float: right;
      margin-right: 15px;
      opacity: 0.26;
      margin-bottom: -5px;
      text-align: right;
      font-size: 90%;
   }

   .stateBarOuter {
      width: 100%;
      height: 10px;
      border-radius: 30px;
      margin-top: 15px;
      box-sizing: border-box;
   }

   .stateBarInner {
      width: 0%;
      height: 20px;
      min-width: 0px;
      margin-top: -15px;
      border-radius: 30px;
      transition: 0.3s;
   }
`;
document.head.appendChild(style);
