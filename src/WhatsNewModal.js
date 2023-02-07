import React from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { parse } from "marked";
import { Button } from "./editor/components/Button";

function createScene({ width, height, node, name, color, setupFn, animateFn }) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  node.prepend(renderer.domElement);

  const light = new THREE.DirectionalLight(0xffffff, 1);
  scene.add(light);

  setupFn({ camera, scene });

  let fid;
  let obj1;

  function animate() {
    fid = requestAnimationFrame(animate);
    animateFn(obj1);
    renderer.render(scene, camera);
  }

  const loader = new GLTFLoader();
  loader.load("/decals.glb", (glb) => {
    scene.add(glb.scene);
    scene.getObjectByName(
      name === "object_2" ? "object_1" : "object_2"
    ).visible = false;
    obj1 = scene.getObjectByName(name);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.3,
    });
    obj1.traverse((obj) => {
      if (obj.isMesh) {
        obj.material = material;
      }
    });
    animate();
  });
  return () => {
    if (fid) {
      cancelAnimationFrame(fid);
    }
  };
}

export function WhatsNewModal({ text, onClose }) {
  const html = React.useMemo(() => parse(text), [text]);
  const ref1 = React.useRef();
  const ref2 = React.useRef();

  React.useEffect(
    () =>
      createScene({
        width: 220,
        height: 220,
        node: ref1.current,
        name: "object_1",
        color: 0x17ffc7,
        setupFn: ({ camera, scene }) => {
          camera.position.set(0, 0, 3.5);
          const plight = new THREE.PointLight("rgb(160, 100, 255)", 0.7);
          plight.position.set(0, 0, 3);
          scene.add(plight);
        },
        animateFn: (obj1) => {
          obj1.rotation.x += 0.03;
          obj1.rotation.y += 0.02;
          obj1.position.y = Math.sin(performance.now() / 1000) / 2;
        },
      }),
    []
  );
  React.useEffect(
    () =>
      createScene({
        width: 220,
        height: 220,
        node: ref2.current,
        name: "object_2",
        color: 0xfc55ff,
        setupFn: ({ camera, scene }) => {
          camera.position.set(0, 0, 2.5);
          const plight = new THREE.PointLight("rgb(160, 100, 255)", 0.7);
          plight.position.set(0, 0, 3);
          scene.add(plight);
        },
        animateFn: (obj1) => {
          obj1.rotation.z += 0.01;
          obj1.rotation.y += 0.03;
          obj1.position.x = Math.sin(performance.now() / 1000) / 1.5;
          obj1.position.y = Math.cos(performance.now() / 1000) / 2;
        },
      }),
    []
  );

  return (
    <div
      className="whats-new"
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        background: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          background:
            "linear-gradient(to right, rgb(252 85 255 / 70%), rgb(23 255 199 / 70%))",
          width: 400,
          height: Math.max(window.innerHeight * 0.6, 400),
          border: "1px solid #2e2e2e",
          borderRadius: 5,
          padding: 4,
          display: "flex",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
          position: "relative",
        }}
      >
        <div
          ref={ref1}
          style={{ position: "absolute", top: -120, left: -120 }}
        />
        <div
          ref={ref2}
          style={{ position: "absolute", bottom: -100, right: -100 }}
        />
        <div
          style={{
            flex: 1,
            background: "#1c2428",
            padding: 16,
            borderRadius: 3,
            color: "#fafafa",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{ flex: 1, width: "100%" }}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <Button
            style={{
              fontSize: "12px",
              background: "#fafafa",
              color: "#1c2428",
            }}
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
