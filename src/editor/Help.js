import React from "react";
import * as st from "./styles";
import { Button } from "./components/Button";

const help = [
  "Select node: click on a node",
  "Add node: Shift + A or `+` button in editor UI",
  "Delete node: select and press `Backspace` or `X`",
  "Move node: select + drag",
  "Connect nodes: click + drag from a source socket (right side of a node) to an input socket (left side of a node)",
  "Delete edge: click on an edge and press `Backspace` or `X`",
  "Open the Spreadsheet: press `Spreadsheet` button in the viewport above",
  "Display geometry data in the Spreadsheet: add `Viewer` node and connect any geometry socket to it (Shift + double click on a node to connect it to the viewer)",
];

function HelpModal() {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 48,
        right: 8,
        borderRadius: 5,
        border: "1px solid #2e2e2e",
        padding: 8,
        width: 320,
        height: window.innerHeight / 2 - 48 - 32,
        background: "#393939",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
        textShadow: st.TEXT_SHADOW,
        fontSize: "12px",
        color: "#d1d1d1",
      }}
    >
      {help.map((n) => (
        <div key={n} style={{ margin: "0 0 8px" }}>
          {n}
        </div>
      ))}
    </div>
  );
}

export function Help() {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div style={{ position: "absolute", bottom: 8, right: 8 }}>
      <Button
        style={{
          borderRadius: "50%",
          padding: 8,
          fontSize: "12px",
          width: 32,
          height: 32,
        }}
        active={isOpen}
        onClick={() => setIsOpen(!isOpen)}
      >
        ?
      </Button>
      {isOpen ? <HelpModal /> : null}
    </div>
  );
}
