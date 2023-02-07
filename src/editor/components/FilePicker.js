import React from "react";
import * as st from "../styles.js";
import { Button } from "./Button.js";
import { loadDefaultNodes, computeNodes } from "../node_utils.js";
import { useApplyNodes } from "../hooks.js";

export function FilePicker({ onError }) {
  const applyNodes = useApplyNodes();

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }
  function onDrop(e) {
    preventDefaults(e);
    const file = e.dataTransfer.files[0];
    if (file.type === "application/json") {
      file
        .text()
        .then((t) => {
          applyNodes(computeNodes(JSON.parse(t)));
        })
        .catch(onError);
    }
  }

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        textShadow: st.TEXT_SHADOW,
        position: "absolute",
        width: "100%",
        height: "100%",
        background: "#1d1d1d",
      }}
      onDragEnter={preventDefaults}
      onDragOver={preventDefaults}
      onDragLeave={preventDefaults}
      onDrop={onDrop}
    >
      <div>Drop exported Geometry Nodes file here</div>
      <div style={{ fontSize: "12px", margin: "16px 0" }}>
        or create a new document from scratch
      </div>
      <Button
        onClick={() => loadDefaultNodes().then(applyNodes).catch(console.error)}
      >
        Create +
      </Button>
    </div>
  );
}
