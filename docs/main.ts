import * as BABYLON from '@babylonjs/core';
import { RocketParticles } from './RocketParticles';
import { RocketController } from './RocketController';
import '@babylonjs/loaders/glTF';

async function start() {
  const canvas: HTMLInputElement = <HTMLInputElement>document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas);
  const scene = new BABYLON.Scene(engine);
  const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 50, -50), scene);
  camera.setTarget(BABYLON.Vector3.Zero());
  let root: BABYLON.Mesh;
  let init: boolean = false;
  let rocketParticles: RocketParticles;
  let storage: any = {};
  // ロケットのモデルのoriginがずれてたので適当な調整用のoffset値です
  const offset = new BABYLON.Vector3(-30, 15, 0);

  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.7;
  light.specular = new BABYLON.Color3(0.05, 0.05, 0.05);
  light.diffuse = new BABYLON.Color3(0.8, 0.8, 0.8);

  const light2 = new BABYLON.DirectionalLight('dir01', new BABYLON.Vector3(-0.1, -2, 0.1), scene);
  light2.position = new BABYLON.Vector3(2, 40, 2);
  light2.intensity = 0.5;
  const smokeModels: BABYLON.AssetContainer[] = [];


  //smokeのモデルを読み込み
  const smoke01 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
    './assets/',
    'Rocket - Smoke1.gltf'
  );
  smokeModels.push(smoke01);

  const smoke02 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
    './assets/',
    'Rocket - Smoke2.gltf'
  );
  smokeModels.push(smoke02);

  const smoke03 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
    './assets/',
    'Rocket - Smoke3.gltf'
  );
  smokeModels.push(smoke03);

  const smoke04 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
    './assets/',
    'Rocket - Smoke4.gltf'
  );
  smokeModels.push(smoke04);

  const smoke05 = await BABYLON.SceneLoader.LoadAssetContainerAsync(
    './assets/',
    'Rocket - Smoke5.gltf'
  );
  smokeModels.push(smoke05);


  // ロケットのモデルを追加
  BABYLON.SceneLoader.Append('./assets/', 'Rocket - Launch.glb', scene, async (obj) => {
    root = <BABYLON.Mesh>scene.getMeshByName('__root__');
    root.scaling = new BABYLON.Vector3(1, 1, 1);
    root.position = offset;

    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light2);
    shadowGenerator.addShadowCaster(root);
    shadowGenerator.useExponentialShadowMap = true;

    obj.animationGroups[1].start(true);
    init = true;

    //rocketコントローラーのインスタンスを作成
    storage.instance = new RocketController(root, scene, smokeModels.concat());

    // particleのインスタンスを作成
    rocketParticles = new RocketParticles(7);
    
    rocketParticles.init(scene, smokeModels.concat());
    rocketParticles.setRoot(root, new BABYLON.Vector3(58.5, -13, 7).add(offset));
    rocketParticles.start();
  });


  // grand planeの追加
  const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 40, height: 40 }, scene);
  ground.position = new BABYLON.Vector3(0, -20, 0);
  const groundMaterial = new BABYLON.StandardMaterial('ground', scene);
  groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  ground.material = groundMaterial;
  ground.receiveShadows = true;

  engine.runRenderLoop(() => {
    if (!init) {
      return;
    }

    scene.render();
  });
}

start();