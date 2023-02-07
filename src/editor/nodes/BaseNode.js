import React from "react";
import { NodeHeader } from "./NodeHeader";
import { NodeLinkedField } from "./NodeLinkedField";
import { NodeOutputField } from "./NodeOutputField";
import { NodeInputField } from "./NodeInputField";
import { NodeCheckboxField } from "./NodeCheckboxField";
import { NodeVectorInput } from "./NodeVectorInput";
import { NodeSelectField } from "./NodeSelectField";
import { NodeToggleField } from "./NodeToggleField";
import { toCamelCase } from "../text_utils";
import { useNodeByID, useNodeByType } from "../NodesContext";
import { useSocketConnect } from "../hooks";

function memoize(f) {
  const cache = {};
  return (a) => {
    if (!cache[a]) {
      cache[a] = f(a);
    }
    return cache[a];
  };
}

const INPUTS = {
  MATH: {
    field: "operation",
    inputs: {
      MULTIPLY: [0, 1],
      DIVIDE: [0, 1],
      ADD: [0, 1],
      SUBTRACT: [0, 1],
      MODULO: [0, 1],
      FLOOR: [0],
      COSINE: [0],
      RADIANS: [0],
      POWER: [0, 1],
      LOGARITHM: [0, 1],
      SQRT: [0],
      INVERSE_SQRT: [0],
      ABSOLUTE: [0],
      EXPONENT: [0],
      MINIMUM: [0, 1],
      MAXIMUM: [0, 1],
    },
  },
  VECT_MATH: {
    field: "operation",
    inputs: {
      ADD: [0, 1],
      SUBTRACT: [0, 1],
      DIVIDE: [0, 1],
    },
  },
  FILLET_CURVE: {
    field: "mode",
    inputs: {
      BEZIER: [0, 2, 3],
      POLY: [0, 1, 2, 3],
    },
  },
};

const SELECT_FIELDS = {
  MATH: memoize((n) => [
    {
      field: "operation",
      value: n.operation,
      options: Object.keys(INPUTS.MATH.inputs),
    },
  ]),
  VECT_MATH: memoize((n) => [
    {
      field: "operation",
      value: n.operation,
      options: Object.keys(INPUTS.VECT_MATH.inputs),
    },
  ]),
};

const TOGGLE_FIELDS = {
  FILLET_CURVE: memoize((n) => [
    {
      field: "mode",
      value: n.mode,
      options: Object.keys(INPUTS.FILLET_CURVE.inputs),
    },
  ]),
};

export function BaseNode({ selected, id, _mapping }) {
  const [data] = useNodeByID(id);
  const { dimensions } = data;

  // FIXME: ugly node variants based on inputs
  const inputFields = (
    INPUTS[data.type]?.inputs[data[INPUTS[data.type].field]] || _mapping.inputs
  ).map((idx) => data.inputs[idx]);
  const outputFields = _mapping.outputs.map((idx) => data.outputs[idx]);

  const selectFields = SELECT_FIELDS[data.type]
    ? SELECT_FIELDS[data.type](data)
    : [];
  const toggleFields = TOGGLE_FIELDS[data.type]
    ? TOGGLE_FIELDS[data.type](data)
    : [];

  const [isInputFocused, setIsInputFocused] = React.useState(false);
  const onFocus = React.useCallback(() => setIsInputFocused(true), []);
  const onBlur = React.useCallback(() => setIsInputFocused(false), []);

  const [viewer] = useNodeByType("VIEWER");
  const connectNodes = useSocketConnect();

  function handleClick(e) {
    if (e.shiftKey) {
      const socket = data.outputs.find((n) => n.type === "GEOMETRY");
      if (socket && viewer) {
        const params = {
          source: data.id,
          sourceHandle: socket.identifier,
          target: viewer.id,
          targetHandle: viewer.inputs[0].identifier,
        };
        connectNodes(params);
      }
    }
  }

  return (
    <div
      style={{
        borderRadius: 6,
        fontFamily: "sans-serif",
        boxShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
        background: "#303030",
        width: dimensions[0] / 2,
        border: `1px solid ${selected ? "#fff" : "#0f1010"}`,
      }}
      className={isInputFocused ? "nodrag" : null}
      onDoubleClick={handleClick}
    >
      <NodeHeader
        label={
          toCamelCase(data.operation) ||
          data.label ||
          data.default_label ||
          data.name
        }
        type={data.type}
      />
      <div
        style={{
          padding: "2px 0 4px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {outputFields.map((socket) => (
          <NodeOutputField
            key={socket.identifier}
            socket={socket}
            nodeId={data.id}
          />
        ))}
        {data.type === "VALUE" ? (
          <NodeInputField
            socket={outputFields[0]}
            nodeId={data.id}
            onFocus={onFocus}
            onBlur={onBlur}
            isConstant
          />
        ) : data.type === "INPUT_VECTOR" ? (
          <NodeVectorInput
            socket={outputFields[0]}
            nodeId={data.id}
            onFocus={onFocus}
            onBlur={onBlur}
            isConstant
          />
        ) : null}
        {toggleFields.map(({ field, value, options }) => (
          <NodeToggleField
            key={field}
            field={field}
            value={value}
            options={options}
            nodeId={data.id}
          />
        ))}
        {selectFields.map(({ field, value, options }) => (
          <NodeSelectField
            key={field}
            field={field}
            value={value}
            options={options}
            nodeId={data.id}
          />
        ))}
        {inputFields.map((n) => {
          if (n.type === "VECTOR" && n.links.length === 0) {
            return (
              <NodeVectorInput
                key={n.identifier}
                socket={n}
                nodeId={data.id}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            );
          }
          if (n.links.length > 0 || n.type === "GEOMETRY") {
            return (
              <NodeLinkedField key={n.identifier} socket={n} nodeId={data.id} />
            );
          } else if (n.type === "BOOLEAN") {
            return (
              <NodeCheckboxField
                key={n.identifier}
                socket={n}
                nodeId={data.id}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            );
          } else {
            return (
              <NodeInputField
                key={n.identifier}
                socket={n}
                nodeId={data.id}
                onFocus={onFocus}
                onBlur={onBlur}
              />
            );
          }
        })}
      </div>
    </div>
  );
}

const BaseNodeMemo = React.memo(BaseNode);

export function createNodeComponent({ inputs = [], outputs = [] }) {
  const mapping = { inputs, outputs };
  return ({ selected, id }) => (
    <BaseNodeMemo _mapping={mapping} selected={selected} id={id} />
  );
}
