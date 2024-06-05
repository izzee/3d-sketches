import './style.css'
import {
  AmbientLight,
  Clock,
  DirectionalLight,
  Group,
  Mesh,
  MeshLambertMaterial,
  PerspectiveCamera, 
  Scene, 
  TorusKnotGeometry,
  WebGLRenderer,
} from 'three'
import WebGL from 'three/addons/capabilities/WebGL.js';



import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { NoiseShader } from './noise-shader';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

import { animate, inView } from 'motion'


const runAnimations = () => {
  // Three.js
  const loaderTag = document.querySelector('section.loader')
  const threeTag = document.querySelector('section.three')
  const {width, height} = threeTag.getBoundingClientRect()

  let aimEffect = 0
  let currentEffect = 0
  let aimDirection = 0
  let currentDirection = 0
  let timeoutEffect

  const clock = new Clock()
  const scene = new Scene()
  const camera = new PerspectiveCamera( 75, width / height, 0.1, 1000 )

  inView('section.content', (info) => {
    const isLeft = info.target.classList.contains('left')
    aimDirection = isLeft ? 1 : -1
    return (leaveInfo) => {
      // aimDirection = 0
    }
  }, {margin: '-25%'})

  const renderer = new WebGLRenderer()
  renderer.setSize(window.innerWidth, window.innerHeight)
  renderer.setClearColor(0x000000, 0)
  threeTag.appendChild( renderer.domElement)

  // Post-Processing
  const composer = new EffectComposer(renderer)

  const renderPass = new RenderPass(scene, camera)
  composer.addPass(renderPass)

  const nosiePass = new ShaderPass(NoiseShader)
  nosiePass.uniforms.time.value = clock.getElapsedTime()
  nosiePass.uniforms.time.value = clock.getElapsedTime()
  nosiePass.uniforms.effect.value = currentEffect
  nosiePass.uniforms.direction.value = currentDirection

  nosiePass.uniforms.aspectRatio.value = width / height
  composer.addPass(nosiePass);

  const outputPass = new OutputPass()
  composer.addPass(outputPass)


  // Lighting
  const ambience = new AmbientLight(0x404040)
  camera.add(ambience)

  const keyLight = new DirectionalLight(0xffffff, 1)
  keyLight.position.set(-1,1,3)
  camera.add(keyLight)

  const fillLight = new DirectionalLight(0xffffff, .5)
  fillLight.position.set(1,1,3)
  camera.add(fillLight)

  const backLight = new DirectionalLight(0xffffff, 1)
  backLight.position.set(-1,3,-1)
  camera.add(backLight)

  scene.add(camera)

  const loadGroup = new Group()
  loadGroup.position.y = 20

  // Import object
  const scrollGroup = new Group()
  scrollGroup.add(loadGroup)

  scene.add(scrollGroup)

  const gltfLoader = new GLTFLoader()

  animate('section.new-drop', {y: -100, opacity: 0})


  gltfLoader.load('../bust.glb', (gltf) => {
    loadGroup.add(gltf.scene)
    // motion one animation after object loads in
    animate((t) => {
      loadGroup.position.y = -10 + 9 * t
    }, { duration: 2, delay: 1})

    animate('section.new-drop', 
      {
        y: [-100, 0],
        opacity: [0,1]
      }, 
      {
        duration: 1,
        delay: 2,
      }
    )
    animate(loaderTag, {y: '-100%'}, {duration: 1, delay:1})
    document.body.classList.remove('loading')

  }, 
    (xhr) => {
    }, 
    (error) => {console.error(error)
  })

  camera.position.z = 1.75

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableZoom = false
  controls.enablePan = false
  controls.autoRotate = true
  controls.autoRotateSpeed = 1

  // Animation
  const render = () => {
    // autorotation of shape
    controls.update()
    // rotate scroll group containing shape
    scrollGroup.rotation.set(0,window.scrollY*0.0025,0)
    
    currentDirection += (aimDirection - currentDirection) * 0.01
    // tween effect based on scroll status

    currentEffect += (aimEffect - currentEffect) * 0.05
    nosiePass.uniforms.direction.value = currentDirection
    nosiePass.uniforms.effect.value = currentEffect
    nosiePass.uniforms.aspectRatio.value = width / height

    // uptate time that is passed into noise shader
    nosiePass.uniforms.time.value = clock.getElapsedTime()
    // animate scene
    requestAnimationFrame(render)
    composer.render()
  }

  // Window resize
  const resize = () => {
    const {width, height} = threeTag.getBoundingClientRect()
    nosiePass.uniforms.aspectRatio.value = width / height
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
  }
  window.addEventListener('resize', resize)

  // Scroll listener
  const scroll = () => {
    clearTimeout(timeoutEffect)
    aimEffect = 1

    timeoutEffect = setTimeout(() => {
      aimEffect = 0
    }, 100)
  }
  window.addEventListener('scroll', scroll)

  render()
}

if ( WebGL.isWebGLAvailable() ) {
  runAnimations()
	// Initiate function or other initializations here

} else {
  document.querySelector('.error-message').style.display = 'block'

}