setTimeout(() => {
   console.log("NN.....");
   testNN();
}, 5000);

// Tensorflow Test
async function testNN() {
   const model = tf.sequential();
   model.add(tf.layers.dense({ units: 10, inputShape: [1] }));
   model.add(tf.layers.dense({ units: 10, activation: "relu" }));
   model.add(tf.layers.dense({ units: 1 }));

   const optimizer = tf.train.sgd(0.006);
   model.compile({ loss: "meanSquaredError", optimizer: optimizer });

   // Daten normalisiert auf einen Bereich von 0 bis 1
   const xs = tf.tensor2d(
      Array.from({ length: 200 }, (_, i) => [i / 200]),
      [200, 1],
   );
   const ys = tf.tensor2d(
      Array.from({ length: 200 }, (_, i) => [(i + 1) / 200]),
      [200, 1],
   );

   await model.fit(xs, ys, {
      epochs: 100,
      callbacks: {
         onEpochEnd: (epoch, logs) => {
            console.log(`Epoche ${epoch + 1} abgeschlossen. Verlust: ${logs.loss}`);
         },
      },
   });

   // Testdaten ebenfalls normalisieren
   const testInputs = [0, 1, 2, 3, 4, 5].map((x) => x / 200);
   const predictions = model.predict(tf.tensor2d(testInputs, [testInputs.length, 1]));
   const deNormalizedPredictions = predictions.arraySync().map((x) => x[0] * 200 + 1);
   console.log(deNormalizedPredictions);

   // Erwartete Ausgaben wieder in den ursprünglichen Bereich skalieren
   const expectedOutputs = testInputs.map((x) => x * 200 + 1);
   console.log("Expected outputs:", expectedOutputs);
}
