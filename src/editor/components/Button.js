import React from "react";
import * as st from "../styles";

export function Button({ children, style, onClick, active }) {
  const [hover, setHover] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  return (
    <button
      style={{
        borderRadius: 5,
        border: "1px solid #2e2e2e",
        padding: "8px 16px",
        fontSize: "16px",
        fontWeight: 500,
        background:
          pressed || active
            ? st.ACTIVE_BUTTON_BG
            : hover
            ? "#646563"
            : "#545454",
        color: active ? "#fff" : "#d1d1d1",
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
        ...style,
      }}
      onPointerEnter={() => setHover(true)}
      onPointerLeave={() => setHover(false)}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
