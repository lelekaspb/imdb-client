import React from "react";
import { Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatProfession, getPrimaryProfession } from "../../utils/formatLabel";

const FALLBACK_SVG =
  "data:image/svg+xml;base64," +
  btoa(`<svg width="200" height="260" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#e0e0e0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
      font-size="14" fill="#888">No Photo</text>
  </svg>`);

function normalize(v) {
  if (!v) return "";
  if (Array.isArray(v)) return v.join(", ");
  const s = String(v).replace(/[\[\]']+/g, "").trim();
  return s.toLowerCase() === "unknown" ? "" : s;
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

  const roles = normalize(
    person?.allCharacters ??
    person?.characterName ??
    person?.characters
  );

  let imgSrc = FALLBACK_SVG;
  if (person?.profileUrl) imgSrc = person.profileUrl;
  else if (person?.profile_path) {
    imgSrc = person.profile_path.startsWith("/")
      ? `https://image.tmdb.org/t/p/w185${person.profile_path}`
      : person.profile_path;
  }

  return (
    <Card
      className={`h-100 ${className}`}
      role={id ? "button" : undefined}
      onClick={
        id
          ? () =>
              navigate(`/person/${id}`, {
                state: { from: context.from },
              })
          : undefined
      }
      style={{ cursor: id ? "pointer" : "default" }}
    >
      <div style={{ height: 180, position: "relative" }}>
        <img
          src={imgSrc}
          alt={name}
          onError={(e) => (e.currentTarget.src = FALLBACK_SVG)}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />

        {showJobBadge && jobs && (
          <Badge
            bg="dark"
            className="position-absolute bottom-0 start-0 m-2"
          >
            {getPrimaryProfession(jobs)}
          </Badge>
        )}
      </div>

      <Card.Body className="p-2">
        <Card.Title style={{ fontSize: "0.95rem", marginBottom: 4 }}>
          {name}
        </Card.Title>

        {!showJobBadge && (jobs || roles) && (
          <div className="text-muted" style={{ fontSize: "0.8rem" }}>
            {jobs && <div>{jobs}</div>}
            {roles && <div>as {roles}</div>}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
