import ReactDOM from "react-dom/client";
import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as editor from "./editor/editor.js";
import * as evaluator from "./evaluator.js";
import * as sprdsht from "./spreadsheet/Spreadsheet.js";
import { WhatsNewModal } from "./WhatsNewModal";

const spreadsheet = document.getElementById("spreadsheet");

function getViewDimensions() {
  return [window.innerWidth - spreadsheet.clientWidth, window.innerHeight / 2];
}

const [WIDTH, HEIGHT] = getViewDimensions();

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x17ffc7);
scene.fog = new THREE.FogExp2(0x17ffc7, 0.05);
const camera = new THREE.PerspectiveCamera(75, WIDTH / HEIGHT, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(WIDTH, HEIGHT);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById("viewport").prepend(renderer.domElement);

const grid1 = new THREE.GridHelper(10, 10, 0x888888);
grid1.material.color.setHex(0x888888);
grid1.material.vertexColors = false;
scene.add(grid1);

function handleWindowResize() {
  const [WIDTH, HEIGHT] = getViewDimensions();

  camera.aspect = WIDTH / HEIGHT;
  camera.updateProjectionMatrix();
  renderer.setSize(WIDTH, HEIGHT);
}

window.addEventListener("resize", handleWindowResize);

const controls = new OrbitControls(camera, renderer.domElement);

camera.position.set(
  -1.9857967338205065,
  3.2464625416408888,
  3.2430066755513103
);
camera.rotation.set(
  -0.7859306978231819,
  -0.40841952778064367,
  -0.3784206537585123
);
controls.update();

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();

window._APP = { camera, scene, renderer, controls };

const vs = `
precision highp float;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 normalMatrix;
uniform vec3 meshColor;

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
               1.0 * lambertian * meshColor +
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
// const meshObject = new THREE.Mesh(geometry, material);
// scene.add(meshObject);

// =============

function ViewportUI({ vertices, faces }) {
  return (
    <>
      <div>{`vertices: ${vertices}`}</div>
      <div>{`faces: ${faces}`}</div>
    </>
  );
}

function init({ defaultNodes }) {
  let meshObject;

  function displayMesh({ nodes }) {
    let { geometry, viewer } = evaluator.buildNodes(nodes);
    if (geometry) {
      geometry.computeVertexNormals();

      if (meshObject) {
        meshObject.geometry.dispose();
        meshObject.geometry = geometry;
      } else {
        if (geometry.__type === "curve") {
          const material = new THREE.LineBasicMaterial({ color: 0xff7ff9 });
          meshObject = new THREE.Line(geometry, material);
        } else {
          meshObject = new THREE.Mesh(geometry, material);
          meshObject.material.uniforms.meshColor = {
            value: [1, 0.5, 1],
          };
        }
        scene.add(meshObject);
      }
    } else if (meshObject) {
      meshObject.geometry.dispose();
      scene.remove(meshObject);
      meshObject = null;
    }

    sprdsht.render({
      geometry: viewer,
      domNode: spreadsheet,
      onResize: handleWindowResize,
    });
  }

  function onNodesChange(nodes) {
    try {
      displayMesh({ nodes });
    } catch (err) {
      console.error(err);
    }
  }

  editor.render({ onNodesChange, defaultNodes });
  sprdsht.render({ domNode: spreadsheet, onResize: handleWindowResize });
}

Promise.all([
  fetch("/defaults/nodes.json").then((r) => r.json()),
  fetch("/whats-new/latest.md").then((r) => r.text()),
  fetch("/defaults/default_project.json").then((r) => r.json()),
])
  .then(([nodes, text, default_project]) => {
    window.default_project = default_project;
    if (!localStorage.getItem("welcome-message")) {
      const root = ReactDOM.createRoot(document.getElementById("modals"));
      root.render(<WhatsNewModal text={text} onClose={() => root.unmount()} />);
      localStorage.setItem("welcome-message", true);
    }

    const defaultNodes = nodes.reduce((ret, node) => {
      ret[node.type] = node;
      return ret;
    }, {});
    init({ defaultNodes });
  })
  .catch(console.error);

const version = document.createElement("div");
version.id = "version";
version.textContent = `v${_HASH_}`;
document.getElementById("view").append(version);

console.log(
  `%c👋 ThreeGN, build ${_HASH_}`,
  "color: rgb(160, 100, 255); font-size: 16px; font-weight: 500; text-shadow: 1px 1px rgb(23 255 199);"
);
