import React from "react";
import * as st from "../styles.js";

export function Label({ style, children }) {
  return (
    <div
      style={{
        padding: "2px 0",
        color: "#fff",
        fontSize: "12px",
        flex: 1,
        textShadow: st.TEXT_SHADOW,
        ...style,
      }}
    >
      {children}
    </div>
  );
}
