import React from "react";
import * as rf from "reactflow";
import { useNodeSocketChange } from "../hooks";
import { Handle } from "./Handle";
import * as st from "../styles.js";

export const NodeCheckboxField = React.memo(function _NodeCheckboxField({
  style,
  inputStyle,
  socket,
  nodeId,
}) {
  const { value, name } = socket;
  const id = `${name}/${Math.random()}`;

  const handleChange = useNodeSocketChange({
    nodeId,
    socketId: socket.identifier,
    onChange: React.useCallback((e) => e.target.checked),
  });

  return (
    <div
      style={{
        margin: "4px 0",
        padding: "0 12px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        ...style,
      }}
    >
      <Handle
        type="target"
        socket={socket}
        nodeId={nodeId}
        position={rf.Position.Left}
      />
      <input
        style={{
          appearance: value ? null : "none",
          background: st.INPUT_BG,
          border: "none",
          borderRadius: st.CHECKBOX_BORDER_RADIUS,
          width: 14,
          height: 14,
          margin: "0 4px 0 0",
          ...inputStyle,
        }}
        id={id}
        type="checkbox"
        onChange={handleChange}
        checked={value}
      />
      <label
        style={{
          color: "#fff",
          fontSize: "12px",
          textShadow: st.TEXT_SHADOW,
        }}
        htmlFor={id}
      >
        {name}
      </label>
    </div>
  );
});
