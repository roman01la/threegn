import React from "react";
import { nodeTypes } from "../node_types.js";
import { useEventListener } from "../hooks.js";
import * as st from "../styles.js";

const BORDER_COLOR = "#2e2e2f";
const ACTIVE_ITEM_COLOR = "#3973b8";
const TEXT_COLOR = "#dbdbdb";
const ACTIVE_TEXT_COLOR = "#fff";

function MenuHeader({ children }) {
  return (
    <div style={{ color: "#fff", fontSize: "12px", padding: "8px 8px" }}>
      {children}
    </div>
  );
}

function SearchField({ onChange, value }) {
  const ref = React.useRef();

  React.useEffect(() => {
    setTimeout(() => ref.current.focus(), 0);
  }, []);

  return (
    <div
      style={{
        padding: "8px 8px",
        borderBottom: `1px solid ${BORDER_COLOR}`,
      }}
    >
      <input
        ref={ref}
        placeholder="Search..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          textShadow: st.TEXT_SHADOW,
          background: "transparent",
          border: "none",
          color: TEXT_COLOR,
          padding: "4px 8px",
        }}
      />
    </div>
  );
}

function ListSubItem({ children, onClick }) {
  const [isActive, setIsActive] = React.useState(false);

  return (
    <div
      style={{
        textShadow: st.TEXT_SHADOW,
        color: isActive ? ACTIVE_TEXT_COLOR : TEXT_COLOR,
        fontSize: "12px",
        padding: "4px 8px 4px 16px",
        background: isActive ? ACTIVE_ITEM_COLOR : "transparent",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
      onClick={onClick}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
    >
      {children}
    </div>
  );
}

function SubMenu({ items, coords, onItemSelect }) {
  return (
    <div
      style={{
        position: "absolute",
        left: coords.x + coords.width - 8,
        top: -9,
        background: "#181719",
        borderRadius: 5,
        border: `1px solid ${BORDER_COLOR}`,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
        width: 160,
      }}
    >
      <div style={{ padding: "8px 0" }}>
        {items
          .sort((a, b) => a.name > b.name)
          .map(({ name, type }) => (
            <ListSubItem
              key={name}
              value={type}
              onClick={() => onItemSelect(type)}
            >
              {name}
            </ListSubItem>
          ))}
      </div>
    </div>
  );
}

const arrowIcon = (
  <svg
    width={8}
    height={8}
    viewBox="0 0 10 11"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M9.5 5.5L0.5 10.6962L0.5 0.303847L9.5 5.5Z" fill={TEXT_COLOR} />
  </svg>
);

function ListItem({
  items,
  children,
  onItemSelect,
  onMouseEnter,
  onMouseLeave,
  isHovered,
}) {
  const ref = React.useRef();
  const [isActive, setIsActive] = React.useState(false);
  const [coords, setCoords] = React.useState({});

  React.useEffect(() => {
    if (isHovered) {
      const tid = setTimeout(() => {
        setIsActive(true);
      }, 150);
      return () => clearTimeout(tid);
    }
  }, [isHovered]);

  React.useEffect(() => {
    if (!isHovered) {
      setIsActive(false);
    }
  }, [isHovered]);

  React.useLayoutEffect(() => {
    if (isHovered) {
      const { x, y, width, height } = ref.current.getBoundingClientRect();
      setCoords({ x, y, width, height });
    }
  }, [isHovered]);

  return (
    <div
      style={{
        textShadow: st.TEXT_SHADOW,
        color: isHovered ? ACTIVE_TEXT_COLOR : TEXT_COLOR,
        fontSize: "12px",
        padding: "4px 8px 4px 16px",
        background: isHovered ? ACTIVE_ITEM_COLOR : "transparent",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        position: "relative",
      }}
      ref={ref}
      onClick={items ? null : onItemSelect}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {children}
      {items ? arrowIcon : null}
      {items && isActive ? (
        <SubMenu items={items} coords={coords} onItemSelect={onItemSelect} />
      ) : null}
    </div>
  );
}

function hasParent(targetNode, element) {
  if (element === targetNode) {
    return true;
  }
  if (!element.parentElement) {
    return false;
  }
  return hasParent(targetNode, element.parentElement);
}

function searchItems(nodeTypes, query) {
  return Object.values(nodeTypes)
    .flatMap((n) => n)
    .filter((n) => {
      const abbr = n.name
        .toLowerCase()
        .split(/\s+/)
        .map((w) => w[0])
        .join("");
      const match = n.name
        .toLowerCase()
        .replace(/\s/g, "")
        .includes(query.toLowerCase());
      return abbr.startsWith(query.toLowerCase()) || match;
    })
    .sort((a, b) => a.name > b.name);
}

export function AddNodeMenu({ onClose, onAddNode }) {
  const onItemSelect = React.useCallback(
    (nodeType) => {
      onClose();
      onAddNode(nodeType);
    },
    [onClose, onAddNode]
  );

  const [query, setQuery] = React.useState("");

  const [hoveredIdx, setHoveredIdx] = React.useState(false);

  const hasQuery = query.length > 0;
  React.useEffect(() => {
    if (hasQuery) {
      setHoveredIdx(0);
    }
  }, [hasQuery]);

  const ref = React.useRef();
  useEventListener(
    document,
    "mousedown",
    (e) => {
      if (!hasParent(ref.current, e.target)) {
        onClose();
      }
    },
    true,
    [onClose]
  );

  const items = React.useMemo(
    () => (query.length > 0 ? searchItems(nodeTypes, query) : null),
    [query]
  );

  useEventListener(
    document,
    "keydown",
    (e) => {
      if (e.key === "Escape") {
        onClose();
      } else if (hoveredIdx !== false && items && items.length > 0) {
        if (e.key === "Enter") {
          onItemSelect(items[hoveredIdx].type);
        } else if (e.key === "ArrowDown") {
          setHoveredIdx(items.length === hoveredIdx + 1 ? 0 : hoveredIdx + 1);
        } else if (e.key === "ArrowUp") {
          setHoveredIdx(
            hoveredIdx - 1 === -1 ? items.length - 1 : hoveredIdx - 1
          );
        }
      }
    },
    false,
    [hoveredIdx, items, onItemSelect, onClose]
  );

  return (
    <div
      style={{
        background: "#181719",
        borderRadius: 5,
        border: `1px solid ${BORDER_COLOR}`,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.2)",
        position: "absolute",
        top: 40,
        left: 8,
      }}
      ref={ref}
    >
      {/* <MenuHeader>Add node</MenuHeader> */}
      <SearchField value={query} onChange={setQuery} />
      <div style={{ padding: "8px 0" }}>
        {items
          ? items.map(({ name, type }, idx) => (
              <ListItem
                key={name}
                isHovered={hoveredIdx === idx}
                onItemSelect={() => onItemSelect(type)}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(false)}
              >
                {name}
              </ListItem>
            ))
          : Object.entries(nodeTypes)
              .sort()
              .map(([name, items], idx) => (
                <ListItem
                  key={name}
                  items={items}
                  isHovered={hoveredIdx === idx}
                  onItemSelect={onItemSelect}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(false)}
                >
                  {name}
                </ListItem>
              ))}
      </div>
    </div>
  );
}
