import * as BABYLON from "@babylonjs/core";
// import "@babylonjs/loaders/glTF";

let position, sps;

class ParticleData {
  constructor () {
    this.lifeTime = 0;
    this.timer = 0;
    this.reset();
  }

  reset () {
    this.lifeTime = BABYLON.Scalar.RandomRange(2, 5);
    this.timer = 0;
  }
}

class RocketParticles {
  constructor (scene) {
    sps = new BABYLON.SolidParticleSystem("SPS", scene, { useModelMaterial: true });
    this.timer = 0.0;
    // this.position = new BABYLON.Vector3(0, 0, 0);
    // const position = BABYLON.Vector3.Zero();
    position = BABYLON.Vector3.Zero();
    const particleCount = 15;
    const sphere = BABYLON.CreateSphere("sphere1", { segments: 3, diameter: 1 }, scene);
    console.log(sphere);

    BABYLON.SceneLoader.LoadAssetContainer("./assets/", "Rocket - Smoke1.gltf", scene, (obj) => {
    //   obj.addAllToScene();
    //   const _sps = new BABYLON.SolidParticleSystem("SPS", scene, { useModelMaterial: true });
    //   const m = obj.meshes[1];

      //   const posFcn = function (instance, i) {
      //     instance.position.x = i;

      //     instance.rotationQuaternion = null;
      //     instance.rotation.x = Math.PI / 2;
      //     instance.rotation.y = Math.random() * Math.PI * 2;

      //     instance.scale.x = 0.01;
      //     instance.scale.y = 0.01;
      //     instance.scale.z = 0.01;
      //   };

    //   _sps.addShape(m, particleCount, {
    //     positionFunction: posFcn,
    //   });
    //   _sps.buildMesh();
    });

    // sps.addShape(Container.meshes[1], particleCount, {
    //   positionFunction: posFcn,
    // });

    const material = new BABYLON.StandardMaterial("kosh", scene);
    material.diffuseColor = new BABYLON.Color3(3, 3, 3);
    material.emissiveColor = new BABYLON.Color3(1, 1, 1);
    material.alpha = 0.2;
    material.specularPower = 16;

    // Fresnel
    material.reflectionFresnelParameters = new BABYLON.FresnelParameters();
    material.reflectionFresnelParameters.bias = 0.1;

    material.emissiveFresnelParameters = new BABYLON.FresnelParameters();
    material.emissiveFresnelParameters.bias = 0.6;
    material.emissiveFresnelParameters.power = 4;
    material.emissiveFresnelParameters.leftColor = BABYLON.Color3.White();
    material.emissiveFresnelParameters.rightColor = BABYLON.Color3.Black();

    material.opacityFresnelParameters = new BABYLON.FresnelParameters();
    material.opacityFresnelParameters.leftColor = BABYLON.Color3.White();
    material.opacityFresnelParameters.rightColor = BABYLON.Color3.Black();

    sphere.material = material;
    sps.addShape(sphere, particleCount);

    const particleDatas = [];
    for (let i = 0; i < particleCount; i++) {
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
      particle.velocity.y = -(Math.random() + 0.5) * 0.1;
      particle.velocity.z = (Math.random() - 0.5) * 0.08;

      particle.rotation.x = Math.random() * Math.PI;
      particle.rotation.y = Math.random() * Math.PI;
      particle.rotation.z = Math.random() * Math.PI;

      const s = BABYLON.Scalar.Clamp(Math.random() * 5, 3, 4);
      particle.scaling = new BABYLON.Vector3(s, s, s);
    };

    sps.initParticles = function () {
      for (let p = 0; p < sps.nbParticles; p++) {
        sps.particles[p].scaling = new BABYLON.Vector3(0, 0, 0);
      }
    };

    sps.updateParticle = function (particle) {
      // recycle if touched the ground
      particleDatas[particle.idx].timer += 1;
      particleDatas[particle.idx].lifeTime -= 0.03;
      if (particleDatas[particle.idx].lifeTime < 0) {
        this.recycleParticle(particle);
        particleDatas[particle.idx].reset();
        return;
      }

      //   console.log(particle.idx + " " + particle.id); //同じ
      // update velocity, rotation and position
      // particle.velocity.y += -0.001; // apply gravity to y
      particle.velocity.y *= 0.999;
      particle.position.addInPlace(particle.velocity); // update particle new position
    };

    const myVertexFunction = function (particle, vertex, i) {
      const p = i + particleDatas[particle.idx].timer;
      vertex.position.x += Math.cos(p * 0.001);
      vertex.position.y += Math.sin(p * 0.001);
      vertex.position.z += Math.cos(p * 0.001);
    };

    sps.initParticles();
    // sps.updateParticleVertex = myVertexFunction;
    sps.computeParticleVertex = true;
    //   sps.setParticles();
  }

  setPosition (p) {
    // console.log(this.timer);
    position = p;
    sps.setParticles();
  }
}

export { RocketParticles };
