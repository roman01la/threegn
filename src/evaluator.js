import * as THREE from "three";
import * as n from "./nodes.js";
import { enrichNodes } from "./editor/node_utils";

function findNodesByType(type, node) {
  const ret = new Set();

  function _findNodesByType(node) {
    if (node.type === type) {
      ret.add(node);
    }
    node.inputs
      .flatMap((input) => input.links)
      .forEach((link) => _findNodesByType(link.node));
  }

  _findNodesByType(node);

  return [...ret];
}

function _readValue(input) {
  return input.links.map(({ node, socket }) => [
    node,
    node.outputs.findIndex((out) => out.identifier === socket),
  ]);
}

// takes `_node` and `idx` of an input socket to read a value from
// returns a tuple with `sidx` of a linked socket and linked node
function readValue(_node, idx) {
  const input = _node.inputs[idx];
  if (input.is_multi_input) {
    return _readValue(input);
  } else if (input.links[0]) {
    return _readValue(input)[0];
  } else if (input.type === "VECTOR") {
    return [
      {
        type: "INPUT_VECTOR",
        outputs: [{ value: new THREE.Vector3(...input.value) }],
      },
      0,
    ];
  } else {
    return [
      {
        type: { BOOLEAN: "BOOLEAN" }[input.type] || "VALUE",
        outputs: [{ value: input.value }],
      },
      0,
    ];
  }
}

function applyNode(f, inputs) {
  return (node, sidx) =>
    f(
      sidx,
      inputs.map((idx) => _evaluateNode(readValue(node, idx)))
    );
}

const nodeTypeToFn = {
  INDEX: (node) => {
    return n._index;
  },
  // FIXME: not implemented yet
  SET_MATERIAL: (node, sidx) => _evaluateNode(readValue(node, 0)),

  GROUP_INPUT: (node, sidx) => n.groupInput(sidx, node.outputs[0].value),

  // manual inputs reading directly from outputs
  VALUE: (node) => n.value(node.outputs[0].value),
  BOOLEAN: (node) => n.boolean(node.outputs[0].value),
  INPUT_VECTOR: (node) => n.inputVector(node.outputs[0].value),

  GROUP_OUTPUT: applyNode(n.groupOutput, [0]),
  VIEWER: applyNode(n.viewer, [0]),
  TRANSFORM_GEOMETRY: applyNode(n.transform, [0, 1, 2, 3]),
  INSTANCE_ON_POINTS: applyNode(n.instanceOnPoints, [0, 2, 5, 6]),
  POINTS: applyNode(n.points, [0, 1, 2]),

  VECT_MATH: (node) =>
    _evaluateNode([{ ...node, type: `VECT_MATH/${node.operation}` }, 0]),
  "VECT_MATH/ADD": applyNode(n.vecAdd, [0, 1]),
  "VECT_MATH/SUBTRACT": applyNode(n.vecSubtract, [0, 1]),
  "VECT_MATH/DIVIDE": applyNode(n.vecDivide, [0, 1]),

  MATH: (node) =>
    _evaluateNode([{ ...node, type: `MATH/${node.operation}` }, 0]),
  "MATH/MULTIPLY": applyNode(n.multiply, [0, 1]),
  "MATH/MULTIPLY_ADD": applyNode(n.multiplyAdd, [0, 1, 2]),
  "MATH/DIVIDE": applyNode(n.divide, [0, 1]),
  "MATH/ADD": applyNode(n.add, [0, 1]),
  "MATH/SUBTRACT": applyNode(n.subtract, [0, 1]),
  "MATH/MODULO": applyNode(n.modulo, [0, 1]),
  "MATH/POWER": applyNode(n.power, [0, 1]),
  "MATH/LOGARITHM": applyNode(n.logarithm, [0, 1]),
  "MATH/MINIMUM": applyNode(n.min, [0, 1]),
  "MATH/MAXIMUM": applyNode(n.max, [0, 1]),
  "MATH/ABSOLUTE": applyNode(n.abs, [0]),
  "MATH/EXPONENT": applyNode(n.exp, [0]),
  "MATH/SQRT": applyNode(n.sqrt, [0]),
  "MATH/INVERSE_SQRT": applyNode(n.inverseSqrt, [0]),
  "MATH/FLOOR": applyNode(n.floor, [0]),
  "MATH/COSINE": applyNode(n.cos, [0]),
  "MATH/RADIANS": applyNode(n.toRad, [0]),

  COMBXYZ: applyNode(n.combineXYZ, [0, 1, 2]),
  SEPXYZ: applyNode(n.separateXYZ, [0]),
  CURVE_TO_MESH: applyNode(n.curveToMesh, [0, 1]),
  FILLET_CURVE: applyNode(n.filletCurve, [0, 1, 2, 3]),
  CURVE_PRIMITIVE_CIRCLE: applyNode(n.curveCirlce, [0, 4]),
  CURVE_PRIMITIVE_QUADRILATERAL: applyNode(
    n.curvePrimitiveQuadrilaterl,
    [0, 1]
  ),
  BOUNDING_BOX: applyNode(n.boundingBox, [0]),
  MESH_PRIMITIVE_CUBE: applyNode(n.meshPrimitiveCube, [0, 1, 2, 3]),
  MESH_PRIMITIVE_LINE: applyNode(n.meshPrimitiveLine, [0, 1, 2, 3]),
  
  MESH_PRIMITIVE_CYLINDER: applyNode(n.meshPrimitiveCylinder, [0, 1, 2, 3, 4]),
  MESH_PRIMITIVE_UV_SPHERE: applyNode(n.meshPrimitiveUVSphere, [0, 1, 2]),
  MESH_PRIMITIVE_GRID: applyNode(n.meshPrimitiveGrid, [0, 1, 2, 3]),
  MAP_RANGE: applyNode(n.mapRange, [1, 2, 3, 4, 0]),

  // nodes with multiple inputs per socket
  JOIN_GEOMETRY: (node) =>
    n.joinGeometry(readValue(node, 0).map((n) => _evaluateNode(n))),

  // MESH_BOOLEAN: (node) =>
  //   n.meshBoolean(readValue(node, 0).map((n) => _evaluateNode(n))),
};

function _evaluateNode([node, sidx]) {
  const nodeFn = nodeTypeToFn[node.type];

  if (nodeFn === undefined) {
    console.log(node);
    throw new Error(`no evaluator for node type ${node.type}`);
  } else {
    // console.log(node);
    return nodeFn(node, sidx);
  }
}

export function evaluateNode(node) {
  const indexNode = findNodesByType("INDEX", node)[0];
  if (indexNode) {
    indexNode._value = n._index;
  }

  return _evaluateNode([node, 0]);
}

export function buildNodes(_nodes) {
  const nodes = enrichNodes(_nodes);
  // graph root (geo nodes output node)
  const out = nodes.find((n) => n.type === "GROUP_OUTPUT");
  let viewer = nodes.find((n) => n.type === "VIEWER");
  viewer = viewer ? evaluateNode(viewer).compute() : null;

  if (out) {
    // hydrate graph
    const gn = evaluateNode(out);

    // execute graph
    const geometry = gn.compute();

    return { geometry, viewer };
  }
  return { viewer };
}
