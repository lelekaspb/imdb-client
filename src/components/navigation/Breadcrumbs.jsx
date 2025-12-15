import React from "react";
import { Breadcrumb, Fade } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function Breadcrumbs({ trail = [] }) {
  const navigate = useNavigate();
  const list = [{ label: "Browse", path: "/" }, ...trail];

  return (
    <Fade in={true} appear={true}>
      <div>
        <Breadcrumb style={{ cursor: "pointer", fontSize: "0.95rem", padding: 0 }}>
          {list.map((item, i) => (
            <Breadcrumb.Item
              key={i}
              active={i === list.length - 1}
              onClick={() => i !== list.length - 1 && navigate(item.path ?? "/")}
            >
              {item.label}
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
    </Fade>
  );
}
