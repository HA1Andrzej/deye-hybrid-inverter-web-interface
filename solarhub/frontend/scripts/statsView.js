import DOM from "./dom.js";
import { getRawData, getOldestTimestamp, getPeakValues } from "./com.js";
import { mod, getWeekNumber, constants } from "./helper.js";
import StateBar from "./stateBar.js";
import PieChart from "./pieChart.js";
import BarGraph from "./barGraph.js";
import LineGraph from "./lineGraph.js";

// Variables
const statsContainer = DOM.create("div.sideContainer#statsContainer");
const barGraph = new BarGraph();
const lineGraph = new LineGraph();
let updateTimeout = setTimeout(() => {}, 1);
const amortizationBar = new StateBar();
const selfSufficiencyBar = new StateBar();
const selfUseBar = new StateBar();
const pieChart = new PieChart();
const kmBars = [];
let kmBarsIgnoreHidden = false;
let selectedTabId;

export function build(mainContainer) {
   statsContainer.appendTo(mainContainer);
   statsContainer.append(buildTabs());
   statsContainer.append(barGraph.container).append(lineGraph.container);
   DOM.create("div")
      .setStyle({ maxWidth: "550px" })
      .append(
         buildInfoElements(),
         buildGridRatioBar(),
         buildFinancesContainer(),
         buildPieChartContainer(),
         buildCo2Container(),
         buildIndependencyBars(),
         buildBatteryHealthContainer(),
         buildKmBars(),
         DOM.create("t#debugText").setStyle({ display: "block", marginTop: "100px" }),
      )
      .appendTo(statsContainer);
   DOM.select(".tab#days").click();
}

// Builds the Tabs UI
function buildTabs() {
   const tabContainer = DOM.create("div#tabContainer")
      .append(DOM.create("div.tab#days").setText("Tage"))
      .append(DOM.create("div.tab#weeks").setText("Wochen"))
      .append(DOM.create("div.tab#months").setText("Monate"))
      .append(DOM.create("div.tab#years").setText("Jahre"))
      .append(DOM.create("div.tab#total").setText("Gesamt"));
   const tabs = tabContainer.getFirstElement().children;
   for (let tab of tabs) {
      tab = new DOM([tab]);
      tab.onClick(() => {
         for (let activeTab of DOM.select("#tabContainer .selectedTab").elems) {
            new DOM([activeTab]).removeClass("selectedTab");
         }
         tab.addClass("selectedTab");
         const id = tab.getId();
         tabClicked(id);
      });
   }
   return tabContainer;
}

function buildInfoElements() {
   const container = DOM.create("div").setStyle({ display: "flex", flexDirection: "column", marginTop: "40px" });
   DOM.create("div")
      .setStyle({ display: "flex", alignItems: "center", justifyContent: "center" })
      .appendTo(container)
      .append(
         buildSimpleIconTextElement("sun.png", "sunEnergy", "kWh Produziert"),
         DOM.create("div").setStyle({ width: "20px" }),
         buildSimpleIconTextElement("house.png", "loadEnergy", "kWh Verbraucht"),
      );
   DOM.create("div")
      .setStyle({ display: "flex", alignItems: "center", justifyContent: "center" })
      .appendTo(container)
      .append(
         buildSimpleIconTextElement("max_sun.png", "maxSunPower", "kW Peak"),
         DOM.create("div").setStyle({ width: "20px" }),
         buildSimpleIconTextElement("max_load.png", "maxLoadPower", "kW Peak"),
      );
   return container;
}

