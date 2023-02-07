import * as THREE from "three";
import React from "react";
import * as rf from "reactflow";
import * as st from "../styles.js";
import { getNodeData } from "../node_utils.js";
import { useHandle } from "../HandleContext.js";

const SIZE = 8;

const dot = (
  <div
    style={{
      width: 2,
      height: 2,
      position: "absolute",
      borderRadius: 1,
      background: "#0f1010",
    }}
  />
);

export const Handle = React.memo(function _Handle({
  socket,
  nodeId,
  style,
  ...props
}) {
  const { zoom } = rf.useViewport();
  const connectionNodeId = rf.useStore(
    React.useCallback((state) => state.connectionNodeId, [])
  );
  const nodeInternals = rf.useStore(
    React.useCallback((state) => state.nodeInternals.get(nodeId), [nodeId])
  );
  const ref = React.useRef();
  const [_, setHandlePos] = useHandle();

  const w = THREE.MathUtils.clamp(SIZE / zoom, SIZE, 12);
  const h = THREE.MathUtils.clamp(SIZE / zoom, SIZE, 12);

  const [width, height] = socket.is_multi_input ? [w, h * 2] : [w, h];
  const borderRadius = socket.is_multi_input
    ? { borderRadius: height / 2 }
    : { borderRadius: "50%" };

  return (
    <div
      className={`react-flow__handle-${props.position}`}
      style={{
        width: width * 2,
        height: height * 2,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        left: props.position === rf.Position.Left ? -8 : null,
        right: props.position === rf.Position.Right ? -8 : null,
      }}
    >
      <div
        style={{
          ...style,
          ...borderRadius,
          ...st.SOCKET_SHAPES[socket.display_shape],
          width,
          height,
          border: "1px solid #0f1010",
          background: st.SOCKET_COLORS[socket.type],
        }}
      />
      {socket.display_shape === "DIAMOND_DOT" ? dot : null}
      <rf.Handle
        ref={ref}
        {...props}
        id={socket.identifier}
        style={{
          border: "none",
          background: "transparent",
          width: width * 2,
          height: height * 2,
          right: 0,
          left: 0,
        }}
        onMouseEnter={() => {
          if (connectionNodeId !== null && connectionNodeId !== nodeId) {
            const [nodeBbox, { target }] = getNodeData(nodeInternals);
            const tsBbox = target.find((t) => t.id === socket.identifier);
            const pos = {
              x: nodeBbox.x + tsBbox.x + width,
              y: nodeBbox.y + tsBbox.y + height,
            };
            setHandlePos(pos);
          }
        }}
        onMouseLeave={() => {
          setHandlePos(null);
        }}
      />
    </div>
  );
});
