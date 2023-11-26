import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import imageSource from './image.png'

var camera, scene, renderer, composer, renderPass, customPass;
var geometry, material, mesh, uMouse = new THREE.Vector2(0,0);
var strength = 0, strengthDecay = 0.99;

camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.01, 10 );
camera.position.z = 0.25;

scene = new THREE.Scene();

//let TEXTURE = new TextureLoader().load('supaAmazingImage.jpg'); 

const textureLoader = new THREE.TextureLoader()
const texture = textureLoader.load('./image.png')

geometry = new THREE.PlaneGeometry( 0.45, 0.3);
material = new THREE.MeshBasicMaterial({
map: texture
});
mesh = new THREE.Mesh( geometry, material );
scene.add( mesh );

renderer = new THREE.WebGLRenderer( { antialias: true } );
renderer.setSize( window.innerWidth, window.innerHeight );
renderer.LinearEncoding = THREE.sRGBColorSpace;
document.body.appendChild( renderer.domElement );

// post processing
composer = new EffectComposer(renderer);
renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

var myEffect = {
uniforms: {
    "tDiffuse": { value: null },
    "resolution": { value: new THREE.Vector2(1.,window.innerHeight/window.innerWidth) },
    "uMouse": { value: new THREE.Vector2(-10,-10) },
    "uVelo": { value: 0 },
    "strength": { value: strength },
},
vertexShader: `varying vec2 vUv;void main() {vUv = uv;gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0 );}`,
fragmentShader: `uniform float time;
uniform sampler2D tDiffuse;
uniform vec2 resolution;
varying vec2 vUv;
uniform vec2 uMouse;
uniform float strength;
float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
    uv -= disc_center;
    uv*=resolution;
    float dist = sqrt(dot(uv, uv));
    return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
}
void main()  {
    vec2 newUV = vUv;
    float c = circle(vUv, uMouse, 0.0, 0.2);
    float r = texture2D(tDiffuse, newUV.xy -= c * strength * (0.2 * .2)).x;
    float g = texture2D(tDiffuse, newUV.xy -= c * strength * (0.2 * .225)).y;
    float b = texture2D(tDiffuse, newUV.xy -= c * strength * (0.2 * .25)).z;
    vec4 color = vec4(r, g, b, 1.);
    gl_FragColor = color;
}`
}
customPass = new ShaderPass(myEffect);
customPass.renderToScreen = true;
composer.addPass(customPass);

document.addEventListener('mousemove', (e) => {
uMouse.x = ( e.clientX / window.innerWidth ) ;
uMouse.y = 1. - ( e.clientY/ window.innerHeight );
const dx = e.movementX / window.innerWidth;
const dy = -e.movementY / window.innerHeight;

// Add the distance to the strength
strength += Math.sqrt(dx * dx + dy * dy);
// Dampen the strength
strength *= 0.99;
console.log(strength)
});

animate()

function animate() {
  strength *= strengthDecay;
  customPass.uniforms.uMouse.value = uMouse;
  customPass.uniforms.strength.value = strength;
  requestAnimationFrame( animate );

  // renderer.render( scene, camera );
  composer.render()

}