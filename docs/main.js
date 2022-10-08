import * as BABYLON from "@babylonjs/core";
import { RocketParticles } from "./RocketParticles";
import "@babylonjs/loaders/glTF";

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas);
const scene = new BABYLON.Scene(engine);
const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -25), scene);
camera.setTarget(BABYLON.Vector3.Zero());
let root;
let init = false;
const tn = new BABYLON.TransformNode();

camera.attachControl(canvas, true);

const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
light.intensity = 0.7;
light.specular = new BABYLON.Color3(0.05, 0.05, 0.05);
light.diffuse = new BABYLON.Color3(0.8, 0.8, 0.8);

const rocketParticles = new RocketParticles(scene);

BABYLON.SceneLoader.Append("./assets/", "Rocket - Launch.glb", scene, (obj) => {
  const _root = scene.getMeshByName("__root__");
  _root.scaling = new BABYLON.Vector3(1, 1, 1);
  _root.position = new BABYLON.Vector3(-30, -7, 0);

  root = _root.getChildren()[0];

  obj.animationGroups[2].start(true);
  init = true;
});

// Render every frame
engine.runRenderLoop(() => {
  if (!init) { return; }

  rocketParticles.setPosition(root.position.add(new BABYLON.Vector3(28.5, -11.5, 8)));
  scene.render();
});
