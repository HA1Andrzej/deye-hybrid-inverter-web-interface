import DOM from "./dom.js";

export default class LineGraph {
   constructor() {
      this.values = [];
      this.container = DOM.create("div.lineGraphContainer");
      this.subTitleText = DOM.create("t.subTitle").setStyle({ marginBottom: "0px" }).appendTo(this.container);
      this.titleText = DOM.create("t.bigTitle").setText("Daten werden geladen...").appendTo(this.container);
      this.canvas = DOM.create("canvas.lineGraphCanvas").appendTo(this.container);
      this.tickLineContainer = DOM.create("div.lineGraphTickLineContainer").appendTo(this.container);
      this.labelContainer = DOM.create("div.lineGraphLabelContainer").appendTo(this.container);

      const sumContainer = DOM.create("div#sumContainer").appendTo(this.container);
      DOM.create("img.icon [src=/assets/images/sun.png]").appendTo(sumContainer);
      this.sunEnergyValueText = DOM.create("t.value").appendTo(sumContainer);
      this.sunEnergyUnitText = DOM.create("t.unit").appendTo(sumContainer);
      DOM.create("div").setStyle({ width: "20px" }).appendTo(sumContainer);
      DOM.create("img.icon [src=/assets/images/house.png]").appendTo(sumContainer);
      this.houseEnergyValueText = DOM.create("t.value").appendTo(sumContainer);
      this.houseEnergyUnitText = DOM.create("t.unit").appendTo(sumContainer);

      // Graph Hovering
      this.mouseX = undefined;
      const canvas = this.canvas.getFirstElement();
      canvas.addEventListener("mousemove", (event) => {
         const rect = canvas.getBoundingClientRect();
         this.mouseX = event.clientX - rect.left;
         this.draw();
      });
      canvas.addEventListener("mouseleave", () => {
         this.mouseX = undefined;
         this.draw();
      });
      canvas.addEventListener("touchmove", (event) => {
         const rect = canvas.getBoundingClientRect();
         this.mouseX = event.touches[0].clientX - rect.left;
         this.draw();
      });
      canvas.addEventListener("touchend", () => {
         this.mouseX = undefined;
         this.draw();
      });
   }
   setTitle(title) {
      this.title = title;
      this.titleText.setText(this.title);
   }
   setSubTitle(subTitle) {
      this.subTitle = subTitle;
      this.subTitleText.setText(subTitle);
   }
   setLabels(labels) {
      const containerWidth = this.labelContainer.getFirstElement().clientWidth;
      let labelFontSize = containerWidth / labels.length / 2;
      if (labelFontSize < 10) labelFontSize = 10;
      if (labelFontSize > 18) labelFontSize = 18;
      this.labelContainer.setContent("");
      for (let label of labels) {
         DOM.create("t.lineGraphLabel")
            .append(
               DOM.create("span")
                  .setStyle({
                     fontSize: labelFontSize + "px",
                  })
                  .setContent(label),
            )
            .appendTo(this.labelContainer);
      }

      this.tickLineContainer.setContent("");
      for (let i = 0; i < labels.length + 1; i++) {
         DOM.create("t.lineGraphTickLine").appendTo(this.tickLineContainer);
      }
   }
   setEnergyValues(sunEnergy, houseEnergy) {
      this.sunEnergy = sunEnergy;
      this.houseEnergy = houseEnergy;
   }
   draw() {
      const canvas = this.canvas.getFirstElement();
      let height = canvas.clientHeight;
      let width = canvas.clientWidth;
      let ctx = canvas.getContext("2d");
      let pixelFactor = window.devicePixelRatio;
      canvas.setAttribute("height", height * pixelFactor);
      canvas.setAttribute("width", width * pixelFactor);
      ctx.scale(pixelFactor, pixelFactor);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.lineWidth = 3;
      ctx.clearRect(0, 0, width, height);

      const maxValue = Math.max(...this.values.flatMap((obj) => Object.values(obj).filter((val) => val !== undefined)));
      const scalingFactor = height / maxValue;
      const step = width / (this.values.length - 1);

      const drawCurve = (key, fallbackKey, color) => {
         let pathStartX = 0,
            prevFallbackMode = false;
         this.values.forEach((_, index) => {
            let currentValue = this.values[index][key];
            let prevValue = this.values[index - 1]?.[key];
            let nextValue = this.values[index + 1]?.[key];

            const fallbackMode = currentValue === undefined;
            if (fallbackMode) {
               return; // Disable non-working Fallback for now
               currentValue = this.values[index][fallbackKey];
               prevValue = this.values[index - 1]?.[fallbackKey];
               nextValue = this.values[index + 1]?.[fallbackKey];
            }

            const startNewPath = !prevValue || (fallbackMode && !prevFallbackMode);
            const endPath = !nextValue || (!fallbackMode && prevFallbackMode);
            prevFallbackMode = fallbackMode;

            if (!currentValue) return;
            const x = index * step;
            const y = height - currentValue * scalingFactor;

            if (startNewPath) {
               console.log("START PATHHHH", prevValue, fallbackMode, prevFallbackMode);
               ctx.beginPath();
               const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
               gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${fallbackMode ? color.a / 4 : color.a / 2.5}`);
               gradient.addColorStop(0.6, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
               ctx.fillStyle = gradient;
               ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${fallbackMode ? 0.4 : 1})`;
               pathStartX = x;
               ctx.moveTo(x, y);
               return;
            }
            if (endPath) {
               console.log("END PATHHHH");
               ctx.lineTo(x, y);
               ctx.stroke();
               ctx.lineTo(x, height);
               ctx.lineTo(pathStartX, height);
               ctx.fill();
               return;
            }
            const nextX = (index + 1) * step;
            const nextY = height - nextValue * scalingFactor;
            const cpx = (x + nextX) / 2;
            const cpy = (y + nextY) / 2;
            ctx.quadraticCurveTo(x, y, cpx, cpy);
         });

         // Draw Hover
         if (this.mouseX !== undefined) {
            ctx.beginPath();
            ctx.lineWidth = "3";
            const textColor = getComputedStyle(document.documentElement).getPropertyValue("--textColor");
            ctx.strokeStyle = textColor.trim();
            ctx.moveTo(this.mouseX, 0);
            ctx.lineTo(this.mouseX, height);
            ctx.stroke();

            const index = Math.round(this.mouseX / step);
            const elem = this.values[index];
            const val = Math.max(Math.round(elem[key] || 0), 0);
            if (key == "a") this.sunEnergyValueText.setText(val);
            if (key == "b") this.houseEnergyValueText.setText(val);
            this.sunEnergyUnitText.setText("Watt");
            this.houseEnergyUnitText.setText("Watt");
         } else {
            this.sunEnergyValueText.setText((this.sunEnergy / 1000).toThreeDecimalString());
            this.sunEnergyUnitText.setText("kWh");
            this.houseEnergyValueText.setText((this.houseEnergy / 1000).toThreeDecimalString());
            this.houseEnergyUnitText.setText("kWh");
         }
      };

      //drawCurve("c", "c_fallback", { r: 0, g: 210, b: 140, a: 0 });
      drawCurve("a", "a_fallback", { r: 255, g: 199, b: 0, a: 1 });
      drawCurve("b", "b_fallback", { r: 96, g: 183, b: 255, a: 1 });
   }
}