// Builds the Grid Ratio Bar UI
function buildGridRatioBar() {
   const container = DOM.create("div").setStyle({ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
   container.append(buildBigTitle("grid_in.png", "Netzbilanz", "So viel Strom wurde ans Netz verkauft und aus dem Netz eingekauft"));
   const ratioContainer = DOM.create("div#ratioContainer").appendTo(container);
   const valuesContainer = DOM.create("div#ratioValuesContainer").appendTo(ratioContainer);
   DOM.create("img.icon [src=/assets/images/grid_in.png]").appendTo(valuesContainer);
   DOM.create("t.value#gridSoldValue").setText("0,000").appendTo(valuesContainer);
   DOM.create("t.unit").setText("kWh").appendTo(valuesContainer);
   DOM.create("div").setStyle({ flexGrow: 1 }).appendTo(valuesContainer);
   DOM.create("img.icon [src=/assets/images/grid_out.png]").appendTo(valuesContainer);
   DOM.create("t.value#gridBoughtValue").setText("0,000").appendTo(valuesContainer);
   DOM.create("t.unit").setText("kWh").appendTo(valuesContainer);
   const barContainer = DOM.create("div#ratioBarContainer").appendTo(ratioContainer);
   DOM.create("div.ratioBar#ratioBarGreen").appendTo(barContainer);
   DOM.create("div.ratioBar#ratioBarRed").appendTo(barContainer);
   const costContainer = DOM.create("div#ratioCostContainer").appendTo(ratioContainer);
   const costBoxIn = DOM.create("div.costBoxGreen").appendTo(costContainer);
   DOM.create("t.costBoxValue#gridSoldCostValue").setText("+0,00 €").appendTo(costBoxIn);
   DOM.create("div").setStyle({ flexGrow: 1 }).appendTo(costContainer);
   const costBoxOut = DOM.create("div.costBoxRed").appendTo(costContainer);
   DOM.create("t.costBoxValue#gridBoughtCostValue").setText("-0,00 €").appendTo(costBoxOut);
   return container;
}

// Builds the Finances UI
function buildFinancesContainer() {
   const financesContainer = DOM.create("div");
   financesContainer.append(buildBigTitle("coin.png", "Kosten", "So viel Geld sparen wir uns Dank der Solaranlage"));
   const financesInnerContainer = DOM.create("div")
      .setStyle({
         width: "100%",
         display: "flex",
         flexDirection: "column",
         alignItems: "center",
         justifyContent: "center",
      })
      .appendTo(financesContainer);
   const costBoxWithPv = DOM.create("div.costBoxGreen").append(DOM.create("t.costBoxValue#costWithPvValue"));
   const costBoxWithoutPv = DOM.create("div.costBoxRed").append(DOM.create("t.costBoxValue#costWithoutPvValue"));
   DOM.create("div")
      .setStyle({ display: "flex", gap: "10px", marginTop: "20px" })
      .append(DOM.create("div.financesElementContainer").append(DOM.create("t.financesText").setText("Real")).append(DOM.create("img.financesIcon [src=/assets/images/sun.png]")).append(costBoxWithPv))
      .append(
         DOM.create("div.financesElementContainer")
            .append(DOM.create("t.financesText").setText("Fiktiv"))
            .append(DOM.create("img.financesIcon [src=/assets/images/no_sun.png]"))
            .append(costBoxWithoutPv),
      )
      .appendTo(financesInnerContainer);
   DOM.create("img [src=/assets/images/finances_sum_arrow.png]").setStyle({ width: "80px", height: "80px", objectFit: "contain" }).appendTo(financesInnerContainer);
   const costBoxSaved = DOM.create("div.costBoxGreen").append(DOM.create("t.costBoxValue#costSavedValue"));
   DOM.create("div.financesElementContainer")
      .append(DOM.create("t.financesText").setText("Gespart"))
      .append(DOM.create("img.financesIcon [src=/assets/images/cash.png]"))
      .append(costBoxSaved)
      .appendTo(financesInnerContainer);
   amortizationBar.setColor({ r: 0, g: 176, b: 155 });
   amortizationBar.setIcon("clock.png");
   amortizationBar.setUnit("% Amortisiert");
   amortizationBar.setMax(100);
   amortizationBar.setValue(0);
   amortizationBar.container.setStyle({ marginTop: "60px" });
   financesContainer.append(amortizationBar.container);
   return financesContainer;
}

// Builds the Pie Chart UI
function buildPieChartContainer() {
   const pieChartContainer = DOM.create("div");
   pieChartContainer.append(buildBigTitle("energy_mix.png", "Strommix", "Aus diesen Quellen kommt der von uns verbrauchte Strom"));
   pieChartContainer.append(pieChart.container);
   return pieChartContainer;
}

// Builds the CO2 UI
function buildCo2Container() {
   const container = DOM.create("div").setStyle({ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
   container.append(buildBigTitle("leaves.png", "Nachhaltigkeit", "Diese Auswirkungen hat die Solaranlage auf Umwelt und Gesundheit"));
   const elemContainer = DOM.create("div").setStyle({ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }).appendTo(container);
   elemContainer.append(
      buildSimpleIconTextElement("mass.png", "co2WeightText", "Kilogramm CO<sub>2</sub> eingespart"),
      buildSimpleIconTextElement("balloon.png", "co2BalloonsText", "Luftballons voller CO<sub>2</sub>"),
      buildSimpleIconTextElement("car.png", "co2CarKmText", "km Verbrenner äquivalent"),
      buildSimpleIconTextElement("tree.png", "co2TreesText", "Bäume im gleichen Zeitraum"),
      buildSimpleIconTextElement("coal.png", "co2CoalText", "Kilogramm Kohle nicht verbrannt"),
      buildSimpleIconTextElement("", "", "Gramm Feinstaub vermieden"),
      buildSimpleIconTextElement("", "", "Gramm Stick- & Schwefeloxide vermieden"),
      buildSimpleIconTextElement("", "", "Atemwegserkrankungen vermieden"),
      buildSimpleIconTextElement("", "", "Tode vermieden"),
      buildSimpleIconTextElement("", "", "€ öffentliche Gesundheitskosten gespart"),
      buildSimpleIconTextElement("", "", "Liter Wasser gespart"),
   );

   return container;
}

function buildSimpleIconTextElement(icon, id, description) {
   return DOM.create("div.simpleIconTextElementContainer")
      .append(DOM.create(`img [src=/assets/images/${icon}]`))
      .append(DOM.create(`t#${id}`).setContent("0"))
      .append(DOM.create("t").setContent(description));
}

// Builds the Self Sufficiency and Self Use Bar UI
function buildIndependencyBars() {
   const barContainer = DOM.create("div").setStyle({ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
   barContainer.append(buildBigTitle("fist.png", "Unabhängigkeit", "So gut würden wir ohne das Stromnetz auskommen"));

   selfSufficiencyBar.center();
   selfSufficiencyBar.setColor({ r: 0, g: 210, b: 140 });
   selfSufficiencyBar.setUnit("%");
   selfSufficiencyBar.setMax(100);
   selfSufficiencyBar.setValue(93);
   selfSufficiencyBar.setInfoText("Autarkiegrad");
   barContainer.append(selfSufficiencyBar.container);

   selfUseBar.center();
   selfUseBar.flip();
   selfUseBar.setColor({ r: 0, g: 176, b: 155 });
   selfUseBar.setUnit("%");
   selfUseBar.setMax(100);
   selfUseBar.setValue(69);
   selfUseBar.setInfoText("Eigenverbrauch");
   barContainer.append(selfUseBar.container);
   return barContainer;
}

// Build Big Title UI
function buildBigTitle(icon, subtitle, title) {
   const container = DOM.create("div").setStyle({ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginTop: "160px" });
   container.append(DOM.create(`img.bigTitleIcon [src=/assets/images/${icon}]`));
   container.append(DOM.create("t.subtitle").setContent(subtitle));
   container.append(DOM.create("t.bigTitle").setContent(title));
   return container;
}

// Build UI für Battery Health
function buildBatteryHealthContainer() {
   const container = DOM.create("div").setStyle({ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginBottom: "100px" });
   container.append(buildBigTitle("battery.png", "Batteriegesundheit", "So stark wurde die Batterie beansprucht"));
   const hContainer = DOM.create("div").setStyle({ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", margin: "40px 0px" }).appendTo(container);
   hContainer.append(
      DOM.create("div").setStyle({ display: "flex", flexDirection: "column", alignItems: "flex-end" }).append(DOM.create("t.value#batteryChargeText"), DOM.create("t.unit").setText("kWh geladen")),
      DOM.create("img.batteryArrowImage [src=/assets/images/battery_arrow.png]").setStyle({ marginRight: "20px" }),
   );
   hContainer.append(DOM.create("img [src=/assets/images/battery_large.png]").setStyle({ width: "60px", objectFit: "contain", marginTop: "-10px" }));
   hContainer.append(
      DOM.create("img.batteryArrowImage [src=/assets/images/battery_arrow.png]").setStyle({ marginLeft: "20px" }),
      DOM.create("div").setStyle({ display: "flex", flexDirection: "column" }).append(DOM.create("t.value#batteryDischargeText"), DOM.create("t.unit").setText("kWh entladen")),
   );
   const elemContainer = DOM.create("div").setStyle({ display: "flex", flexDirection: "column", marginTop: "30px" }).appendTo(container);
   elemContainer.append(
      buildSimpleIconTextElement("max_batt.png", "maxBatterySoCText", "% Höchststand"),
      buildSimpleIconTextElement("min_batt.png", "minBatterySoCText", "% Tiefststand"),
      buildSimpleIconTextElement("avg_batt.png", "avgBatterySoCText", "% Durchschnitt"),
      buildSimpleIconTextElement("batt_cycles.png", "batteryCyclesText", "Zyklen"),
      buildSimpleIconTextElement("batt_soh.png", "batterySoHText", "% State of Health (± 5%)"),
   );
   return container;
}

// Build Ui for Km Bars
function buildKmBars() {
   const barContainer = DOM.create("div").setStyle({ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" });
   barContainer.append(buildBigTitle("gears.png", "Effizienz der Mobilität", "Die produzierte Menge an Energie würde reichen für..."));
   for (let i = 0; i < 20; i++) {
      const bar = new StateBar();
      bar.setColor({ r: 238, g: 66, b: 102 });
      bar.setColor({ r: 255, g: 80, b: 122 });
      bar.setUnit("Personenkilometer");
      //bar.iconMode();
      kmBars.push(bar);
      barContainer.append(bar.container);
   }
   barContainer.append(DOM.create("div.button#kmBarsAllButton"));
   return barContainer;
}

// When a Tab is clicked
async function tabClicked(tabId, greyOut = true) {
   selectedTabId = tabId;
   clearTimeout(updateTimeout);
   updateTimeout = setTimeout(() => {
      tabClicked(tabId, false);
   }, 60 * 1000);

   if (greyOut) statsContainer.addClass("waiting");
   barGraph.elements = [];
   const now = new Date();

   // Calculate data for different time span options
   let numberOfBars = Math.floor(statsContainer.getWidth() / 25);
   if (tabId == "total") numberOfBars = 1;
   let doneCounter = 0;
   for (let i = 0; i < numberOfBars; i++) {
      let start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i - numberOfBars + 1).getTime();
      let end = start + 86_400_000 - 1000;
      let blockLength = 15 * 60 * 1000;
      let label = new Date(start).toLocaleString("de-DE", { weekday: "short" });
      const date = new Date((start + end) / 2);
      const daysOfWeek = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
      const months = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"];
      let title = `${daysOfWeek[date.getDay()]}`;
      let subTitle = `${String(date.getDate()).padStart(2, "0")}. ${months[date.getMonth()]} ${date.getFullYear()}`;
      let lineGraphLabels = "0 1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16 17 18 19 20 21 22 23".split(" ");
      if (tabId == "weeks") {
         let dayOffset = now.getDay() === 0 ? -6 : 1 - now.getDay();
         start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset - 7 * i).getTime();
         end = start + 7 * 86_400_000 - 1000;
         blockLength = 60 * 60 * 1000;
         label = getWeekNumber((start + end) / 2);
         title = `Kalenderwoche ${getWeekNumber((start + end) / 2)}`;
         subTitle = `${new Date(start).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })} - ${new Date(end).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit" })}`;
         lineGraphLabels = "Mo Di Mi Do Fr Sa So".split(" ");
      }
      if (tabId == "months") {
         start = new Date(now.getFullYear(), now.getMonth() - i, 1).getTime();
         end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0).getTime() + 86_400_000 - 1000;
         blockLength = 6 * 60 * 60 * 1000;
         label = new Date(start).toLocaleString("de-DE", { month: "short" });
         title = `${months[new Date(start).getMonth()]} ${new Date(start).getFullYear()}`;
         subTitle = `${new Date(start).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })} - ${new Date(end).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" })}`;
         lineGraphLabels = Array.from({ length: Math.ceil(new Date(now.getFullYear(), now.getMonth() - i + 1, 0).getDate()) }, (_, index) => (index + 1).toString());
      }
      if (tabId == "years") {
         start = new Date(now.getFullYear() - i, 0, 1).getTime();
         end = new Date(now.getFullYear() - i + 1, 0, 0).getTime() + 86_400_000 - 1000;
         blockLength = 7 * 24 * 60 * 60 * 1000;
         label = new Date(start).getFullYear().toString().slice(-2);
         title = `Das Jahr ${new Date(start).getFullYear()}`;
         subTitle = `${new Date(start).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} - ${new Date(end).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })}`;
         lineGraphLabels = "Jan Feb Mär Apr Mai Jun Jul Aug Sep Okt Nov Dez".split(" ");
      }
      if (tabId == "total") {
         start = await getOldestTimestamp();
         end = Date.now();
         blockLength = 24 * 60 * 60 * 1000;
         title = "Gesamtbilanz";
         subTitle = `${new Date(start).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" })} bis heute`;
         const numberOfDays = Math.round((end - start) / (24 * 60 * 60 * 1000));
         lineGraphLabels = [`${numberOfDays} Tage`];
      }
      const rawDataBlockLength = Math.min(blockLength, 1 * 60 * 60 * 1000);
      getRawData(start, end, rawDataBlockLength).then((rawData) => {
         doneCounter++;
         const sunEnergy =
            rawData.reduce((acc, a) => {
               const timeDiff = a.timestamp_end - a.timestamp_start;
               const power = a.p_sun;
               return acc + power * timeDiff;
            }, 0) / 3_600_000;
         const loadEnergy =
            rawData.reduce((acc, a) => {
               const timeDiff = a.timestamp_end - a.timestamp_start;
               const power = a.p_load;
               return acc + power * timeDiff;
            }, 0) / 3_600_000;
         barGraph.elements.push({
            a: sunEnergy,
            b: loadEnergy,
            label: label,
            data: {
               start: start,
               end: end,
               title: title,
               subTitle: subTitle,
               labels: lineGraphLabels,
               values: rawData,
               blockLength: blockLength,
               sunEnergy: sunEnergy,
               loadEnergy: loadEnergy,
            },
         });
      });
   }
   const interval = setInterval(() => {
      if (doneCounter < numberOfBars) return;
      barGraph.setVisibility(tabId != "total");
      barGraph.draw();
      statsContainer.removeClass("waiting");
      clearInterval(interval);
   }, 10);
}

// Called when an Element in the Bar Graph is Clicked
barGraph.elementClicked = (data) => {
   lineGraph.setTitle(data.title);
   lineGraph.setSubTitle(data.subTitle);
   lineGraph.setLabels(data.labels);
   processStatistics(data);

   lineGraph.values = [];
   //lineGraph.setEnergyValues(data.sunEnergy, data.loadEnergy);
   const numberOfBlocks = Math.round((data.end - data.start) / data.blockLength);
   let prevEnd = 0;
   for (let i = 0; i < numberOfBlocks; i++) {
      const blockStart = data.start + data.blockLength * i;
      const blockEnd = blockStart + data.blockLength;
      let sunPower = 0;
      let loadPower = 0;
      let cnt = 0;
      for (let j = prevEnd; j < data.values.length; j++) {
         const timestamp = data.values[j].timestamp_start;
         if (timestamp > blockEnd) break;
         if (timestamp >= blockStart) {
            sunPower += data.values[j].p_sun;
            loadPower += data.values[j].p_load;
            cnt++;
            prevEnd = j;
         }
      }
      const aVal = cnt == 0 ? undefined : sunPower / cnt;
      const bVal = cnt == 0 ? undefined : loadPower / cnt;
      lineGraph.values.push({
         a: aVal,
         b: bVal,
         //a_fallback: 200 + Math.random() * 500,
         //b_fallback: 200 + Math.random() * 500,
      });
   }
   lineGraph.draw();
};

// Calculate all the interesting data
function processStatistics(data) {
   const debugText = DOM.select("debugText");
   debugText.setContent("");

   // Ertrag / Verbrauch
   const sunEnergyKwh = data.sunEnergy / 1000;
   const sunEnergyString = sunEnergyKwh < 50 ? sunEnergyKwh.toTwoDecimalString() : Math.round(sunEnergyKwh);
   DOM.select("sunEnergy").setText(sunEnergyString);
   const loadEnergyKwh = data.loadEnergy / 1000;
   const loadEnergyString = loadEnergyKwh < 50 ? loadEnergyKwh.toTwoDecimalString() : Math.round(loadEnergyKwh);
   DOM.select("loadEnergy").setText(loadEnergyString);

   // Peak Values
   DOM.select("maxSunPower").setText("0,000");
   getPeakValues("p_sun", data.start, data.end).then((maxSunPower) => {
      const maxSunDate = new Date(maxSunPower.timestamp).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
      DOM.select("maxSunPower").setText((maxSunPower.val / 1000).toTwoDecimalString());
   });
   DOM.select("maxLoadPower").setText("0,000");
   getPeakValues("p_load", data.start, data.end).then((maxLoadPower) => {
      const maxLoadDate = new Date(maxLoadPower.timestamp).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
      DOM.select("maxLoadPower").setText((maxLoadPower.val / 1000).toTwoDecimalString());
   });

   // Grid Bar
   const gridBoughtEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = Math.max(a.p_grid, 0);
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   const gridSoldEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = Math.abs(Math.min(a.p_grid, 0));
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   const gridBoughtCost = (gridBoughtEnergy / 1000) * constants.costPerKwh;
   const gridSoldCost = (gridSoldEnergy / 1000) * constants.earningsPerKwh;
   DOM.select("gridSoldCostValue").setText("+" + gridSoldCost.toEuroString());
   DOM.select("gridBoughtCostValue").setText("-" + gridBoughtCost.toEuroString());
   DOM.select("gridSoldValue").setText((gridSoldEnergy / 1000).toThreeDecimalString());
   DOM.select("gridBoughtValue").setText((gridBoughtEnergy / 1000).toThreeDecimalString());
   DOM.select("ratioBarGreen").setStyle({ width: `${Math.round((gridSoldEnergy / (gridBoughtEnergy + gridSoldEnergy)) * 100)}%` });

   // Finances
   const actualCost = gridSoldCost - gridBoughtCost;
   const marketPriceOfEnergyUsed = Math.round((data.loadEnergy / 1000) * constants.costPerKwh * 100) / 100;
   const savedMoney = actualCost + marketPriceOfEnergyUsed;
   DOM.select("costWithoutPvValue").setText(`-${marketPriceOfEnergyUsed.toEuroString()}`);
   DOM.select("costWithPvValue").setText((actualCost > 0 ? "+" : "-") + Math.abs(actualCost).toEuroString());
   DOM.select("costSavedValue").setText(savedMoney.toEuroString());
   const amortized = Math.round((savedMoney / constants.totalSystemCost) * 10000) / 100;
   amortizationBar.setValue(amortized);
   const timeSpan = data.end - data.start;
   const timeLeft = (timeSpan / savedMoney) * constants.totalSystemCost;
   const endDate = new Date(Date.now() + timeLeft).toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
   amortizationBar.setInfoText(`100% am ${endDate}`);
   amortizationBar.setVisibility(selectedTabId == "total");

   // Energy Mix
   const directSunUseEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = Math.min(a.p_sun, a.p_load);
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   const gridUseEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = Math.max(a.p_grid - a.p_losses, 0);
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   const batteryUseEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = Math.max(a.p_batt - a.p_losses, 0);
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   pieChart.setData([
      { value: gridUseEnergy, color: { r: 255, g: 44, b: 133 }, description: "Netz" },
      { value: directSunUseEnergy, color: { r: 255, g: 199, b: 0 }, description: "Sonne" },
      { value: batteryUseEnergy, color: { r: 0, g: 210, b: 140 }, description: "Batterie" },
   ]);
   //console.log(`SunUse: ${(100 * directSunUseEnergy) / data.loadEnergy} %`);
   //console.log(`BattUse: ${(100 * batteryUseEnergy) / data.loadEnergy} %`);
   //console.log(`GridUse: ${(100 * gridUseEnergy) / data.loadEnergy} %`);
   //console.log(`Sum: ${((directSunUseEnergy + batteryUseEnergy + gridUseEnergy) / data.loadEnergy) * 100} %`);

   // CO2 View
   const savedCo2 = Math.round((data.sunEnergy / 1000) * 391);
   const co2ToBalloons = Math.round(savedCo2 / 4.95);
   const co2ToCar = Math.round(savedCo2 / 160);
   const gramsOfCoalPerKwhGermanEnergyMix = 75;
   const gramsOfSavedCoal = (data.sunEnergy / 1000) * gramsOfCoalPerKwhGermanEnergyMix;
   const gramsCo2perTreePerYear = 13_000;
   const timeFrameYears = (Math.max(...data.values.map((value) => value.timestamp_end)) - Math.min(...data.values.map((value) => value.timestamp_start))) / (1000 * 60 * 60 * 24 * 365.25);
   const numberOfTrees = Math.round(savedCo2 / timeFrameYears / gramsCo2perTreePerYear);
   DOM.select("co2WeightText").setText((Math.round(savedCo2 / 10) / 100).toLocaleString("de-DE"));
   DOM.select("co2BalloonsText").setText(co2ToBalloons.toLocaleString("de-DE"));
   DOM.select("co2CarKmText").setText(co2ToCar);
   DOM.select("co2TreesText").setText(numberOfTrees);
   DOM.select("co2CoalText").setText((Math.round(gramsOfSavedCoal / 10) / 100).toLocaleString("de-DE"));

   // Autarkiegrad & Eigenverbrauch
   const selfSufficiency = Math.round((100 * (directSunUseEnergy + batteryUseEnergy)) / data.loadEnergy);
   selfSufficiencyBar.setValue(selfSufficiency);
   const selfUse = Math.round((100 * (data.sunEnergy - gridSoldEnergy)) / data.sunEnergy);
   selfUseBar.setValue(selfUse);

   // Km Bars
   const ranges = [
      { name: "Privatjet", value: (data.sunEnergy / 4_320_000) * 100, icon: "jet.png", hidden: true },
      { name: "Motorboot", value: (data.sunEnergy / 282_000) * 100, icon: "yacht.png", hidden: true },
      { name: "Verbrenner-SUV", value: (data.sunEnergy / 82_000) * 100, icon: "car.png", hidden: true },
      { name: "Verbrenner-Auto", value: (data.sunEnergy / 48_000) * 100, icon: "car.png" },
      { name: "Verbrenner-Motorrad", value: (data.sunEnergy / 40_000) * 100, icon: "motorcycle.png", hidden: true },
      { name: "Flugzeug", value: (data.sunEnergy / 24_000) * 100, icon: "plane.png" },
      { name: "E-Auto", value: (data.sunEnergy / 12_000) * 100, icon: "car.png" },
      { name: "Verbrenner-Bus", value: (data.sunEnergy / 8_600) * 100, icon: "bus.png" },
      { name: "E-Motorrad", value: (data.sunEnergy / 8_000) * 100, icon: "motorcycle.png", hidden: true },
      { name: "E-Segelflugzeug", value: (data.sunEnergy / 6_150) * 100, icon: "jet.png", hidden: true },
      { name: "E-Bus", value: (data.sunEnergy / 4_000) * 100, icon: "bus.png", hidden: true },
      { name: "Zu Fuß", value: (data.sunEnergy / 2_600) * 100, icon: "pedestrian.png" },
      { name: "Zug", value: (data.sunEnergy / 2_500) * 100, icon: "train.png" },
      { name: "Urbane Seilbahn", value: (data.sunEnergy / 2_000) * 100, icon: "cablecar.png", hidden: true },
      { name: "Lastenrad", value: (data.sunEnergy / 1_400) * 100, icon: "cargobike.png", hidden: true },
      { name: "E-Scooter", value: (data.sunEnergy / 1_350) * 100, icon: "e_scooter.png" },
      { name: "E-Bike", value: (data.sunEnergy / 850) * 100, icon: "bike.png" },
      { name: "Fahrrad", value: (data.sunEnergy / 500) * 100, icon: "bike.png" },
      { name: "Liegerad", value: (data.sunEnergy / 330) * 100, icon: "bike.png", hidden: true },
      { name: "Velomobil", value: (data.sunEnergy / 250) * 100, icon: "velomobile.png", hidden: true },
   ];
   function updateBars() {
      button.setText(kmBarsIgnoreHidden ? "Alle ausblenden" : "Alle einblenden");
      const max = Math.max(...ranges.map((item) => (item.hidden && !kmBarsIgnoreHidden ? 0 : item.value)));
      kmBars.forEach((bar) => bar.setMax(max));
      Object.values(ranges).forEach((data, index) => {
         kmBars[index].setValue(data.value, true);
         kmBars[index].setInfoText(data.name);
         kmBars[index].setIcon(data.icon);
         const isHidden = data.hidden && !kmBarsIgnoreHidden;
         kmBars[index].setVisibility(!isHidden);
      });
   }
   const button = DOM.select("kmBarsAllButton");
   button.onClick(() => {
      kmBarsIgnoreHidden = !kmBarsIgnoreHidden;
      updateBars();
   });
   updateBars();

   // Battery Health
   const batteryChargeEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = Math.abs(Math.min(a.p_batt, 0));
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   const batteryDischargeEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = Math.max(a.p_batt, 0);
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   const totalEnergy = batteryChargeEnergy + batteryDischargeEnergy;
   const batteryCycles = totalEnergy / (2 * constants.battery.capacity);
   let deltaSoc = 0;
   data.values.forEach((a, index) => {
      if (index > 0) {
         deltaSoc += Math.abs(a.batt_soc - data.values[index - 1].batt_soc);
      }
   });
   const totalCapacity = totalEnergy / (deltaSoc / 100);
   const stateOfHealth = (totalCapacity / constants.battery.capacity) * 100;
   const maxSoc = Math.max(...data.values.map((a) => a.batt_soc));
   const minSoc = Math.min(...data.values.map((a) => a.batt_soc));
   const avgSoc = Math.round(data.values.reduce((acc, a) => acc + a.batt_soc, 0) / data.values.length);

   DOM.select("batteryChargeText").setText((batteryChargeEnergy / 1000).toThreeDecimalString());
   DOM.select("batteryDischargeText").setText((batteryDischargeEnergy / 1000).toThreeDecimalString());
   DOM.select("batteryCyclesText").setText((Math.round(batteryCycles * 100) / 100).toLocaleString("de-DE"));
   DOM.select("batterySoHText").setText(Math.round(stateOfHealth));
   DOM.select("maxBatterySoCText").setText(Math.round(maxSoc));
   DOM.select("minBatterySoCText").setText(Math.round(minSoc));
   DOM.select("avgBatterySoCText").setText(Math.round(avgSoc));

   // Other fun statistics
   const numberOfSmartphoneCharges = Math.round(data.sunEnergy / 15);
   debugText.appendText(`\n${numberOfSmartphoneCharges}x Smartphone laden`);
   const lossesEnergy =
      data.values.reduce((acc, a) => {
         const timeDiff = a.timestamp_end - a.timestamp_start;
         const power = a.p_losses;
         return acc + power * timeDiff;
      }, 0) / 3_600_000;
   debugText.appendText(`\n${(lossesEnergy / 1000).toThreeDecimalString()} kWh Verluste (Eigenverbrauch WR, Effizienz)`);
}
