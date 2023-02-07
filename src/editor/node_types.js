import { createNodeComponent } from "./nodes/BaseNode";

export const nodeTypes = {
  Utilities: [
    { name: "Map Range", type: "MAP_RANGE" },
    { name: "Math", type: "MATH" },
  ],
  Vector: [
    { name: "Combine XYZ", type: "COMBXYZ" },
    { name: "Separate XYZ", type: "SEPXYZ" },
    { name: "Vector Math", type: "VECT_MATH" },
  ],
  Input: [
    { name: "Index", type: "INDEX" },
    { name: "Value", type: "VALUE" },
    { name: "Vector", type: "INPUT_VECTOR" },
  ],
  Output: [{ name: "Viewer", type: "VIEWER" }],
  Point: [{ name: "Points", type: "POINTS" }],
  Instances: [{ name: "Instance on Points", type: "INSTANCE_ON_POINTS" }],
  "Curve Primitives": [
    { name: "Curve Circle", type: "CURVE_PRIMITIVE_CIRCLE" },
    { name: "Quadrilateral", type: "CURVE_PRIMITIVE_QUADRILATERAL" },
  ],
  Curve: [
    { name: "Curve to Mesh", type: "CURVE_TO_MESH" },
    { name: "Fillet Curve", type: "FILLET_CURVE" },
  ],
  "Mesh Primitives": [
    { name: "Cube", type: "MESH_PRIMITIVE_CUBE" },
    { name: "Cylinder", type: "MESH_PRIMITIVE_CYLINDER" },
    { name: "UV Sphere", type: "MESH_PRIMITIVE_UV_SPHERE" },
    { name: "Grid", type: "MESH_PRIMITIVE_GRID" },
  ],
  Geometry: [
    { name: "Join Geometry", type: "JOIN_GEOMETRY" },
    { name: "Transform", type: "TRANSFORM" },
    { name: "Bounding Box", type: "BOUNDING_BOX" },
  ],
  Material: [{ name: "Set Material", type: "SET_MATERIAL" }],
  Group: [
    { name: "Group Input", type: "GROUP_INPUT" },
    { name: "Group Output", type: "GROUP_OUTPUT" },
  ],
};

export const nodeComponentTypes = {
  MAP_RANGE: createNodeComponent({ inputs: [0, 1, 2, 3, 4], outputs: [0] }),
  MATH: createNodeComponent({ inputs: [0, 1, 2], outputs: [0] }),
  VECT_MATH: createNodeComponent({ inputs: [0, 1, 2, 3], outputs: [0] }),
  COMBXYZ: createNodeComponent({ inputs: [0, 1, 2], outputs: [0] }),
  SEPXYZ: createNodeComponent({ inputs: [0], outputs: [0, 1, 2] }),

  INDEX: createNodeComponent({ outputs: [0] }),
  VALUE: createNodeComponent({ outputs: [0] }),
  INPUT_VECTOR: createNodeComponent({ outputs: [0] }),

  VIEWER: createNodeComponent({
    inputs: [0],
  }),

  POINTS: createNodeComponent({ inputs: [0, 1, 2], outputs: [0] }),
  FILLET_CURVE: createNodeComponent({ inputs: [0, 1, 2, 3], outputs: [0] }),
  CURVE_PRIMITIVE_CIRCLE: createNodeComponent({
    inputs: [0, 4],
    outputs: [0],
  }),
  CURVE_PRIMITIVE_QUADRILATERAL: createNodeComponent({
    inputs: [0, 1],
    outputs: [0],
  }),
  BOUNDING_BOX: createNodeComponent({
    inputs: [0],
    outputs: [0, 1, 2],
  }),
  CURVE_TO_MESH: createNodeComponent({
    inputs: [0, 1],
    outputs: [0],
  }),
  MESH_PRIMITIVE_CUBE: createNodeComponent({
    inputs: [0, 1, 2, 3],
    outputs: [0],
  }),
  MESH_PRIMITIVE_CYLINDER: createNodeComponent({
    inputs: [0, 1, 2, 3, 4],
    outputs: [0, 1, 2, 3],
  }),
  MESH_PRIMITIVE_UV_SPHERE: createNodeComponent({
    inputs: [0, 1, 2],
    outputs: [0],
  }),
  MESH_PRIMITIVE_GRID: createNodeComponent({
    inputs: [0, 1, 2, 3],
    outputs: [0],
  }),
  JOIN_GEOMETRY: createNodeComponent({ inputs: [0], outputs: [0] }),
  TRANSFORM: createNodeComponent({ inputs: [0, 1, 2, 3], outputs: [0] }),
  INSTANCE_ON_POINTS: createNodeComponent({
    inputs: [0, 2, 5, 6],
    outputs: [0],
  }),
  SET_MATERIAL: createNodeComponent({
    inputs: [0],
    outputs: [0],
  }),

  GROUP_OUTPUT: createNodeComponent({
    inputs: [0],
  }),
  GROUP_INPUT: createNodeComponent({
    outputs: [0],
  }),
};

// Making sure things are in sync
const a = Object.values(nodeTypes)
  .flatMap((n) => n)
  .map((n) => n.type);
const b = Object.keys(nodeComponentTypes);

a.forEach((item) => {
  if (!b.includes(item)) {
    throw new Error(
      `Node type ${item} doesn't have corresponding component registered`
    );
  }
});

b.forEach((item) => {
  if (!a.includes(item)) {
    throw new Error(
      `Node type ${item} doesn't have corresponding menu item registered`
    );
  }
});
