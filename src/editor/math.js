import * as rf from "reactflow";

function calculateControlOffset(distance, curvature) {
  if (distance >= 0) {
    return 0.5 * distance;
  }
  return curvature * 25 * Math.sqrt(-distance);
}

function getControlWithCurvature({ pos, x1, y1, x2, y2, c }) {
  switch (pos) {
    case rf.Position.Left:
      return [x1 - calculateControlOffset(x1 - x2, c), y1];
    case rf.Position.Right:
      return [x1 + calculateControlOffset(x2 - x1, c), y1];
    case rf.Position.Top:
      return [x1, y1 - calculateControlOffset(y1 - y2, c)];
    case rf.Position.Bottom:
      return [x1, y1 + calculateControlOffset(y2 - y1, c)];
  }
}

export function getBezierPoints({
  sourceX,
  sourceY,
  sourcePosition = Position.Bottom,
  targetX,
  targetY,
  targetPosition = Position.Top,
  curvature = 0.25,
}) {
  const [sourceControlX, sourceControlY] = getControlWithCurvature({
    pos: sourcePosition,
    x1: sourceX,
    y1: sourceY,
    x2: targetX,
    y2: targetY,
    c: curvature,
  });
  const [targetControlX, targetControlY] = getControlWithCurvature({
    pos: targetPosition,
    x1: targetX,
    y1: targetY,
    x2: sourceX,
    y2: sourceY,
    c: curvature,
  });
  return [
    sourceX,
    sourceY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY,
    targetX,
    targetY,
  ];
}
