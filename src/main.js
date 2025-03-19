import * as THREE from 'three'
import { Timer } from 'three/examples/jsm/Addons.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GUI } from 'lil-gui'
import { Sky } from 'three/examples/jsm/Addons.js'
import './style.css'

//#region Canvas, Dimensions & Debug

const canvas = document.getElementById('webgl')

const dimensions = {
  width: window.innerWidth,
  height: window.innerHeight,
}
dimensions.aspect = dimensions.width / dimensions.height

const gui = new GUI({ title: 'Debug', closeFolders: true }).hide()
const sky_gui = gui.addFolder('Skybox')
const light_gui = gui.addFolder('Scene Lighting')

window.addEventListener('resize', () => {
  dimensions.width = window.innerWidth
  dimensions.height = window.innerHeight
  dimensions.aspect = dimensions.width / dimensions.height

  camera.aspect = dimensions.aspect
  camera.updateProjectionMatrix()

  renderer.setSize(dimensions.width, dimensions.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

window.addEventListener('keydown', (event) => {
  if (event.key === 'h' || event.key === 'H') {
    gui._hidden ? gui.show() : gui.hide()
  }
})

//#endregion

//#region Scene, Camera, Controls & Helpers

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, dimensions.aspect, 0.1, 100)
camera.position.set(4, 2, 5)

const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

const axesHelper = new THREE.AxesHelper(5)
axesHelper.visible = false
scene.add(axesHelper)

//#endregion

//#region Textures

const loadingManager = new THREE.LoadingManager()
const textureLoader = new THREE.TextureLoader(loadingManager)

loadingManager.onError = (err) => console.error('error: ', err)

const wallTextures = {
  arm: textureLoader.load('./textures/wall/arm.webp'), // ao-rough-metal

  color: textureLoader.load('./textures/wall/diff.webp'),
  normal: textureLoader.load('./textures/wall/nor_gl.webp'),
}

wallTextures.color.colorSpace = THREE.SRGBColorSpace

const roofTextures = {
  color: textureLoader.load('./textures/roof/diff.webp'),
  arm: textureLoader.load('./textures/roof/arm.webp'), // ao-rough-metal
  normal: textureLoader.load('./textures/roof/nor_gl.webp'),
}

roofTextures.arm.repeat.set(3, 1)
roofTextures.arm.wrapS = THREE.RepeatWrapping

roofTextures.color.repeat.set(3, 1)
roofTextures.color.wrapS = THREE.RepeatWrapping
roofTextures.color.colorSpace = THREE.SRGBColorSpace

roofTextures.normal.repeat.set(3, 1)
roofTextures.normal.wrapS = THREE.RepeatWrapping

const doorTextures = {
  alpha: textureLoader.load('./textures/door/alpha.webp'),
  color: textureLoader.load('./textures/door/diff.webp'),
  displace: textureLoader.load('./textures/door/disp.webp'),

  ao: textureLoader.load('./textures/door/ao.webp'),
  roughness: textureLoader.load('./textures/door/roughness.webp'),
  metalness: textureLoader.load('./textures/door/metalness.webp'),

  normal: textureLoader.load('./textures/door/normal.webp'),
}

doorTextures.color.colorSpace = THREE.SRGBColorSpace

const floorTextures = {
  alpha: textureLoader.load('./textures/floor/alpha.webp'),

  arm: textureLoader.load('./textures/floor/arm.webp'), // ao-rough-metal
  color: textureLoader.load('./textures/floor/diff.webp'),
  displace: textureLoader.load('./textures/floor/disp.webp'),
  normal: textureLoader.load('./textures/floor/nor_gl.webp'),
}

floorTextures.arm.repeat.set(8, 8)
floorTextures.arm.wrapS = THREE.RepeatWrapping
floorTextures.arm.wrapT = THREE.RepeatWrapping

floorTextures.color.repeat.set(8, 8)
floorTextures.color.wrapS = THREE.RepeatWrapping
floorTextures.color.wrapT = THREE.RepeatWrapping
floorTextures.color.colorSpace = THREE.SRGBColorSpace

floorTextures.displace.repeat.set(8, 8)
floorTextures.displace.wrapS = THREE.RepeatWrapping
floorTextures.displace.wrapT = THREE.RepeatWrapping

floorTextures.normal.repeat.set(8, 8)
floorTextures.normal.wrapS = THREE.RepeatWrapping
floorTextures.normal.wrapT = THREE.RepeatWrapping

const grassTextures = {
  arm: textureLoader.load('./textures/grass/arm.webp'),
  color: textureLoader.load('./textures/grass/diff.webp'),
  normal: textureLoader.load('./textures/grass/nor_gl.webp'),
}

grassTextures.arm.repeat.set(2, 1)
grassTextures.arm.wrapS = THREE.RepeatWrapping

grassTextures.color.repeat.set(2, 1)
grassTextures.color.wrapS = THREE.RepeatWrapping
grassTextures.color.colorSpace = THREE.SRGBColorSpace

grassTextures.normal.repeat.set(2, 1)
grassTextures.normal.wrapS = THREE.RepeatWrapping

const graveTextures = {
  arm: textureLoader.load('./textures/grave/arm.webp'),
  color: textureLoader.load('./textures/grave/diff.webp'),
  normal: textureLoader.load('./textures/grave/nor_gl.webp'),
}

graveTextures.color.colorSpace = THREE.SRGBColorSpace

graveTextures.color.repeat.set(0.3, 0.4)
graveTextures.arm.repeat.set(0.3, 0.4)
graveTextures.normal.repeat.set(0.3, 0.4)

//#endregion

//#region Mesh

// House container
const houseGroup = new THREE.Group()
const houseDimensions = {
  width: 4,
  height: 2.5,
  depth: 4,
}

// houseGroup.rotateY(Math.PI * 0.5)

scene.add(houseGroup)

// floor
const floor = new THREE.Mesh(
  new THREE.PlaneGeometry(20, 20, 100, 100),
  new THREE.MeshStandardMaterial({
    transparent: true,
    alphaMap: floorTextures.alpha,

    map: floorTextures.color,

    aoMap: floorTextures.arm,
    roughnessMap: floorTextures.arm,
    metalnessMap: floorTextures.arm,
    normalMap: floorTextures.normal,

    displacementMap: floorTextures.displace,
    displacementScale: 0.3,
    displacementBias: -0.15,
  })
)
floor.position.set(0, 0, 0)
floor.rotation.x = -Math.PI * 0.5

scene.add(floor)

// Walls
const walls = new THREE.Mesh(
  new THREE.BoxGeometry(
    houseDimensions.width,
    houseDimensions.height,
    houseDimensions.depth
  ),
  new THREE.MeshStandardMaterial({
    map: wallTextures.color,

    aoMap: wallTextures.arm,
    metalnessMap: wallTextures.arm,
    roughnessMap: wallTextures.arm,
    normalMap: wallTextures.normal,
  })
)
walls.position.y = houseDimensions.height * 0.5
houseGroup.add(walls)

// Roof
const roof = new THREE.Mesh(
  new THREE.ConeGeometry(3.5, 1.5, 4),
  new THREE.MeshStandardMaterial({
    map: roofTextures.color,

    aoMap: roofTextures.arm,
    roughnessMap: roofTextures.arm,
    metalnessMap: roofTextures.arm,

    normalMap: roofTextures.normal,
  })
)
roof.position.y += houseDimensions.height + 1.5 * 0.5
roof.rotation.y = Math.PI * 0.25
houseGroup.add(roof)

// Door
const door = new THREE.Mesh(
  new THREE.PlaneGeometry(2.2, 2.2, 10, 10),
  new THREE.MeshStandardMaterial({
    transparent: true,
    alphaMap: doorTextures.alpha,

    map: doorTextures.color,

    aoMap: doorTextures.ao,
    roughnessMap: doorTextures.roughness,
    metalnessMap: doorTextures.metalness,

    normalMap: doorTextures.normal,
    displacementMap: doorTextures.displace,
    displacementScale: 0.15,
  })
)
door.position.y = 1
door.position.z = houseDimensions.depth / 2 + 0.01

door.rotation.z = -2 * Math.PI
houseGroup.add(door)

// Bushes
const bushGenerator = (x = 0, y = 0, z = 0, s = 1) => {
  const bush = new THREE.Mesh(
    new THREE.SphereGeometry(1, 16, 16),
    new THREE.MeshStandardMaterial({
      color: '#ccffcc',
      map: grassTextures.color,

      aoMap: grassTextures.arm,
      roughnessMap: grassTextures.arm,
      metalnessMap: grassTextures.arm,

      normalMap: grassTextures.normal,
    })
  )

  bush.scale.setScalar(s)
  bush.rotation.x = -0.75
  bush.position.set(x, y, z)

  return bush
}

const bush1 = bushGenerator(0.8, 0.2, 2.2, 0.5)
const bush2 = bushGenerator(1.4, 0.1, 2.1, 0.25)
const bush3 = bushGenerator(-0.8, 0.1, 2.2, 0.4)
const bush4 = bushGenerator(-1, 0.05, 2.5, 0.15)

houseGroup.add(bush1, bush2, bush3, bush4)

// Graves
const graves = new THREE.Group()
scene.add(graves)

const graveGenerator = (x = 0, y = 0, z = 0) => {
  const grave = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.8, 0.2),
    new THREE.MeshStandardMaterial({
      map: graveTextures.color,

      aoMap: graveTextures.arm,
      roughnessMap: graveTextures.arm,
      metalnessMap: graveTextures.arm,

      normalMap: graveTextures.normal,
    })
  )

  grave.position.set(x, y, z)

  return grave
}

