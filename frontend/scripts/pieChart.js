import DOM from "./dom.js";

export default class PieChart {
   constructor() {
      this.container = DOM.create("div.pieChartContainer");
      this.pieChart = DOM.create("div.pieChart").appendTo(this.container);
      this.legendContainer = DOM.create("div.pieChartLegendContainer").appendTo(this.container);
   }
   setData(data) {
      this.pieChart.setStyle({ backgroundImage: this.createConicGradient(data) });
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
}

// Styling
const style = document.createElement("style");
style.innerHTML = `
   .pieChartContainer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
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
