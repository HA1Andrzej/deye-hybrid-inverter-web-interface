// Version 1.1 (04.03.24)

export default class DOM {
   constructor(elems) {
      this.elems = elems || [];
      this.customProperties = [];
   }
   static create(args) {
      if (args) {
         const identifiers = args.match(/[^.\s#[]+|[#.][^.#\s\[]+|\[.*?\]/g);
         const elem = new DOM([document.createElement(identifiers[0])]);
         for (let i = 1; i < identifiers.length; i++) {
            if (identifiers[i].startsWith(".")) {
               elem.addClass(identifiers[i].slice(1));
            } else if (identifiers[i].startsWith("#")) {
               elem.setId(identifiers[i].slice(1));
            } else if (identifiers[i].startsWith("[")) {
               const [attrName, ...attrValueParts] = identifiers[i].slice(1, -1).split("=");
               const attrValue = attrValueParts.join("=").trim().replace(/['"]/g, "");
               elem.attr({ [attrName.trim()]: attrValue });
            }
         }
         return elem;
      }
   }
   static select(selector) {
      if (!selector.startsWith(".") && !selector.startsWith("#")) {
         selector = "#" + selector;
      }
      const elems = document.querySelectorAll(selector);
      return new DOM(elems);
   }
   setId(id) {
      this.forEvery((elem) => {
         elem.id = id;
      });
      return this;
   }
   getId() {
      return this.getFirstElement().id;
   }
   addClass(className) {
      this.forEvery((elem) => {
         elem.classList.add(className);
      });
      return this;
   }
   removeClass(className) {
      this.forEvery((elem) => {
         elem.classList.remove(className);
      });
      return this;
   }
   setText(text) {
      text = DOM.decodeHtmlEntities(text);
      this.forEvery((elem) => {
         elem.innerText = text;
      });
      return this;
   }
   getText() {
      return this.getFirstElement().innerText;
   }
   appendText(text) {
      this.forEvery((elem) => {
         elem.innerText += text;
      });
      return this;
   }
   setContent(text) {
      this.forEvery((elem) => {
         elem.innerHTML = text;
      });
      return this;
   }
   append(...children) {
      children.forEach((child) => {
         if (child instanceof DOM) {
            child = child.getFirstElement();
         }
         if (typeof child === "string") {
            child = DOM.create("t").setContent(child).getFirstElement();
         }
         this.forEvery((elem) => {
            elem.appendChild(child);
         });
      });
      return this;
   }
   appendTo(parent) {
      this.forEvery((elem) => {
         parent.append(elem);
      });
      return this;
   }
   getWidth() {
      return this.getFirstElement().getBoundingClientRect().width;
   }
   getHeight() {
      return this.getFirstElement().getBoundingClientRect().height;
   }
   getLeft() {
      return this.getFirstElement().getBoundingClientRect().left;
   }
   getTop() {
      return this.getFirstElement().getBoundingClientRect().top;
   }
   setStyle(params) {
      this.forEvery((elem) => {
         for (const [key, value] of Object.entries(params)) {
            elem.style[key] = value.toString();
         }
      });
      return this;
   }
   setCustomProperties(obj) {
      this.customProperties = obj;
      return this;
   }
   onInput(callback, initial) {
      this.forEvery((elem) => {
         elem.addEventListener("input", () => {
            callback(elem.value);
         });
         if (initial) callback(elem.value);
      });
      return this;
   }
   onChange(callback, initial) {
      this.forEvery((elem) => {
         elem.addEventListener("change", () => {
            callback(elem.value);
         });
         if (initial) callback(elem.value);
      });
      return this;
   }
   onClick(callback, initial) {
      this.forEvery((elem) => {
         if (elem._onClickCallback) {
            elem.removeEventListener("click", elem._onClickCallback);
         }
         elem._onClickCallback = callback;
         elem.addEventListener("click", callback);
         if (initial) callback();
      });
      return this;
   }
   onTransitionEnd(callback, initial, delayedTrigger) {
      this.forEvery((elem) => {
         elem.addEventListener("transitionend", () => {
            callback(this);
         });
         if (initial) callback(this);
         if (delayedTrigger) {
            setTimeout(() => {
               callback(this);
            }, 10);
         }
      });
      return this;
   }
   click() {
      this.forEvery((elem) => {
         elem.click();
      });
      return this;
   }
   forEvery(func) {
      for (let elem of this.elems) {
         func(elem);
      }
   }
   setValue(val) {
      this.forEvery((elem) => {
         elem.value = val;
      });
      return this;
   }
   getValue() {
      return this.getFirstElement().value.trim();
   }
   getScrollWidth() {
      return this.getFirstElement().scrollWidth;
   }
   attr(attributes) {
      this.forEvery((elem) => {
         for (const [key, value] of Object.entries(attributes)) {
            elem.setAttribute(key, value);
         }
      });
      return this;
   }
   getFirstElement() {
      return this.elems[0];
   }
   static decodeHtmlEntities(str) {
      if (typeof str !== "string" || str.length === 0) {
         return str;
      }
      const entities = {
         "&amp;": "&",
         "&lt;": "<",
         "&gt;": ">",
         "&quot;": '"',
         "&#39;": "'",
         "&uuml;": "ü",
         "&ouml;": "ö",
         "&auml;": "ä",
         "&Uuml;": "Ü",
         "&Ouml;": "Ö",
         "&Auml;": "Ä",
      };
      return str.replace(/&[a-zA-Z0-9#]+;/g, (match) => entities[match] || match);
   }
}
