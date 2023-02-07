import * as math from "./math";
import { Bezier } from "bezier-js";
import * as rf from "reactflow";
import React from "react";

export function nodeIntersectsEdges(node, edges, nodeInternals) {
  const { width, height } = node;
  const { x, y } = node.position;

  const nodeLines = [
    { p1: { x, y }, p2: { x: x + width, y } },
    { p1: { x: x + width, y }, p2: { x: x + width, y: y + height } },
    { p1: { x, y: y + height }, p2: { x: x + width, y: y + height } },
    { p1: { x, y }, p2: { x, y: y + height } },
  ];

  const edgeCurves = edges.map((edge) => {
    const { source, sourceHandle, target, targetHandle } = edge;
    const sourceNode = nodeInternals.get(source);
    const targetNode = nodeInternals.get(target);
    const sourceSocket = sourceNode[
      rf.internalsSymbol
    ].handleBounds.source.find((s) => s.id === sourceHandle);
    const targetSocket = targetNode[
      rf.internalsSymbol
    ].handleBounds.target.find((s) => s.id === targetHandle);

    const bezierPoints = math.getBezierPoints({
      sourceX: sourceNode.position.x + sourceSocket.x,
      sourceY: sourceNode.position.y + sourceSocket.y,
      sourcePosition: sourceSocket.position,
      targetX: targetNode.position.x + targetSocket.x,
      targetY: targetNode.position.y + targetSocket.y,
      targetPosition: targetSocket.position,
    });

    return {
      edge,
      curve: new Bezier(...bezierPoints),
    };
  });

  const intersectedCurves = edgeCurves.filter((c) =>
    nodeLines.some((l) => c.curve.intersects(l).length > 0)
  );

  return intersectedCurves.map((int) => int.edge);
}

export function useNodeIntersectsEdges() {
  const store = rf.useStoreApi();

  return React.useCallback(
    (node, edges) => {
      const nodeInternals = store.getState().nodeInternals;
      return nodeIntersectsEdges(node, edges, nodeInternals);
    },
    [store]
  );
}
