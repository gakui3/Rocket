import * as BABYLON from '@babylonjs/core';
import { Engine } from 'babylonjs';
declare var noise: any;

class ParticleData {
  lifeTime: number;
  lifeTimeCounter: number;
  opacity: number;
  rotateValue: BABYLON.Vector3;

  constructor() {
    this.lifeTime = 0.0;
    this.lifeTimeCounter = 0.0;
    this.opacity = 0.0;
    this.rotateValue = new BABYLON.Vector3(0, 0, 0);
    this.reset();
  }

  reset() {
    this.lifeTime = BABYLON.Scalar.RandomRange(1.8, 3.3);
    this.opacity = 0.0;
    this.lifeTimeCounter = 0.0;
    // particleのrotateの値
    this.rotateValue = new BABYLON.Vector3(
      BABYLON.Scalar.RandomRange(-0.0075, -0.0075),
      BABYLON.Scalar.RandomRange(-0.0075, 0.0075),
      BABYLON.Scalar.RandomRange(-0.0075, 0.0075)
    );
  }
}

class RocketParticles {
  particleCount: number;
  root: any;
  offset: BABYLON.Vector3;
  isEmit: boolean;
  smokeModels: BABYLON.AssetContainer[];

  constructor(particleCount: number) {
    this.particleCount = particleCount;
    // this.root
    this.offset = BABYLON.Vector3.Zero();
    this.isEmit = true;
    this.smokeModels = [];
  }

  // setPosition (p) {
  //   position = p
  //   // sps.setParticles()
  // }

  setRoot(_parent: any, _offset: any) {
    this.root = _parent;
    this.offset = _offset;
  }

  start() {
    // for (let p = 0; p < sps.nbParticles; p++) {
    //   particleDatas[sps.particles[p].idx].reset();
    //   sps.particles[p].scaling = new BABYLON.Vector3(0, 0, 0);
    // }
    this.isEmit = true;
  }

  stop() {
    this.isEmit = false;
  }

  // 引数にBABYLON.sceneとBABYLON.engineが必要です
  // BABYLON.sceneはparticleを追加するため。BABYLON.engineはdela.timeを取得するため。
  // sceneからもdelta.timeが取得できるのですがレンダリング後からじゃないと0になってしまいengineから取得しました。
  init(scene: BABYLON.Scene, smokeModels: BABYLON.AssetContainer[]) {
    const sps: BABYLON.SolidParticleSystem = new BABYLON.SolidParticleSystem('SPS', scene, {
      useModelMaterial: true,
    });

    // パラメーター
    const particleCountPerShape = this.particleCount;
    const particleInitOpacity = 1.0;
    const smokeScaleRange = new BABYLON.Vector2(0.04, 0.05);
    const smokeFadeInMultipleRate = 3;
    const smokeFadeOutMultipleRate = 1.5;

    this.smokeModels = smokeModels;

    // 煙のマテリアルの作成
    const material = new BABYLON.StandardMaterial('smokeMaterial', scene);
    material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    material.ambientColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    material.alpha = particleInitOpacity;
    material.specularPower = 2;

    // 煙マテリアルのFresnelの設定
    material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    material.reflectionFresnelParameters.bias = 0.1;
    material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    material.emissiveFresnelParameters.bias = 0.1;
    material.emissiveFresnelParameters.power = 2;
    material.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
    material.emissiveFresnelParameters.rightColor = new BABYLON.Color3(0.8, 0.8, 0.8);


    for (let i = 0; i < this.smokeModels.length; i++){
      this.smokeModels[i].meshes[1].material = material;
    }

    // spsにsmokemeshを追加
    for (let i = 0; i < 4; i++){
      sps.addShape(<BABYLON.Mesh>this.smokeModels[i].meshes[1], particleCountPerShape);
    }

    const particleDatas: ParticleData[] = [];
    for (let i = 0; i < particleCountPerShape * 4; i++) {
      const pd: ParticleData | null = new ParticleData();
      particleDatas.push(pd);
    }

    sps.buildMesh();
    sps.mesh.hasVertexAlpha = true;

    function map(value: number, low1: number, high1: number, low2: number, high2: number) {
      return low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);
    }

