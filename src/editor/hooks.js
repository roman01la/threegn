import React from "react";
import * as rf from "reactflow";
import { useNodeByID, useNodes } from "./NodesContext.js";
import { createEdge, edgeToId } from "./node_utils";
import { log } from "./log";

export function useEventListener(
  target,
  name,
  handler,
  useCapture = false,
  deps = []
) {
  React.useEffect(() => {
    target.addEventListener(name, handler, useCapture);
    return () => target.removeEventListener(name, handler, useCapture);
  }, [target, name, handler, useCapture, ...deps]);
}

// updates node's field from node's UI
// select fields, check boxes, etc
export function useNodeChange({ nodeId, onChange }) {
  const [_, setNode] = useNodeByID(nodeId);
  return React.useCallback(
    (...args) => {
      setNode((node) => onChange(node, ...args));
    },
    [setNode, onChange]
  );
}

// updates node's socket from node's UI
// inputs fields etc
export function useNodeSocketChange({
  onChange,
  nodeId,
  socketId,
  isConstant,
}) {
  const [_, setNode] = useNodeByID(nodeId);
  return React.useCallback(
    (...args) => {
      const value = onChange(...args);
      setNode((node) => {
        const field = isConstant ? "outputs" : "inputs";
        const values = node[field].map((n) =>
          n.identifier === socketId ? { ...n, value } : n
        );
        return { ...node, [field]: values };
      });
    },
    [onChange, isConstant, setNode]
  );
}

function findNodeByID({ nodes, id }) {
  return nodes.find((n) => n.id === id);
}

function findSocketByID({ node, socketType, id }) {
  return node[socketType].find((n) => n.identifier === id);
}

function createLinkInNode({
  linkType,
  node,
  nodeSocket,
  linkedNodeSocket,
  linkedNodeName,
}) {
  const values = node[linkType].map((n) => {
    if (n.identifier === nodeSocket) {
      const link = {
        node: linkedNodeName,
        socket: linkedNodeSocket,
      };
      return { ...n, links: [...n.links, link] };
    }
    return n;
  });
  return { ...node, [linkType]: values };
}

function removeLinkInNode({
  linkType,
  node,
  nodeSocket,
  targetSocket,
  sourceNode,
}) {
  if (linkType === "inputs") {
    // handling multi input sockets
    const inputs = node.inputs.map((n) => {
      if (n.identifier === targetSocket) {
        return {
          ...n,
          links: n.links.filter((l) => l.node.name !== sourceNode.name),
        };
      }
      return n;
    });
    return { ...node, inputs };
  } else {
    const outputs = node[linkType].map((n) => {
      return { ...n, links: n.links.filter((l) => l.socket !== nodeSocket) };
    });
    return { ...node, outputs };
  }
}

// update links in Geo Nodes data
export function applyEdgeChangeToNodes(setNodes, ops) {
  log("applyEdgeChangeToNodes");
  setNodes((nodes) => {
    return ops.reduce((nodes, { params, op }) => {
      const sourceNode = findNodeByID({ id: params.source, nodes });
      const targetNode = findNodeByID({ id: params.target, nodes });

      return nodes.map((node) => {
        if (node.id === params.source) {
          if (op === "create") {
            return createLinkInNode({
              linkType: "outputs",
              node,
              nodeSocket: params.sourceHandle,
              linkedNodeSocket: params.targetHandle,
              linkedNodeName: targetNode.name,
            });
          } else if (op === "remove") {
            return removeLinkInNode({
              linkType: "outputs",
              node,
              nodeSocket: params.targetHandle,
            });
          }
        }
        if (node.id === params.target) {
          if (op === "create") {
            return createLinkInNode({
              linkType: "inputs",
              node,
              nodeSocket: params.targetHandle,
              linkedNodeSocket: params.sourceHandle,
              linkedNodeName: sourceNode.name,
            });
          } else if (op === "remove") {
            return removeLinkInNode({
              linkType: "inputs",
              node,
              nodeSocket: params.sourceHandle,
              targetSocket: params.targetHandle,
              sourceNode,
            });
          }
        }
        return node;
      });
    }, nodes);
  });
}

// handle new links between rf nodes
// and propagate change to geo nodes
export function useSocketConnect() {
  const { setEdges, getEdges } = rf.useReactFlow();
  const [nodes, setNodes] = useNodes();

  return React.useCallback(
    (params) => {
      // create edge in ReactFlow state
      const source = findSocketByID({
        id: params.sourceHandle,
        socketType: "outputs",
        node: findNodeByID({ id: params.source, nodes }),
      });
      const target = findSocketByID({
        id: params.targetHandle,
        socketType: "inputs",
        node: findNodeByID({ id: params.target, nodes }),
      });

      const edge = createEdge({
        ...params,
        data: {
          sourceSocket: { type: source.type, shape: source.display_shape },
          targetSocket: {
            type: target.type,
            shape: target.display_shape,
          },
        },
      });

      const edgeToRemove = getEdges().find(
        (e) =>
          e.target === params.target && e.targetHandle === params.targetHandle
      );

      if (target.is_multi_input || !edgeToRemove) {
        // add an edge for multi input sockets
        setEdges((edges) => rf.addEdge(edge, edges));
        applyEdgeChangeToNodes(setNodes, [{ params, op: "create" }]);
      } else {
        // replace an edge for single input sockets
        // but only if it's not the same edge
        if (edgeToId(params) !== edgeToRemove.id) {
          const removeParams = {
            source: edgeToRemove.source,
            sourceHandle: edgeToRemove.sourceHandle,
            target: params.target,
            targetHandle: params.targetHandle,
          };
          setEdges((edges) =>
            rf.addEdge(edge, edges).filter((e) => e.id !== edgeToRemove.id)
          );
          applyEdgeChangeToNodes(setNodes, [
            { params, op: "create" },
            { params: removeParams, op: "remove" },
          ]);
        }
      }
    },
    [nodes, setEdges, getEdges, setNodes]
  );
}

// sync rf nodes state to geo nodes
export function useSyncNodesState({ setNodes, nodes }) {
  React.useEffect(() => {
    if (nodes.length > 0) {
      log("useSyncNodesState");
      const ids = new Set(nodes.map((n) => n.id));
      setNodes((nodes) => nodes.filter((n) => ids.has(n.id)));
    }
  }, [
    nodes
      .map((n) => n.id)
      .sort()
      .join(),
  ]);
}

export function useApplyNodes() {
  const [_, setNodes] = useNodes();
  const rfv = rf.useReactFlow();
  return function ({ geoNodes, rfState: [nodes, edges] }) {
    log("useApplyNodes");
    // FIXME: ugly
    rfv.setNodes([]);
    rfv.setEdges([]);
    setTimeout(() => {
      setNodes(geoNodes);
      rfv.setNodes(nodes);
      rfv.setEdges(edges);
      setTimeout(() => rfv.fitView({ duration: 100 }), 100);
    }, 100);
  };
}
