import React from "react";
import * as rf from "reactflow";
import { Handle } from "./Handle";
import { useNodeSocketChange } from "../hooks";
import { NodeBaseInputField } from "./NodeBaseInputField";

export const NodeInputField = React.memo(function _NodeInputField({
  socket,
  nodeId,
  isConstant,
  onFocus,
  onBlur,
}) {
  const { value, name } = socket;

  const handleChange = useNodeSocketChange({
    nodeId,
    isConstant,
    socketId: socket.identifier,
    onChange: React.useCallback((v) => v),
  });

  const [labelVisible, setLabelVisible] = React.useState(true);
  const ref = React.useRef();

  React.useEffect(() => {
    if (!labelVisible) {
      ref.current.select();
    }
  }, [labelVisible]);

  const handle = React.useMemo(
    () => (
      <Handle
        type="target"
        socket={socket}
        nodeId={nodeId}
        position={rf.Position.Left}
      />
    ),
    [socket, nodeId]
  );

  return (
    <NodeBaseInputField
      value={value}
      label={name}
      type={socket.type}
      onChange={handleChange}
      onPointerDown={onFocus}
      onPointerLeave={onBlur}
    >
      {isConstant ? null : handle}
    </NodeBaseInputField>
  );
});
