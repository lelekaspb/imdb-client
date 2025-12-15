import React from "react";
import { Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SmartImage from "../common/SmartImage";

export default function CreditCard({ credit }) {
  const navigate = useNavigate();
  if (!credit) return null;

  const id = credit.tconst ?? credit.id;
  if (!id) return null;

  const title =
    credit.primaryTitle ??
    credit.title ??
    credit.movieTitle ??
    credit.seriesTitle ??
    "Untitled";

  const poster =
    credit.posterUrl ??
    credit.poster ??
    null;

  const type = String(credit.titleType ?? "").toLowerCase();
  const path =
    type.includes("episode")
      ? `/episode/${id}`
      : type.includes("series")
      ? `/series/${id}`
      : `/movie/${id}`;

  return (
    <Card
      className="h-100"
      role="button"
      onClick={() => navigate(path, { state: { from: { label: title, path } } })}
    >
      <div style={{ height: 200 }}>
        <SmartImage
          src={poster}
          type="title"
          name={title}
          tmdbSize="w342"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>

      <Card.Body className="p-2">
        <Card.Title style={{ fontSize: "0.9rem" }}>{title}</Card.Title>
      </Card.Body>
    </Card>
  );
}