Array.from({ length: 30 }).forEach((_, i) => {
  const angle = Math.random() * 2 * Math.PI

  const radius = 3 + Math.random() * 4

  const x = Math.sin(angle) * radius
  const z = Math.cos(angle) * radius
  const y = Math.random() * 0.4

  const grave = graveGenerator(x, y, z)
  grave.rotation.x = (Math.random() - 0.5) * 0.4
  grave.rotation.y = (Math.random() - 0.5) * 0.4
  grave.rotation.z = (Math.random() - 0.5) * 0.4

  graves.add(grave)
})

//#endregion

//#region Lighting

const ambientLight = new THREE.AmbientLight('#86cdff', 0.2)
light_gui
  .add(ambientLight, 'intensity')
  .min(0)
  .max(1)
  .step(0.001)
  .name('ambient')

const directionalLight = new THREE.DirectionalLight('#86cdff', 1)
directionalLight.position.set(3, 2, -8)

const doorLight = new THREE.PointLight('#ff7d46', 3)
doorLight.position.set(0, 2.2, 2.5)
houseGroup.add(doorLight)

light_gui
  .add(directionalLight, 'intensity')
  .min(0)
  .max(100)
  .step(0.001)
  .name('directional')
light_gui.add(directionalLight.position, 'x').min(-5).max(5).step(0.001)
light_gui.add(directionalLight.position, 'y').min(-5).max(5).step(0.001)
light_gui.add(directionalLight.position, 'z').min(-5).max(5).step(0.001)

