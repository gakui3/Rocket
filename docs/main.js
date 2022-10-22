import * as BABYLON from '@babylonjs/core'
import { RocketParticles } from './RocketParticles'
import { RocketController } from './RocketController'
import '@babylonjs/loaders/glTF'

const canvas = document.getElementById('renderCanvas')
const engine = new BABYLON.Engine(canvas)
const scene = new BABYLON.Scene(engine)
const camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 50, -50), scene)
camera.setTarget(BABYLON.Vector3.Zero())
let root, _root
let init = false
// ロケットのモデルのoriginがずれてたので適当な調整用のoffset値です
const offset = new BABYLON.Vector3(-30, 15, 0)

camera.attachControl(canvas, true)

const light = new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0, 1, 0), scene)
light.intensity = 0.7
light.specular = new BABYLON.Color3(0.05, 0.05, 0.05)
light.diffuse = new BABYLON.Color3(0.8, 0.8, 0.8)

const light2 = new BABYLON.DirectionalLight('dir01', new BABYLON.Vector3(-0.1, -2, 0.1), scene)
light2.position = new BABYLON.Vector3(2, 40, 2)
light2.intensity = 0.5

// テスト用のguiを追加
const startButton = document.createElement('button')
startButton.style.top = '160px'
startButton.style.right = '30px'
startButton.textContent = 'start'
startButton.style.width = '100px'
startButton.style.height = '50px'

startButton.setAttribute = ('id', 'but')
startButton.style.position = 'absolute'
startButton.style.color = 'black'

document.body.appendChild(startButton)

const stopButton = document.createElement('button')
stopButton.style.top = '220px'
stopButton.style.right = '30px'
stopButton.textContent = 'stop'
stopButton.style.width = '100px'
stopButton.style.height = '50px'

stopButton.setAttribute = ('id', 'but')
stopButton.style.position = 'absolute'
stopButton.style.color = 'black'

document.body.appendChild(stopButton)

startButton.addEventListener('click', () => {
  rocketParticles.start()
})

stopButton.addEventListener('click', () => {
  rocketParticles.stop()
})

// ロケットのモデルを追加
BABYLON.SceneLoader.Append('./assets/', 'Rocket - Launch.glb', scene, (obj) => {
  _root = scene.getMeshByName('__root__')
  _root.scaling = new BABYLON.Vector3(1, 1, 1)
  _root.position = offset

  // root = _root.getChildren()[0]
  const shadowGenerator = new BABYLON.ShadowGenerator(1024, light2)
  shadowGenerator.addShadowCaster(_root)
  shadowGenerator.useExponentialShadowMap = true

  obj.animationGroups[1].start(true)
  init = true

  const controller = new RocketController(_root, scene, engine)

  // particleのインスタンスを作成
  const rocketParticles = new RocketParticles(7)
  rocketParticles.init(scene, engine)
  rocketParticles.setRoot(_root, new BABYLON.Vector3(58.5, -13, 7).add(offset))
  rocketParticles.start()
})

// grand planeの追加
const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 40, height: 40 }, scene)
ground.position = new BABYLON.Vector3(0, -20, 0)
const groundMaterial = new BABYLON.StandardMaterial('ground', scene)
groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0)
ground.material = groundMaterial
ground.receiveShadows = true

engine.runRenderLoop(() => {
  if (!init) { return }
  // ロケットのモデルのoriginがずれてたので適当に調整した値です(58.5, -6, 7)
  // エミットする際のpositionはsetposition関数からセットして下さい
  // rocketParticles.setPosition(_root.position.clone().add(new BABYLON.Vector3(58.5, -13, 7)).add(offset))
  scene.render()
})
