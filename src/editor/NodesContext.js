import React from "react";

export const NodesContext = React.createContext();
export const NodesContextProvider = NodesContext.Provider;

export function useNodes() {
  return React.useContext(NodesContext);
}

export function useNodeByID(id) {
  const [nodes, setNodes] = useNodes();
  const node = nodes.find((n) => n.id === id);
  const setNode = React.useCallback(
    (f) => setNodes((nodes) => nodes.map((n) => (n.id === id ? f(n) : n))),
    [id]
  );
  return [node, setNode];
}

export function useNodeByType(type) {
  const [nodes, setNodes] = useNodes();
  const node = nodes.find((n) => n.type === type);
  const setNode = React.useCallback(
    (f) => setNodes((nodes) => nodes.map((n) => (n.type === type ? f(n) : n))),
    [type]
  );
  return [node, setNode];
}