    scene.registerBeforeRender(function () {
      sps.setParticles();
    });

    // particleの初期化処理
    sps.recycleParticle = function (this: RocketParticles, particle: any): any {
      if (!this.isEmit) {
        return;
      }
      particleDatas[particle.idx].reset();
      // particle.position.x = position.x + (Math.random() - 0.5) * 2
      // particle.position.y = position.y
      // particle.position.z = position.z + (Math.random() - 0.5) * 2
      particle.position.x = this.root.position.x + (Math.random() - 0.5) * 2 + this.offset.x;
      particle.position.y = this.root.position.y + this.offset.y;
      particle.position.z = this.root.position.z + (Math.random() - 0.5) * 2 + this.offset.z;

      particle.velocity.x = (Math.random() - 0.5) * 0.06;
      particle.velocity.y = -(Math.random() + 0.5) * 0.05;
      particle.velocity.z = (Math.random() - 0.5) * 0.06;

      particle.rotation.x = Math.random() * Math.PI * 2;
      particle.rotation.y = Math.random() * Math.PI * 2;
      particle.rotation.z = Math.random() * Math.PI * 2;

      const s = BABYLON.Scalar.RandomRange(smokeScaleRange.x, smokeScaleRange.y);
      particle.scaling = new BABYLON.Vector3(s, s, s);
    }.bind(this);

    sps.initParticles = function () {
      for (let p = 0; p < sps.nbParticles; p++) {
        sps.particles[p].scaling = new BABYLON.Vector3(0, 0, 0);
      }
    };

    // particleのアップデート処理
    sps.updateParticle = function (particle: any): any {
      const engine = scene.getEngine();
      const dt = Math.ceil(engine.getDeltaTime()) * 0.001;
      particleDatas[particle.idx].lifeTimeCounter += dt;

      // particleの現在のlifetimeを0~1にリマップして下記のアニメーションで使用するため
      const v = map(
        particleDatas[particle.idx].lifeTimeCounter,
        0,
        particleDatas[particle.idx].lifeTime,
        0,
        1
      );

      particle.rotation.x += particleDatas[particle.idx].rotateValue.x;
      particle.rotation.y += particleDatas[particle.idx].rotateValue.y;
      particle.rotation.z += particleDatas[particle.idx].rotateValue.z;

      // 煙のアニメーションの設定
      if (v < 0.2) {
        let o = particleDatas[particle.idx].opacity;
        o += dt * smokeFadeInMultipleRate;
        o = BABYLON.Scalar.Clamp(o, 0, particleInitOpacity);
        if (particle.color !== null) {
          particle.color.a = o;
        }
        particleDatas[particle.idx].opacity = o;
      }
      if (v > 0.7) {
        particleDatas[particle.idx].opacity -= dt * smokeFadeOutMultipleRate;
        if (particle.color !== null) {
          particle.color.a = particleDatas[particle.idx].opacity;
        }
      }
      if (v > 1.0) {
        this.recycleParticle(particle);
        return;
      }

      // emitされてからparticleのvelocity.yを徐々に遅くするため(なくてもいいかも？)
      particle.velocity.y *= 0.999;

      // noiseを追加
      particle.velocity.x +=
        noise.perlin2(particle.position.x / 100, particle.position.z / 100) * 0.002;
      particle.velocity.y +=
        noise.perlin2(particle.position.z / 100, particle.position.y / 100) * -0.00025;
      particle.velocity.z +=
        noise.perlin2(particle.position.y / 100, particle.position.x / 100) * 0.002;

      particle.position.addInPlace(particle.velocity);
    }

    sps.initParticles();

    update();

    function update() {
      requestAnimationFrame(update);
      sps.setParticles();
    }
  }
}

export { RocketParticles };
