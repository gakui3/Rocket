import * as BABYLON from "@babylonjs/core";
import { RocketParticles } from "./RocketParticles";
import "@babylonjs/loaders/glTF";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 0, -25), scene);
camera.setTarget(BABYLON.Vector3.Zero());
let root;
let init = false;
const offset = new BABYLON.Vector3(-30, -15, 0);

camera.attachControl(canvas, true);

// テスト用のguiを追加
const startButton = document.createElement("button");
startButton.style.top = "100px";
startButton.style.right = "30px";
startButton.textContent = "start";
startButton.style.width = "100px";
startButton.style.height = "50px";

startButton.setAttribute = ("id", "but");
startButton.style.position = "absolute";
startButton.style.color = "black";

document.body.appendChild(startButton);

const stopButton = document.createElement("button");
stopButton.style.top = "160px";
stopButton.style.right = "30px";
stopButton.textContent = "stop";
stopButton.style.width = "100px";
stopButton.style.height = "50px";

stopButton.setAttribute = ("id", "but");
stopButton.style.position = "absolute";
stopButton.style.color = "black";

document.body.appendChild(stopButton);

const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.7;
light.specular = new BABYLON.Color3(0.05, 0.05, 0.05);
light.diffuse = new BABYLON.Color3(0.8, 0.8, 0.8);

const rocketParticles = new RocketParticles();
rocketParticles.init(scene, engine);

startButton.addEventListener("click", () => {
  rocketParticles.start();
});

stopButton.addEventListener("click", () => {
  rocketParticles.stop();
});

BABYLON.SceneLoader.Append("./assets/", "Rocket - Launch.glb", scene, (obj) => {
  const _root = scene.getMeshByName("__root__");
  _root.scaling = new BABYLON.Vector3(1, 1, 1);
  _root.position = offset;

  root = _root.getChildren()[0];

  obj.animationGroups[2].start(true);
  init = true;
});

// Render every frame
engine.runRenderLoop(() => {
  if (!init) { return; }
  rocketParticles.setPosition(root.position.add(new BABYLON.Vector3(58.5, -6, 7)).add(offset));
  scene.render();
});
