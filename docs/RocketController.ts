import * as BABYLON from '@babylonjs/core';
// import GUI from 'lil-gui';
import { RocketParticles } from './RocketParticles';

const params = {
  accelerationXZ: 5,
  accelerationY: 0.1,
  velocityAttenuationRateXZ: 0.993,
};

class RocketController {
  private animationID: any;
  private position: BABYLON.Vector3;
  private velocity: BABYLON.Vector3;
  private positionInit: BABYLON.Vector3
  private rocketParticles: RocketParticles
  private obj: BABYLON.Mesh | null
  private dt: any = 0.03;
  
  constructor(obj: BABYLON.Mesh, scene: BABYLON.Scene, engine: BABYLON.Engine) {
    this.obj = obj;
    this.rocketParticles = new RocketParticles(15);
    this.rocketParticles.init(scene, engine);
    this.rocketParticles.setRoot(
      obj,
      new BABYLON.Vector3(58.5, -13, 7).add(new BABYLON.Vector3(-30, 15, 0))
    );
    this.rocketParticles.stop();

    this.position = obj.position.clone();
    this.positionInit = obj.position.clone();
    this.velocity = new BABYLON.Vector3(0, -0.5, 0);
    this.addkeyEvent();
    this.update();

    // カメラを動かすためにキーバインドを
    // wasd: 移動
    // e : インジェクション
    // r : リセット
    // に設定してあります。適宜変更して下さい。
  }
  
  private updatePosition(obj: BABYLON.Mesh) {
    let vy = this.velocity.y - params.accelerationY * this.dt;
    vy = BABYLON.Scalar.Clamp(vy, -8, -0.5);
    this.velocity.y = vy;

    this.velocity.x *= params.velocityAttenuationRateXZ;
    this.velocity.z *= params.velocityAttenuationRateXZ;

    this.position.x = this.position.x + this.velocity.x * this.dt;
    this.position.z = this.position.z + this.velocity.z * this.dt;
    this.position.y = this.position.y + this.velocity.y * this.dt;

    obj.position = this.position;
  }

  private update() {
    this.animationID = requestAnimationFrame(() => this.update())
    if (this.obj !== null) {
      this.updatePosition(this.obj);
    }
  }

  private addkeyEvent() {
    document.addEventListener('keydown', this.keyDownEvent, true);
    document.addEventListener('keypress', this.keyPressEvent, true);
    document.addEventListener('keyup', this.keyUpEvent, true);
  }

  private removekeyEvent() {
    document.removeEventListener('keydown', this.keyDownEvent, true);
    document.removeEventListener('keypress', this.keyPressEvent, true);
    document.removeEventListener('keyup', this.keyUpEvent, true);
  }

  private keyDownEvent = (event : KeyboardEvent) => {
    if (event.key === 'w') {
      this.upKeyDown();
    }
    if (event.key === 's') {
      this.downKeyDown();
    }
    if (event.key === 'd') {
      this.rightKeyDown();
    }
    if (event.key === 'a') {
      this.leftKeyDown();
    }
    if (event.key === 'e') {
      this.riseKeyDown();
    }
    if (event.key === 'r') {
      this.reset();
    }
  }

  private keyPressEvent = (event: KeyboardEvent) => {
    if (event.key === 'e') {
      this.rocketParticles.start();
    }
  }

  private keyUpEvent = (event: KeyboardEvent) => {
    if (event.key === 'e') {
      this.rocketParticles.stop();
    }
  }

  private rightKeyDown() {
    this.velocity.x = this.velocity.x + params.accelerationXZ * this.dt;
  }
  private leftKeyDown() {
    this.velocity.x = this.velocity.x - params.accelerationXZ * this.dt;
  }
  private upKeyDown() {
    this.velocity.z = this.velocity.z + params.accelerationXZ * this.dt;
  }
  private downKeyDown() {
    this.velocity.z = this.velocity.z - params.accelerationXZ * this.dt;
  }
  private riseKeyDown() {
    this.velocity.y = this.velocity.y + params.accelerationY * 35 * this.dt;
  }
  private reset() {
    this.position = this.positionInit.clone();
    this.velocity = new BABYLON.Vector3(0, -0.5, 0);
  }

  public destroy() {
    cancelAnimationFrame(this.animationID);
    this.removekeyEvent();
    this.obj = null;
  }
}

export { RocketController };