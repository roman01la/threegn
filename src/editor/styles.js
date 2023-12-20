export const TEXT_SHADOW = "0 1px rgba(0,0,0,0.4)";
export const INPUT_BORDER_RADIUS = 4;
export const CHECKBOX_BORDER_RADIUS = 3;
export const ACTIVE_BUTTON_BG = "#3873b8";
export const INPUT_BG = "#545555";

export const COLORS = {
  purple: "#8e294b",
  blue: "#006487",
  green: "#00745e",
  black: "#1d1d1d",
  darkPurple: "#411b26",
  lightPurple: "#3c3c88",
};

export const SOCKET_COLORS = {
  VALUE: "#a1a1a1",
  GEOMETRY: "#00daa0",
  VECTOR: "#6363ce",
  INT: "#488d57",
  BOOLEAN: "#d3a4d9",
};

export const HEADER_COLORS = {
  INDEX: COLORS.purple,
  VALUE: COLORS.purple,
  INPUT_VECTOR: COLORS.purple,

  MAP_RANGE: COLORS.blue,
  MATH: COLORS.blue,
  VECT_MATH: COLORS.lightPurple,
  COMBXYZ: COLORS.blue,
  SEPXYZ: COLORS.blue,

  POINTS: COLORS.green,
  FILLET_CURVE: COLORS.green,
  CURVE_PRIMITIVE_CIRCLE: COLORS.green,
  CURVE_PRIMITIVE_QUADRILATERAL: COLORS.green,
  BOUNDING_BOX: COLORS.green,
  MESH_PRIMITIVE_CUBE: COLORS.green,
  MESH_PRIMITIVE_CYLINDER: COLORS.green,
  MESH_PRIMITIVE_UV_SPHERE: COLORS.green,
  MESH_PRIMITIVE_GRID: COLORS.green,
  CURVE_TO_MESH: COLORS.green,
  INSTANCE_ON_POINTS: COLORS.green,
  SET_MATERIAL: COLORS.green,
  JOIN_GEOMETRY: COLORS.green,
  TRANSFORM_GEOMETRY: COLORS.green,

  GROUP_OUTPUT: COLORS.black,
  GROUP_INPUT: COLORS.black,

  VIEWER: COLORS.darkPurple,
};

export const SOCKET_SHAPES = {
  CIRCLE: {},
  DIAMOND: {
    borderRadius: 0,
    transform: "rotate(45deg)",
    top: 8,
  },
  DIAMOND_DOT: {
    borderRadius: 0,
    transform: "rotate(45deg)",
    top: 8,
  },
};
