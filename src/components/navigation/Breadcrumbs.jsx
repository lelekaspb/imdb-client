// src/components/navigation/Breadcrumbs.jsx
import React from "react";
import { Breadcrumb, Fade } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";

export default function Breadcrumbs({ trail = [] }) {
  const navigate = useNavigate();
  const location = useLocation();

  const first = trail[0];
  let root = null;

  //  If trail already starts with Home or Browse → DO NOT add another
  if (first?.label === "Home" || first?.label === "Browse") {
    root = null;
  }

  // If navigation state explicitly defines origin
  else if (location.state?.from?.label && location.state?.from?.path) {
    root = location.state.from;
  }

  // Infer from URL (refresh / direct hit)
  else if (location.pathname.startsWith("/browse")) {
    root = { label: "Browse", path: "/browse" };
  } else if (
    location.pathname.startsWith("/movie") ||
    location.pathname.startsWith("/series") ||
    location.pathname.startsWith("/episode")
  ) {
    root = { label: "Browse", path: "/browse" };
  } else {
    root = { label: "Home", path: "/" };
  }

  const list = root ? [root, ...trail] : trail;

  return (
    <Fade in appear>
      <Breadcrumb
        style={{
          cursor: "pointer",
          fontSize: "0.95rem",
          padding: 0,
        }}
      >
        {list.map((item, i) => (
          <Breadcrumb.Item
            key={`${item.label}-${i}`}
            active={i === list.length - 1}
            onClick={() =>
              i !== list.length - 1 && navigate(item.path)
            }
          >
            {item.label}
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
    </Fade>
  );
}
