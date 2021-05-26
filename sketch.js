let model;
let loadDataBtn, inputTrainingData;
let envelope, wave;
let modelOptions = {
  inputs: ["x", "y"],
  outputs: ["label"],
  task: "classification",
  debug: "true", // Make this toggleable by the user
};
let targetNotation = "C";
let trainingBtn, saveDataBtn;
let programState = "collection";

let notesLookupTable = {
  C: 1046.502,
  D: 1174.659,
  E: 659.2551,
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
  createCanvas(800, 800);
  background(0);

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
  trainingBtn.position(0, 0);
  trainingBtn.mousePressed(trainModelWithUserData);

  saveDataBtn = createButton("Save the data");
  saveDataBtn.position(200, 0);
  saveDataBtn.mousePressed(saveTrainingData);

  loadDataBtn = createFileInput(handleDataLoading);
  loadDataBtn.position(400, 0);
}

// This is an onClick function for the "trainingBtn"
function trainModelWithUserData() {
  let trainingOptions = {
    epochs: 100,
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
}

function keyPressed() {
  if (programState === "collection") {
    if (key === "d" || key === "e" || key === "c") {
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
