import React from "react";
import { Card, ListGroup } from "react-bootstrap";
import {
  Film,
  Globe,
  CalendarEvent,
  Tags,
  Clock,
  PersonBadge,
} from "react-bootstrap-icons";
import { formatProfession } from "../../utils/formatLabel";

function iconForLabel(label = "") {
  const l = label.toLowerCase();

  if (l.includes("plot")) return Film;
  if (l.includes("genre")) return Tags;
  if (l.includes("language") || l.includes("country")) return Globe;
  if (
    l.includes("release") ||
    l.includes("year") ||
    l.includes("born") ||
    l.includes("died")
  )
    return CalendarEvent;
  if (l.includes("runtime")) return Clock;
  if (l.includes("profession")) return PersonBadge;

  return Film;
}

function formatValue(label, value) {
  if (!value) return null;

  //  Reuse PersonCard formatting for professions
  if (label.toLowerCase().includes("profession")) {
    return formatProfession(value);
  }

  // Default: stringify safely
  return typeof value === "string" ? value : String(value);
}

export default function InfoCard({ title = "About", items = [] }) {
  if (!items || items.length === 0) return null;

  return (
    <Card className="shadow-sm rounded">
      <Card.Body>
        <h5 className="mb-3">{title}</h5>
        <ListGroup variant="flush">
          {items.map((it, idx) => {
            const value = formatValue(it.label, it.value);
            if (!value) return null;

            const Icon = iconForLabel(it.label);

            return (
              <ListGroup.Item key={idx} className="px-0 py-2">
                <div className="d-flex align-items-start gap-3">
                  <div style={{ width: 26, marginTop: 2 }}>
                    <Icon />
                  </div>
                  <div>
                    <div style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                      {it.label}
                    </div>
                    <div className="text-muted small mt-1">
                      {value}
                    </div>
                  </div>
                </div>
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </Card.Body>
    </Card>
  );
}
