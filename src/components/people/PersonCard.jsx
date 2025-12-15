import React from "react";
import { Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatProfession, getPrimaryProfession } from "../../utils/formatLabel";
import SmartImage from "../common/SmartImage";

function normalize(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.join(", ");
  return String(v).replace(/[\[\]']+/g, "").trim();
}

export default function PersonCard({
  person,
  context = {},
  className = "",
  showJobBadge = false,
}) {
  const navigate = useNavigate();

  const id = person?.nconst ?? person?.id;
  const name = person?.primaryName ?? person?.name ?? "Unknown";

  const jobs = normalize(
    person?.allJobs ??
    person?.job ??
    person?.profession ??
    person?.primaryProfession
  );

  return (
    <Card
      className={`h-100 ${className}`}
      role={id ? "button" : undefined}
      onClick={id ? () => navigate(`/person/${id}`, { state: { from: context.from } }) : undefined}
      style={{ cursor: id ? "pointer" : "default" }}
    >
      <div style={{ height: 180, position: "relative" }}>
        <SmartImage
          src={person?.profileUrl}
          tmdbPath={person?.profile_path}
          type="person"
          name={name}
          tmdbSize="w185"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {showJobBadge && jobs && (
          <Badge bg="dark" className="position-absolute bottom-0 start-0 m-2">
            {getPrimaryProfession(jobs)}
          </Badge>
        )}
      </div>

      <Card.Body className="p-2">
        <Card.Title style={{ fontSize: "0.95rem", marginBottom: 4 }}>
          {name}
        </Card.Title>

        {!showJobBadge && jobs && (
          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
            {jobs}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
