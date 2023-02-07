import React from "react";

export const HandleContext = React.createContext();
export const HandleContextProvider = HandleContext.Provider;

export function useHandle() {
  return React.useContext(HandleContext);
}
