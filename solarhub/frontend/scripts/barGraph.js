import DOM from "./dom.js";

export default class BarGraph {
   constructor() {
      this.elements = [];
      this.container = DOM.create("div.barGraphContainer");
      this.elementClicked = () => {};
      this.selectedIndex;
   }
   setVisibility(visible) {
      this.container.setStyle({
         display: visible ? "flex" : "none",
      });
   }
   draw() {
      this.elements.sort((a, b) => a.data.start - b.data.start);
      this.container.setContent("");
      const containerHeight = 225;
      const maxVal = Math.max(...this.elements.map((elem) => Math.max(elem.a, elem.b)));
      const scalingFactor = containerHeight / maxVal / 2;
      for (let i = 0; i < this.elements.length; i++) {
         const elem = this.elements[i];
         const elementContainer = DOM.create("div.elementContainer");
         const bar1Height = Math.max(elem.a * scalingFactor, 7);
         const bar2Height = Math.max(elem.b * scalingFactor, 7);
         const offset = containerHeight / 2 - bar1Height;
         DOM.create("div.bar.upper")
            .setStyle({
               height: bar1Height + "px",
               marginTop: offset + "px",
            })
            .appendTo(elementContainer);
         DOM.create("t.label").setText(elem.label).appendTo(elementContainer);
         DOM.create("div.bar.lower")
            .setStyle({
               height: bar2Height + "px",
            })
            .appendTo(elementContainer);
         let selectedIndex = this.selectedIndex;
         if (!selectedIndex || selectedIndex >= this.elements.length) selectedIndex = this.elements.length - 1;
         const isSelected = i == selectedIndex;
         elementContainer.onClick(() => {
            this.selectedIndex = i;
            document.querySelectorAll(".selected").forEach((selectedElem) => {
               selectedElem.classList.remove("selected");
            });
            elementContainer.addClass("selected");
            this.elementClicked(elem.data);
         }, isSelected);
         this.container.append(elementContainer);
      }
   }
}

// Styling
const style = document.createElement("style");
style.innerHTML = `
   .barGraphContainer {
      width: 100%;
      height: 230px;
      margin-top: 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
   }

   .barGraphContainer .elementContainer {
      flex-grow: 1;
      width: 5px;
      max-width: 25px;
      height: 100%;
      padding: 0px 4px;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: center;
      transition: 0.3s;
   }

   .barGraphContainer .bar {
      width: 100%;
      border-radius: 50px;
      transition: 0.3s;
   }

   .barGraphContainer .bar.upper {
      background-color: rgba(255, 199, 0, 1);
   }

   .barGraphContainer .bar.lower {
      background-color: rgba(96, 183, 255, 1);
   }

   .barGraphContainer .label {
      font-family: boldest;
      font-size: 12px;
      opacity: 0.26;
      width: 100%;
      margin: 4px 0px;
      text-align: center;
      white-space: nowrap;
      transition: 0.3s;
   }

   @media (pointer: fine) {
      .barGraphContainer .elementContainer:hover {
         transform: scale(1.05);
      }

      .barGraphContainer .elementContainer:hover .label {
         opacity: 1;
         transform: scale(1.3);
      }

      .barGraphContainer .elementContainer:hover .bar.upper,
      .barGraphContainer .elementContainer:hover .bar.lower {
          box-shadow: inset 0px 0px 0px 30px rgba(255, 255, 255, 0.7);
      }


      .barGraphContainer .elementContainer:active {
         transform: scale(1.02);
         opacity: 0.5;
      }
   }

   .barGraphContainer .elementContainer.selected .label {
      opacity: 1;
      transform: scale(1.6);
   }
`;
document.head.appendChild(style);
