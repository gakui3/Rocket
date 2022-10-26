import * as BABYLON from '@babylonjs/core';
// import GUI from 'lil-gui';
import { RocketParticles } from './RocketParticles';

let dt: any = 0.03;
let velocity: BABYLON.Vector3;
let position: BABYLON.Vector3;
let positionInit: BABYLON.Vector3;

const params = {
  accelerationXZ: 5,
  accelerationY: 0.1,
  velocityAttenuationRateXZ: 0.993,
};

class RocketController {
  constructor(obj: BABYLON.Mesh, scene: BABYLON.Scene, engine: BABYLON.Engine) {
    //debugようにguiを設定していました。不要でしたら削除して下さい。
    // const gui = new GUI();
    // gui.add(params, 'accelerationXZ', 1.0, 10.0, 0.1);
    // gui.add(params, 'accelerationY', 0.05, 1.0, 0.01);
    // gui.add(params, 'velocityAttenuationRateXZ', 0.99, 0.999, 0.001);

    const rocketParticles = new RocketParticles(15);
    rocketParticles.init(scene, engine);
    rocketParticles.setRoot(
      obj,
      new BABYLON.Vector3(58.5, -13, 7).add(new BABYLON.Vector3(-30, 15, 0))
    );
    rocketParticles.stop();

    dt = 0.03;
    position = obj.position.clone();
    positionInit = obj.position.clone();
    velocity = new BABYLON.Vector3(0, -0.5, 0);
    addkeyEvent();
    update();
    function update() {
      requestAnimationFrame(update);
      updatePosition(obj);
    }

    // カメラを動かすためにキーバインドを
    // wasd: 移動
    // e : インジェクション
    // r : リセット
    // に設定してあります。適宜変更して下さい。
    function addkeyEvent() {
      document.addEventListener('keydown', (event) => {
        if (event.key === 'w') {
          upKeyDown();
        }
        if (event.key === 's') {
          downKeyDown();
        }
        if (event.key === 'd') {
          rightKeyDown();
        }
        if (event.key === 'a') {
          leftKeyDown();
        }
        if (event.key === 'e') {
          riseKeyDown();
        }
        if (event.key === 'r') {
          reset();
        }
      });
      document.addEventListener('keypress', (event) => {
        if (event.key === 'e') {
          rocketParticles.start();
        }
      });
      document.addEventListener('keyup', (event) => {
        if (event.key === 'e') {
          rocketParticles.stop();
        }
      });
    }

    function updatePosition(obj: BABYLON.Mesh) {
      let vy = velocity.y - params.accelerationY * dt;
      vy = BABYLON.Scalar.Clamp(vy, -8, -0.5);
      velocity.y = vy;

      velocity.x *= params.velocityAttenuationRateXZ;
      velocity.z *= params.velocityAttenuationRateXZ;

      position.x = position.x + velocity.x * dt;
      position.z = position.z + velocity.z * dt;
      position.y = position.y + velocity.y * dt;

      obj.position = position;
    }

    function rightKeyDown() {
      velocity.x = velocity.x + params.accelerationXZ * dt;
    }
    function leftKeyDown() {
      velocity.x = velocity.x - params.accelerationXZ * dt;
    }
    function upKeyDown() {
      velocity.z = velocity.z + params.accelerationXZ * dt;
    }
    function downKeyDown() {
      velocity.z = velocity.z - params.accelerationXZ * dt;
    }
    function riseKeyDown() {
      velocity.y = velocity.y + params.accelerationY * 35 * dt;
    }
    function reset() {
      position = positionInit.clone();
      velocity = new BABYLON.Vector3(0, -0.5, 0);
    }
  }
}

export { RocketController };
