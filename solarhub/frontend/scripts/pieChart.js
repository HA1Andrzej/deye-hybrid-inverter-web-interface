import DOM from "./dom.js";

export default class PieChart {
   constructor() {
      this.container = DOM.create("div.pieChartContainer");
      this.centerIcon = DOM.create("div.centerIcon");
      this.pieChart = DOM.create("div.pieChart").append(this.centerIcon).appendTo(this.container);
      this.legendContainer = DOM.create("div.pieChartLegendContainer").appendTo(this.container);
   }
   setData(data) {
      const gradient = this.createConicGradient(data);
      this.pieChart.setStyle({ backgroundImage: gradient });
      this.legendContainer.setContent("");
      const sum = data.reduce((acc, elem) => acc + elem.value, 0);
      for (let elem of data) {
         const { r, g, b } = elem.color;
         const portion = Math.round((elem.value / sum) * 100);
         this.legendContainer.append(
            DOM.create("div.pieChartLegendElementContainer")
               .append(DOM.create("div.pieChartLegendCircle").setStyle({ backgroundColor: `rgb(${r}, ${g}, ${b})` }))
               .append(DOM.create("t.pieChartLegendText").setContent(`${elem.description}<t style='opacity: 0.26'>: ${portion}<t style='font-size: 80%'> %</t></t>`)),
         );
      }
   }
   createConicGradient(data) {
      const gradientParts = [];
      let cumulativePercent = 0;
      const sum = data.reduce((acc, elem) => acc + elem.value, 0);
      data.forEach((slice) => {
         const { value, color } = slice;
         const { r, g, b } = color;
         const startPercent = cumulativePercent * 100;
         cumulativePercent += value / sum;
         const endPercent = cumulativePercent * 100;
         gradientParts.push(`rgb(${r}, ${g}, ${b}) ${startPercent}% ${endPercent}%`);
      });
      const gradientString = `conic-gradient(${gradientParts.join(", ")})`;
      return gradientString;
   }
   setIcon(icon, waveColor, flipDirection) {
      this.centerIcon.setStyle({ backgroundImage: `url("/assets/images/${icon}")` });
      if (waveColor) {
         this.centerIcon.getFirstElement().style.setProperty("--waveColor", `rgba(${waveColor.r}, ${waveColor.g}, ${waveColor.b}, 0.3)`);
         this.centerIcon.getFirstElement().style.setProperty("--animationName", flipDirection ? "waveOut" : "waveIn");
      }
   }
}

// Styling
const style = document.createElement("style");
style.innerHTML = `
   .pieChartContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
   }
   .pieChartContainer .centerIcon {
      width: 25px;
      height: 25px;
      position: absolute;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
      display: flex;
      align-items: center;
      justify-content: center;
   }
   .pieChartContainer .centerIcon::before {
     content: '';
     position: absolute;
     border: 8px solid var(--waveColor);
     border-radius: 50%;
     transform: scale(0.5);
     animation: var(--animationName) 1.3s infinite ease-out;
     pointer-events: none;
     filter: blur(5px);
     z-index: 0;
   }
   @keyframes waveIn {
     0% {
      width: 150px;
      height: 150px;
      opacity: 0;
     }
     15% {
      opacity: 1;
     }
     100% {
      width: 30px;
      height: 30px;
      opacity: 0;
     }
   }
   @keyframes waveOut {
     0% {
      width: 30px;
      height: 30px;
      opacity: 1;
     }
     100% {
      width: 150px;
      height: 150px;
      opacity: 0;
     }
   }

   .pieChart {
      width: 160px;
      height: 160px;
      border-radius: 50%;
      background-color: red;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 25px 0px;
   }
   .pieChart::after {
      content: "";
      display: block;
      width: 50%;
      height: 50%;
      background-color: var(--themeColor);
      border-radius: 50%;
   }
   .pieChartLegendContainer {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
   }
   .pieChartLegendElementContainer {
      display: flex;
      align-items: center;
      justify-content: center;
   }
   .pieChartLegendCircle {
      width: 16px;
      height: 16px;
      border-radius: 50%;
      margin-right: 10px;
   }
`;
document.head.appendChild(style);
