import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as evaluator from "./evaluator.js";

window.initDemo = function init(container, path) {
  function getViewDimensions() {
    return [container.clientWidth, container.clientHeight];
  }

  const [WIDTH, HEIGHT] = getViewDimensions();

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x393939);
  const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);
  window.camera = camera;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setPixelRatio(window.devicePixelRatio);
  container.append(renderer.domElement);

  window.addEventListener("resize", () => {
    const [WIDTH, HEIGHT] = getViewDimensions();

    camera.aspect = WIDTH / HEIGHT;
    camera.updateProjectionMatrix();
    renderer.setSize(WIDTH, HEIGHT);
  });

  const controls = new OrbitControls(camera, renderer.domElement);

  camera.position.set(0, 0, 2.5);
  controls.update();

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }

  const vs = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 translation;
attribute vec4 rotation;
attribute vec3 scale;

varying vec3 vertPos;
varying vec3 normalInterp;
varying vec4 color;

vec3 transform( inout vec3 position, vec3 T, vec4 R, vec3 S ) {
  position *= S;
  position += 2.0 * cross( R.xyz, cross( R.xyz, position ) + R.w * position );
  position += T;
  return position;
}

void main() {

  vec3 pos = position;
  transform( pos, translation, rotation, scale );
  vec4 vertPos4 = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
  gl_Position = vertPos4;

  vertPos = vec3(vertPos4) / vertPos4.w;

  vec3 lightPos = vec3(1.0, 0.0, 1.0);
  normalInterp = vec3(normalMatrix * vec4(normal, 0.0));
  vec3 N = normalize(normalInterp);
  vec3 L = normalize(lightPos - vertPos);

  float lambertian = max(dot(N, L), 0.0);
  float specular = 0.0;

  if (lambertian > 0.0) {
    vec3 R = reflect(-L, N);
    vec3 V = normalize(-vertPos);

    float specAngle = max(dot(R, V), 0.0);
    specular = pow(specAngle, 80.0);
  }
  color = vec4(1.0 * vec3(0.15, 0.15, 0.15) +
               1.0 * lambertian * vec3(0.04, 0.8, 0.06) +
               1.0 * specular * vec3(1.0, 1.0, 1.0),
               1.0);
}
`;

  const fs = `
precision mediump float;

varying vec4 color;
void main() {
  gl_FragColor = color;
}
`;

  const material = new THREE.RawShaderMaterial({
    vertexShader: vs,
    fragmentShader: fs,
  });

  fetch(path)
    .then((r) => r.json())
    .then((nodes) => {
      const geometry = evaluator.buildNodes(nodes);
      geometry.computeVertexNormals();
      const meshObject = new THREE.Mesh(geometry, material);
      meshObject.position.x = -0.8;
      meshObject.position.y = -0.6;
      window.meshObject = meshObject;
      scene.add(meshObject);
      animate();
    })
    .catch(console.error);
};
