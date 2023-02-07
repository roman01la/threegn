import React from "react";
import * as st from "../styles.js";

export function NodeHeader({ label, type }) {
  return (
    <div
      style={{
        background: st.HEADER_COLORS[type],
        color: "#fff",
        padding: "4px 12px",
        fontSize: "12px",
        borderTopLeftRadius: 5,
        borderTopRightRadius: 5,
        boxShadow: "inset 0 -1px rgba(0,0,0,0.4)",
        textShadow: st.TEXT_SHADOW,
      }}
    >
      {label}
    </div>
  );
}
