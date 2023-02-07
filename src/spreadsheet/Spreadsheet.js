import React from "react";
import ReactDOM from "react-dom/client";
import { Button } from "../editor/components/Button";
import * as st from "../editor/styles";

function GeometryInfo({ geometry }) {
  const vertices = geometry.attributes.position.count / 3;
  const faces = geometry.attributes.position.count / 6;
  const fields = [
    { name: "vertices", value: vertices },
    { name: "faces", value: faces },
  ];
  return (
    <div style={{ padding: 8 }}>
      {fields.map(({ name, value }) => (
        <div key={name}>{`${name}: ${value}`}</div>
      ))}
    </div>
  );
}

export function Spreadsheet({ geometry, onResize }) {
  const [isOpen, setIsOpen] = React.useState(false);

  React.useEffect(() => {
    document.querySelector("#spreadsheet").style.minWidth = isOpen
      ? "400px"
      : "0px";
    onResize();
  }, [isOpen]);

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        color: "#cdcdcd",
        fontSize: "12px",
        textShadow: st.TEXT_SHADOW,
        position: "relative",
        background: "#303030",
      }}
    >
      <div style={{ position: "absolute", left: -88, top: 8 }}>
        <Button
          style={{
            padding: "5px 6px",
            fontSize: "12px",
          }}
          active={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        >
          Spreadsheet
        </Button>
      </div>
      {isOpen && geometry ? <GeometryInfo geometry={geometry} /> : null}
    </div>
  );
}

let root;
export function render({ domNode, geometry, onResize }) {
  if (!root) {
    root = ReactDOM.createRoot(domNode);
  }
  root.render(<Spreadsheet geometry={geometry} onResize={onResize} />);
}
