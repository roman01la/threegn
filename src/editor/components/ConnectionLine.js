import React from "react";
import * as rf from "reactflow";
import * as st from "../styles";
import { useNodeByID } from "../NodesContext";
import { useHandle } from "../HandleContext";

export function ConnectionLine({
  fromX,
  fromY,
  fromPosition,
  toX,
  toY,
  toPosition,
  connectionLineType,
  connectionLineStyle,
  fromHandle,
  fromNode,
}) {
  const [node, _] = useNodeByID(fromNode.id);
  const { zoom } = rf.useViewport();
  const [handlePos] = useHandle();

  const lineColor = React.useMemo(() => {
    const socket = node.outputs.find((out) => out.identifier === fromHandle.id);
    return socket ? st.SOCKET_COLORS[socket.type] : null;
  }, [fromNode.id]);

  const [dAttr] = rf.getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    sourcePosition: fromPosition,
    targetX: handlePos ? handlePos.x : toX,
    targetY: handlePos ? handlePos.y : toY,
    targetPosition: toPosition,
  });

  return (
    <g className="react-flow__connection">
      <path
        fill="none"
        stroke={lineColor}
        strokeWidth={3 / zoom}
        style={connectionLineStyle}
        d={dAttr}
      />
    </g>
  );
}
