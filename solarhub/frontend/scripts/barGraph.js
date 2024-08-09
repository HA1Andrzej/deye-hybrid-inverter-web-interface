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
      const maxVal = Math.max(...this.elements.map((elem) => Math.max(elem.a, elem.b)));
      const scalingFactor = 225 / maxVal;
      for (let i = 0; i < this.elements.length; i++) {
         const elem = this.elements[i];
         const elementContainer = DOM.create("div.barGraphElementContainer");
         const barContainer = DOM.create("div.barGraphBarContainer").appendTo(elementContainer);
         const bar1 = DOM.create("div.barGraphBar1").appendTo(barContainer);
         const bar2 = DOM.create("div.barGraphBar2").appendTo(barContainer);
         DOM.create("t.barGraphBarDescriptionText").setText(elem.label).appendTo(elementContainer);
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

         bar1.setStyle({
            height: elem.a * scalingFactor + "px",
         });
         bar2.setStyle({
            height: elem.b * scalingFactor + "px",
         });
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

   .barGraphElementContainer {
      flex-grow: 1;
      width: 5px;
      max-width: 25px;
      height: 100%;
      margin: 0px 3px;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      transition: 0.3s;
   }

   .barGraphBarContainer {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: flex-end;
      gap: 2px;
   }

   .barGraphBar1 {
      flex-grow: 1;
      background-color: rgba(255, 199, 0, 1);
      border-radius: 50px;
      min-height: 7px;
      transition: 0.3s;
   }

   .barGraphBar2 {
      flex-grow: 1;
      background-color: rgba(96, 183, 255, 1);
      border-radius: 50px;
      min-height: 7px;
      transition: 0.3s;
   }

   .barGraphBarDescriptionText {
      font-family: boldest;
      font-size: 12px;
      opacity: 0.26;
      width: 100%;
      margin-top: 5px;
      text-align: center;
      white-space: nowrap;
      transition: 0.3s;
   }

   @media (pointer: fine) {
      .barGraphElementContainer:hover {
         transform: scale(1.05);
      }

      .barGraphElementContainer:hover .barGraphBarDescriptionText {
         opacity: 1;
         transform: scale(1.3);
      }

      .barGraphElementContainer:hover .barGraphBar1 {
         box-shadow: inset 0px 0px 0px 30px rgba(255, 255, 255, 0.7);
      }

      .barGraphElementContainer:hover .barGraphBar2 {
         box-shadow: inset 0px 0px 0px 30px rgba(255, 255, 255, 0.7);
      }

      .barGraphElementContainer:active {
         transform: scale(1.02);
         opacity: 0.5;
      }
   }

   .barGraphElementContainer.selected .barGraphBarDescriptionText {
      opacity: 1;
      transform: scale(1.6);
   }
`;
document.head.appendChild(style);
