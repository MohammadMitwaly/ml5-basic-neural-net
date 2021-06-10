let model;
let loadDataBtn, inputTrainingData;
let envelope, wave;
let modelOptions = {
  inputs: ["x", "y"],
  outputs: ["label"],
  task: "classification",
  debug: "true",
};
let trainingEpochs = 100;
let targetNotation = "C";
let trainingBtn, saveDataBtn, debuggingToggle, epochsInput;
let programState = "collection";

let notesLookupTable = {
  C: 523.2511,
  D: 293.6648,
  E: 329.6276,
  F: 349.2282,
  G: 391.9954,
  A: 466.1638,
  B: 493.8833,
};

const modelIsTraining = (epoch, loss) => {
  console.log(
    `This is the ${epoch} epoch, the current loss function value is ${loss}`
  );
};

const modelFinishedTraining = () => {
  console.log(`Model finished training!`);
  programState = "prediction";
};

const predictionResults = (error, results) => {
  if (error) {
    console.error("Failed with the follwing error", error);
    return;
  }
  console.log("Prediction result:", results);
  let predictedLabel = results[0].label;
  stroke(255);
  fill(0, 255, 0, 100);
  ellipse(mouseX, mouseY, 24);
  fill(255);
  noStroke();
  textAlign(CENTER, CENTER);
  text(predictedLabel, mouseX, mouseY);
  playNote(predictedLabel);
};

function setup() {
  createCanvas(windowWidth, 500);
  background("#000000");

  // Set up to play notes
  envelope = new p5.Envelope();
  envelope.setADSR(0.05, 0.1, 0.5, 1);
  envelope.setRange(1.2, 0);
  wave = new p5.Oscillator();
  wave.setType("sine");
  wave.start();
  wave.freq(440);
  wave.amp(envelope);

  model = ml5.neuralNetwork(modelOptions);

  trainingBtn = createButton("Train the model!");
  trainingBtn.mousePressed(trainModelWithUserData);

  saveDataBtn = createButton("Save the data");
  saveDataBtn.mousePressed(saveTrainingData);

  loadDataBtn = createFileInput(handleDataLoading);
  loadDataBtn.style("border-width", "0");
  loadDataBtn.style("outline", "none");
  loadDataBtn.style("border-radius", "2px");
  loadDataBtn.style("padding", "5px");
  loadDataBtn.style("margin", "5px");
  loadDataBtn.style("font-family", "'Farro', 'monospace'");
  loadDataBtn.style("border-radius", "5%");
  createElement("hr");
  debuggingToggle = createCheckbox(
    "Keep this checked to see how the model learns!",
    true
  );
  debuggingToggle.changed(updateDebugStatus);

  //TODO: Add input and button to change amount of epochs being trained
  createElement("label", "Amount of epochs:");
  epochsInput = createInput(trainingEpochs.toString());

  epochsInput.elt.placeholder = "Amount of epochs";
}

function updateDebugStatus() {
  if (this.checked()) {
    modelOptions.debug = true;
  } else {
    modelOptions.debug = false;
  }
}

// This is an onClick function for the "trainingBtn"
function trainModelWithUserData() {
  trainingEpochs =
    epochsInput.value() > 0 ? parseInt(epochsInput.value(), 10) : 100;
  let trainingOptions = {
    epochs: trainingEpochs,
  };
  model.normalizeData();
  programState = "training";
  model.train(trainingOptions, modelIsTraining, modelFinishedTraining);
}

// This is an onClick function for the "saveDataBtn"
function saveTrainingData() {
  model.saveData("training-data");
}

function handleDataLoading(file) {
  // JSONs have the type "application" in P5 for whatever reason
  if (file.type === "application") {
    model.loadData(file.data, dataLoaded);
  } else {
    inputTrainingData = null;
    alert("Input training data must be in JSON format");
  }
}

// Callback function for loading the data file in the model
function dataLoaded() {
  console.log("Data has loaded");
  trainModelWithUserData();
}

function keyPressed() {
  if (programState === "collection") {
    // Covering the base western musical scale
    if (
      key === "c" ||
      key === "d" ||
      key === "e" ||
      key === "f" ||
      key === "g" ||
      key === "a" ||
      key === "b"
    ) {
      targetNotation = key.toUpperCase();
    }
  }
}

function mousePressed() {
  let xCord = mouseX;
  let yCord = mouseY;

  // Object representing one data point in this data-set
  let dataPoint = {
    x: xCord,
    y: yCord,
  };
  // The correct label attribute to be used in training
  let correctLabel = {
    label: targetNotation,
  };

  if (programState === "collection") {
    model.addData(dataPoint, correctLabel);
    stroke(255);
    noFill();
    ellipse(mouseX, mouseY, 24);
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    text(targetNotation, mouseX, mouseY);
    playNote(targetNotation);
  } else if (programState === "prediction") {
    model.classify(dataPoint, predictionResults);
  }
}

function playNote(targetNotation) {
  wave.freq(notesLookupTable[targetNotation]);
  envelope.play();
}
