import * as BABYLON from "@babylonjs/core";

let position, sps;
let isEmit = true;

class ParticleData {
  constructor () {
    this.lifeTime = 0.0;
    this.lifeTimeCounter = 0.0;
    this.opacity = 0.0;
    this.rotateValue = new BABYLON.Vector3(0, 0, 0);
    this.reset();
  }

  reset () {
    this.lifeTime = BABYLON.Scalar.RandomRange(1.8, 3.3);
    this.opacity = 0.0;
    this.lifeTimeCounter = 0.0;
    // particleのrotateの値
    this.rotateValue = new BABYLON.Vector3(BABYLON.Scalar.RandomRange(-0.0075, -0.0075), BABYLON.Scalar.RandomRange(-0.0075, 0.0075), BABYLON.Scalar.RandomRange(-0.0075, 0.0075));
  }
}

class RocketParticles {
  setPosition (p) {
    position = p;
    sps.setParticles();
  }

  start () {
    isEmit = true;
  }

  stop () {
    isEmit = false;
  }

  // 引数にBABYLON.sceneとBABYLON.engineが必要です
  // BABYLON.sceneはparticleを追加するため。BABYLON.engineはdela.timeを取得するため。
  // sceneからもdelta.timeが取得できるのですがレンダリング後からじゃないと0になってしまいengineから取得しました。
  async init (scene, engine) {
    sps = new BABYLON.SolidParticleSystem("SPS", scene, { useModelMaterial: true });
    position = BABYLON.Vector3.Zero();

    // パラメーター
    const particleCountPerShape = 7;
    const particleInitOpacity = 1.0;
    const smokeScaleRange = new BABYLON.Vector2(0.04, 0.05);
    const smokeFadeInMultipleRate = 3;
    const smokeFadeOutMultipleRate = 1.5;

    // 煙モデルをimport
    const smoke01 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke1.gltf");
    const smoke02 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke2.gltf");
    const smoke03 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke3.gltf");
    const smoke04 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke4.gltf");
    const smoke05 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke5.gltf");

    // 煙のマテリアルの作成
    const material = new BABYLON.StandardMaterial("smokeMaterial", scene);
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

    smoke01.meshes[1].material = material;
    smoke02.meshes[1].material = material;
    smoke03.meshes[1].material = material;
    smoke04.meshes[1].material = material;
    smoke05.meshes[1].material = material;

    // spsにsmokemeshを追加
    sps.addShape(smoke01.meshes[1], particleCountPerShape);
    sps.addShape(smoke02.meshes[1], particleCountPerShape);
    sps.addShape(smoke03.meshes[1], particleCountPerShape);
    sps.addShape(smoke04.meshes[1], particleCountPerShape);
    // sps.addShape(s5.meshes[1], particleCount);

    const particleDatas = [];
    for (let i = 0; i < particleCountPerShape * 4; i++) {
      const pd = new ParticleData();
      particleDatas.push(pd);
    }

    sps.buildMesh();
    sps.mesh.hasVertexAlpha = true;

    function map (value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    scene.registerBeforeRender(function () {
      sps.setParticles();
    });

    // particleの初期化処理
    sps.recycleParticle = function (particle) {
      if (!isEmit) { return; }
      particleDatas[particle.idx].reset();
      particle.position.x = position.x + (Math.random() - 0.5) * 2;
      particle.position.y = position.y;
      particle.position.z = position.z + (Math.random() - 0.5) * 2;

      particle.velocity.x = (Math.random() - 0.5) * 0.06;
      particle.velocity.y = -(Math.random() + 0.5) * 0.05;
      particle.velocity.z = (Math.random() - 0.5) * 0.06;

      particle.rotation.x = Math.random() * Math.PI * 2;
      particle.rotation.y = Math.random() * Math.PI * 2;
      particle.rotation.z = Math.random() * Math.PI * 2;

      const s = BABYLON.Scalar.RandomRange(smokeScaleRange.x, smokeScaleRange.y);
      particle.scaling = new BABYLON.Vector3(s, s, s);
    };

    sps.initParticles = function () {
      for (let p = 0; p < sps.nbParticles; p++) {
        sps.particles[p].scaling = new BABYLON.Vector3(0, 0, 0);
      }
    };

    // particleのアップデート処理
    sps.updateParticle = function (particle) {
      const dt = Math.ceil(engine.getDeltaTime()) * 0.001;
      particleDatas[particle.idx].lifeTimeCounter += dt;

      // particleの現在のlifetimeを0~1にリマップして下記のアニメーションで使用するため
      const v = map(particleDatas[particle.idx].lifeTimeCounter, 0, particleDatas[particle.idx].lifeTime, 0, 1);

      particle.rotation.x += particleDatas[particle.idx].rotateValue.x;
      particle.rotation.y += particleDatas[particle.idx].rotateValue.y;
      particle.rotation.z += particleDatas[particle.idx].rotateValue.z;

      // 煙のアニメーションの設定
      if (v < 0.2) {
        let o = particleDatas[particle.idx].opacity;
        o += dt * smokeFadeInMultipleRate;
        o = BABYLON.Scalar.Clamp(o, 0, particleInitOpacity);
        particle.color.a = o;
        particleDatas[particle.idx].opacity = o;
      }
      if (v > 0.7) {
        particleDatas[particle.idx].opacity -= dt * smokeFadeOutMultipleRate;
        particle.color.a = particleDatas[particle.idx].opacity;
      }
      if (v > 1.0) {
        this.recycleParticle(particle);
        return;
      }

      // emitされてからparticleのvelocity.yを徐々に遅くするため(なくてもいいかも？)
      particle.velocity.y *= 0.999;

      // noiseを追加
      particle.velocity.x += noise.perlin2(particle.position.x / 100, particle.position.z / 100) * 0.002;
      particle.velocity.y += noise.perlin2(particle.position.z / 100, particle.position.y / 100) * -0.002;
      particle.velocity.z += noise.perlin2(particle.position.y / 100, particle.position.x / 100) * 0.002;

      particle.position.addInPlace(particle.velocity);
    };

    sps.initParticles();
  }
}

export { RocketParticles };
