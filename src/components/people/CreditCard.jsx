import React from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function CreditCard({ credit }) {
  const navigate = useNavigate();

  // HARD GUARD
  if (!credit) return null;

  // Normalize ID safely
  const id =
    credit.tconst ??
    credit.Tconst ??
    credit.id ??
    null;

  if (!id) return null;

  const title =
    credit.primaryTitle ??
    credit.title ??
    credit.movieTitle ??
    credit.seriesTitle ??
    "Untitled";

  const year =
    credit.year ??
    credit.startYear ??
    "";

  const role =
    credit.characterName ??
    credit.job ??
    credit.role ??
    "";

  const poster =
    credit.posterUrl ??
    credit.poster ??
    credit.profileUrl ??
    null;

  // Determine navigation target
  const type = String(
    credit.titleType ??
    credit.type ??
    ""
  ).toLowerCase();

  const path =
    type.includes("episode")
      ? `/episode/${id}`
      : type.includes("series")
      ? `/series/${id}`
      : `/movie/${id}`;

  const handleClick = () => {
    navigate(path, {
      state: {
        from: {
          label: title,
          path,
        },
      },
    });
  };

  return (
    <Card
      className="h-100"
      role="button"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <div style={{ height: 200, overflow: "hidden" }}>
        {poster ? (
          <img
            src={poster}
            alt={title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              background: "#e0e0e0",
            }}
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div
            style={{
              height: "100%",
              background: "#e0e0e0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span className="text-muted small">No Poster</span>
          </div>
        )}
      </div>

      <Card.Body className="p-2">
        <Card.Title
          style={{
            fontSize: "0.9rem",
            marginBottom: "0.25rem",
          }}
        >
          {title}
        </Card.Title>

        {year && (
          <div className="text-muted small">
            {year}
          </div>
        )}

        {role && (
          <div className="text-muted small mt-1">
            <strong>Role:</strong>{" "}
            {String(role).replace(/^\[|\]$/g, "")}
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
