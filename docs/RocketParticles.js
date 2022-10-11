import * as BABYLON from "@babylonjs/core";

let position, sps;

class ParticleData {
  constructor () {
    this.lifeTime = 0.0;
    this.lifeTimeCounter = 0.0;
    this.opacity = 0.0;
    this.reset();
  }

  reset () {
    this.lifeTime = BABYLON.Scalar.RandomRange(1, 3);
    this.opacity = 0.0;
    this.lifeTimeCounter = 0.0;
  }
}

class RocketParticles {
  setPosition (p) {
    position = p;
    sps.setParticles();
  }

  async init (scene, engine) {
    sps = new BABYLON.SolidParticleSystem("SPS", scene, { useModelMaterial: true });

    position = BABYLON.Vector3.Zero();
    const particleCount = 7;
    const particleInitOpacity = 0.85;
    const sphere = BABYLON.CreateSphere("sphere1", { segments: 5, diameter: 1 }, scene);

    const smoke01 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke1.gltf");
    const smoke02 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke2.gltf");
    const smoke03 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke3.gltf");
    const smoke04 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke4.gltf");
    const smoke05 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke5.gltf");

    // create material
    const material = new BABYLON.StandardMaterial("smokeMaterial", scene);
    material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    material.ambientColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    material.alpha = 0.85;
    material.specularPower = 2;

    // Fresnelの設定
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
    sps.addShape(smoke01.meshes[1], particleCount);
    sps.addShape(smoke02.meshes[1], particleCount);
    sps.addShape(smoke03.meshes[1], particleCount);
    sps.addShape(smoke04.meshes[1], particleCount);
    // sps.addShape(s5.meshes[1], particleCount);

    const particleDatas = [];
    for (let i = 0; i < particleCount * 4; i++) {
      const pd = new ParticleData();
      particleDatas.push(pd);
    }

    sphere.dispose();
    sps.buildMesh();
    sps.mesh.hasVertexAlpha = true;

    function map (value, low1, high1, low2, high2) {
      return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    }

    scene.registerBeforeRender(function () {
      sps.setParticles();
    });

    sps.recycleParticle = function (particle) {
      particle.position.x = position.x + (Math.random() - 0.5) * 2;
      particle.position.y = position.y;
      particle.position.z = position.z + (Math.random() - 0.5) * 2;

      particle.velocity.x = (Math.random() - 0.5) * 0.06;
      particle.velocity.y = -(Math.random() + 0.5) * 0.05;
      particle.velocity.z = (Math.random() - 0.5) * 0.06;

      particle.rotation.x = Math.random() * Math.PI * 2;
      particle.rotation.y = Math.random() * Math.PI * 2;
      particle.rotation.z = Math.random() * Math.PI * 2;

      particle.color.a = 0;

      const s = BABYLON.Scalar.Clamp(Math.random() * 5, 0.03, 0.04);
      particle.scaling = new BABYLON.Vector3(s, s, s);
    };

    sps.initParticles = function () {
      for (let p = 0; p < sps.nbParticles; p++) {
        sps.particles[p].scaling = new BABYLON.Vector3(0, 0, 0);
      }
    };

    sps.updateParticle = function (particle) {
      const dt = Math.ceil(engine.getDeltaTime()) * 0.001;
      particleDatas[particle.idx].lifeTimeCounter += dt;

      const v = map(particleDatas[particle.idx].lifeTimeCounter, 0, particleDatas[particle.idx].lifeTime, 0, 1);

      if (v < 0.2) {
        let o = particleDatas[particle.idx].opacity;
        o += dt * 3;
        o = BABYLON.Scalar.Clamp(o, 0, particleInitOpacity);
        particle.color.a = o;
        particleDatas[particle.idx].opacity = o;
      }
      if (v > 0.9) {
        particleDatas[particle.idx].opacity -= dt;
        particle.color.a = particleDatas[particle.idx].opacity;
      }
      if (v > 1.0) {
        this.recycleParticle(particle);
        particleDatas[particle.idx].reset();
        return;
      }

      particle.velocity.y *= 0.999;
      particle.position.addInPlace(particle.velocity);
    };

    sps.initParticles();
    sps.computeParticleVertex = true;
  }
}

export { RocketParticles };
