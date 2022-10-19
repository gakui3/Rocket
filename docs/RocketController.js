import * as BABYLON from '@babylonjs/core'

const accelerationXZ = 5
const accelerationY = 0.1
const dt = 0.03
let velocity, position, positionInit

class RocketController {
  constructor (obj) {
    this.dt = 0.03
    position = obj.position.clone()
    positionInit = obj.position.clone()
    velocity = new BABYLON.Vector3(0, -0.5, 0)
    addkeyEvent()
    update()
    function update () {
      requestAnimationFrame(update)
      updatePosition(obj)
    }

    function addkeyEvent () {
      document.addEventListener('keydown', event => {
        if (event.key === 'w') {
          upKeyDown()
        }
        if (event.key === 's') {
          downKeyDown()
        }
        if (event.key === 'd') {
          rightKeyDown()
        }
        if (event.key === 'a') {
          leftKeyDown()
        }
        if (event.key === 'e') {
          riseKeyDown()
        }
        if (event.key === 'r') {
          reset()
        }
      })
    }

    function updatePosition (obj) {
      let vy = velocity.y - accelerationY * dt
      vy = BABYLON.Scalar.Clamp(vy, -8, 0)
      velocity.y = vy

      position.x = position.x + velocity.x * dt
      position.z = position.z + velocity.z * dt
      position.y = position.y + velocity.y * dt

      obj.position = position
    }

    function rightKeyDown () {
      velocity.x = velocity.x + accelerationXZ * dt
    }
    function leftKeyDown () {
      velocity.x = velocity.x - accelerationXZ * dt
    }
    function upKeyDown () {
      velocity.z = velocity.z + accelerationXZ * dt
    }
    function downKeyDown () {
      velocity.z = velocity.z - accelerationXZ * dt
    }
    function riseKeyDown () {
      velocity.y = velocity.y + accelerationY * 35 * dt
    }
    function reset () {
      position = positionInit.clone()
      velocity = new BABYLON.Vector3(0, -0.5, 0)
    }
  }
}

export { RocketController }
