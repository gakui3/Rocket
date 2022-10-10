import * as BABYLON from "@babylonjs/core";

let position, sps;

class ParticleData {
  constructor () {
    this.lifeTime = 0;
    this.timer = 0;
    this.reset();
  }

  reset () {
    this.lifeTime = BABYLON.Scalar.RandomRange(2, 4);
    this.timer = 0;
  }
}

class RocketParticles {
  async init (scene) {
    sps = new BABYLON.SolidParticleSystem("SPS", scene, { useModelMaterial: true });
    this.timer = 0.0;
    // this.position = new BABYLON.Vector3(0, 0, 0);
    // const position = BABYLON.Vector3.Zero();
    position = BABYLON.Vector3.Zero();
    const particleCount = 7;
    const sphere = BABYLON.CreateSphere("sphere1", { segments: 5, diameter: 1 }, scene);

    const s1 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke1.gltf");
    const s2 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke2.gltf");
    const s3 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke3.gltf");
    const s4 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke4.gltf");
    const s5 = await BABYLON.SceneLoader.LoadAssetContainerAsync("./assets/", "Rocket - Smoke5.gltf");

    // create material
    const material = new BABYLON.StandardMaterial("kosh", scene);
    material.diffuseColor = new BABYLON.Color3(1, 1, 1);
    material.emissiveColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    material.ambientColor = new BABYLON.Color3(0.7, 0.7, 0.7);
    material.alpha = 0.85;
    material.specularPower = 2;

    // Fresnel
    material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    material.reflectionFresnelParameters.bias = 0.1;
    material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    material.emissiveFresnelParameters.bias = 0.1;
    material.emissiveFresnelParameters.power = 2;
    material.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
    material.emissiveFresnelParameters.rightColor = new BABYLON.Color3(0.8, 0.8, 0.8);

    s1.meshes[1].material = material;
    s2.meshes[1].material = material;
    s3.meshes[1].material = material;
    s4.meshes[1].material = material;
    s5.meshes[1].material = material;

    sps.addShape(s1.meshes[1], particleCount);
    sps.addShape(s2.meshes[1], particleCount);
    sps.addShape(s3.meshes[1], particleCount);
    sps.addShape(s4.meshes[1], particleCount);
    sps.addShape(s5.meshes[1], particleCount);

    const particleDatas = [];
    for (let i = 0; i < particleCount * 5; i++) {
      const pd = new ParticleData();
      particleDatas.push(pd);
    }

    sphere.dispose();
    sps.buildMesh();

    scene.registerBeforeRender(function () {
      sps.setParticles();
    });

    sps.recycleParticle = function (particle) {
      particle.position.x = position.x + (Math.random() - 0.5) * 2;
      particle.position.y = position.y;
      particle.position.z = position.z + (Math.random() - 0.5) * 2;
      //   particle.position.x = (Math.random() - 0.5) * 2;
      //   particle.position.y = 3;
      //   particle.position.z = (Math.random() - 0.5) * 2;

      particle.velocity.x = (Math.random() - 0.5) * 0.08;
      particle.velocity.y = -(Math.random() + 0.5) * 0.05;
      particle.velocity.z = (Math.random() - 0.5) * 0.08;

      particle.rotation.x = Math.random() * Math.PI * 2;
      particle.rotation.y = Math.random() * Math.PI * 2;
      particle.rotation.z = Math.random() * Math.PI * 2;

      const s = 0.02;// BABYLON.Scalar.Clamp(Math.random() * 5, 0.02, 0.04);
      particle.scaling = new BABYLON.Vector3(s, s, s);
    };

    sps.initParticles = function () {
      for (let p = 0; p < sps.nbParticles; p++) {
        sps.particles[p].scaling = new BABYLON.Vector3(0, 0, 0);
      }
    };

    sps.updateParticle = function (particle) {
      particleDatas[particle.idx].timer += 1;
      particleDatas[particle.idx].lifeTime -= 0.03;
      if (particleDatas[particle.idx].lifeTime < 0) {
        this.recycleParticle(particle);
        particleDatas[particle.idx].reset();
        return;
      }

      particle.velocity.y *= 0.999;
      particle.scaling = particle.scaling.multiply(new BABYLON.Vector3(1.01, 1.01, 1.01));
      particle.position.addInPlace(particle.velocity); // update particle new position
    };

    sps.initParticles();
    sps.computeParticleVertex = true;
  }

  setPosition (p) {
    position = p;
    sps.setParticles();
  }
}

export { RocketParticles };