scene.add(ambientLight, directionalLight)
//#endregion

//#region Ghosts

const ghosts = new THREE.Group()
scene.add(ghosts)

const ghostGenerator = (color = '#000000', rad = 1) => {
  const ghost = new THREE.PointLight(color, 6)

  ghost.rotate = (angle) => {
    ghost.position.x = Math.cos(angle) * rad
    ghost.position.y =
      Math.sin(angle) * Math.sin(angle * 2.34) * Math.sin(angle * 3.45)
    ghost.position.z = Math.sin(angle) * rad
  }

  ghosts.add(ghost)

  return ghost
}

const ghost1 = ghostGenerator('#8800ff', 4)
const ghost2 = ghostGenerator('#ff0088', 5)
const ghost3 = ghostGenerator('#ff0000', 6)

//#endregion

//#region Renderer

const renderer = new THREE.WebGLRenderer({ canvas })
renderer.setSize(dimensions.width, dimensions.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

//#endregion

//#region Shadows
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap

directionalLight.castShadow = true
ghosts.children.forEach((ghost) => {
  ghost.castShadow = true
})

floor.receiveShadow = true
walls.receiveShadow = true

walls.castShadow = true
roof.castShadow = true

graves.children.forEach((grave) => {
  grave.castShadow = true
  grave.receiveShadow = true
})

// mapping
directionalLight.shadow.mapSize.width = 256
directionalLight.shadow.mapSize.height = 256

directionalLight.shadow.camera.top = 8
directionalLight.shadow.camera.right = 8
directionalLight.shadow.camera.bottom = -8
directionalLight.shadow.camera.left = -8

directionalLight.shadow.camera.near = 1
directionalLight.shadow.camera.far = 20
directionalLight.shadow.camera.fov = 0

ghosts.children.forEach((ghost) => {
  ghost.shadow.mapSize.width = 256
  ghost.shadow.mapSize.height = 256
  ghost.shadow.camera.near = 1
  ghost.shadow.camera.far = 10
})

//#endregion

//#region Skybox & Fog

const sky = new Sky()
scene.fog = new THREE.FogExp2('#02343f', 0.1)
sky.scale.setScalar(100)
scene.add(sky)

sky.material.uniforms['turbidity'].value = 10
sky.material.uniforms['rayleigh'].value = 3
sky.material.uniforms['mieCoefficient'].value = 0.1
sky.material.uniforms['mieDirectionalG'].value = 0.95
sky.material.uniforms['sunPosition'].value.set(0.3, -0.038, -0.95)

sky_gui
  .add(sky.material.uniforms['turbidity'], 'value')
  .min(0)
  .max(20)
  .step(0.001)
  .name('turbidity')
sky_gui
  .add(sky.material.uniforms['rayleigh'], 'value')
  .min(0)
  .max(4)
  .step(0.001)
  .name('rayleigh')
sky_gui
  .add(sky.material.uniforms['mieCoefficient'], 'value')
  .min(0)
  .max(0.1)
  .step(0.001)
  .name('mieCofficient')
sky_gui
  .add(sky.material.uniforms['mieDirectionalG'], 'value')
  .min(0)
  .max(1)
  .step(0.001)
  .name('mieDirectionalG')

//#endregion

//#region Animation

const timer = new Timer()

function Animate() {
  timer.update()
  const _elapsed = timer.getElapsed()

  ghost1.rotate(_elapsed * 0.5)
  ghost2.rotate(_elapsed * -0.38)
  ghost3.rotate(_elapsed * 0.23)

  controls.update()
  renderer.render(scene, camera)
}

renderer.setAnimationLoop(Animate)

//#endregion
