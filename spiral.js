import {
  DirectionalLight,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera, 
  Scene, 
  Color,
  ConeGeometry,
  TorusGeometry,
  SphereGeometry,
  BoxGeometry,
  WebGLRenderer,
} from 'three'

const renderer = new WebGLRenderer({
  antialias: true
})

renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setClearColor(0xffff00, 1) // first argument is color, second is opacity
document.querySelector('section').appendChild(renderer.domElement)

const scene = new Scene()

const camera = new PerspectiveCamera(75, window.innerWidth/window.innerHeight, 1, 5000)
camera.position.z = -50
camera.lookAt(scene.position)

const light = new DirectionalLight(0xffffff, 1)
light.position.set(0,0,-1)

scene.add(light)

const shapes = []

const animate = function() {
  renderer.render(scene, camera)
  requestAnimationFrame(animate)
  shapes.forEach((shape, index) => {
    shape.rotateX(Math.random()/100)
    shape.position.setZ(shape.position.z + 5)
    if (shape.position.z >= 6000) { 
      shape.position.z = 7000
      scene.remove(shape)
      shapes[index].remove()
      return
    }
  })
}
animate()

let growth = 0
let direction = 1

const createShape = function(x,y) {
  growth += direction * 10
  if (growth >= 100) {
    direction = -1
  } else {
    direction = +1
  }
  const geometries = [
    // new ConeGeometry(100, 150, 320),
    new BoxGeometry(150, 150, 150),
    // new SphereGeometry(50 + growth, 50 + growth, 50 + growth)
  ]

  const randomNumber = Math.floor(Math.random() * geometries.length)
  const color = new Color(`hsl(${Math.random()*255}, ${Math.random()*50}%, ${Math.random()*25}%)`)
  const emmisiveColor = new Color(`hsl(${Math.random()*255}, ${Math.random()*100}%, ${Math.random()*100}%)`)

  const material = new MeshLambertMaterial({
    color: color,
    emissive: emmisiveColor
  })
  const shape = new Mesh(geometries[randomNumber], material)
  shape.rotateX(Math.random() * 10)
  shape.rotateZ(Math.random() * 10)

  shape.position.set((window.innerWidth/2) - x, (window.innerHeight/2) - y, camera.position.z + 500)

  shapes.push(shape)
  scene.add(shape)
}

let mouseIsDown = false


document.addEventListener('mousemove', event => {
  // if (mouseIsDown) {
    createShape(event.pageX,event.pageY)
  // }
})
document.addEventListener('mousedown', () => {
  mouseIsDown = true
})

document.addEventListener('mouseup', () => {
  mouseIsDown = false
})

document.addEventListener('touchmove', event => {
  if (mouseIsDown) {
    createShape(event.pageX,event.pageY)
  }
})
document.addEventListener('touchstart', () => {
  mouseIsDown = true
})

document.addEventListener('touchend', () => {
  mouseIsDown = false
})

window.addEventListener('resize', function () {
  camera.aspect = window.innerWidth / this.window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
})