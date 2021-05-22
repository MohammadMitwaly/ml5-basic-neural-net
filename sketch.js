let model;
let modelOptions = {
  inputs: ["x", "y"],
  outputs: ["label"],
  task: "classification",
  debug: "true", // Make this toggleable by the user
};
let targetNotation = "C";
let trainingBtn;
let programState = "collection";

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
};

function setup() {
  createCanvas(800, 800);
  background(0);
  model = ml5.neuralNetwork(modelOptions);
  trainingBtn = createButton("Train the model!");
  trainingBtn.position(0, 0);
  trainingBtn.mousePressed(trainModelWithUserData);
}

function trainModelWithUserData() {
  let trainingOptions = {
    epochs: 100,
  };
  model.normalizeData();
  programState = "training";
  model.train(trainingOptions, modelIsTraining, modelFinishedTraining);
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
  } else if (programState === "prediction") {
    model.classify(dataPoint, predictionResults);
  }
}