// Styling
const style = document.createElement("style");
style.innerHTML = `
   .lineGraphContainer {
      margin-top: 40px;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
   }

   .lineGraphSubTitle {
      margin-top: 3px;
      opacity: 0.26;
   }

   .lineGraphCanvas {
      width: 100%;
      height: 230px;
      margin-top: 0px;
      border-radius: 8px;
   }

   .lineGraphTickLineContainer {
      width: 100%;
      height: 10px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      border-top: 3px solid rgba(0, 0, 0, 0.08);
      border-top-left-radius: 3px;
      border-top-right-radius: 3px;
      justify-content: space-between;
   }

   .lineGraphTickLine {
      width: 3px;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.08);
      border-bottom-left-radius: 5px;
      border-bottom-right-radius: 5px;
   }

   .lineGraphLabelContainer {
      width: 100%;
      height: 30px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      padding: 0px;
      margin: 0px;
      margin-top: -12px;
      justify-content: space-around;
   }

   .lineGraphLabel {
      width: 10px;
      position: relative;
   }
   .lineGraphLabel span {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      opacity: 0.26;
      font-size: 75%;
      white-space: nowrap;
      text-align: center;
      margin-top: -10px;
   }
   #sumContainer {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 20px;
      margin-bottom: 60px;
   }
`;
document.head.appendChild(style);
