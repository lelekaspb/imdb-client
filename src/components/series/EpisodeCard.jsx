import React from "react";
import { Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

export default function EpisodeCard({ episode, context }) {
  const navigate = useNavigate();

  if (!episode) return null;

  const handleClick = () => {
    navigate(`/episode/${episode.tconst}`, {
      state: {
        from: context?.from,
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
      {episode.posterUrl ? (
        <img
          src={episode.posterUrl}
          alt={episode.episodeTitle}
          style={{ height: 200, objectFit: "cover" }}
        />
      ) : (
        <div
          style={{
            height: 200,
            background: "#e0e0e0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span className="text-muted">No Poster</span>
        </div>
      )}

      <Card.Body>
        <Badge bg="secondary" className="mb-2">
          S{episode.seasonNumber} · E{episode.episodeNumber}
        </Badge>
        <Card.Title style={{ fontSize: "1rem" }}>
          {episode.episodeTitle}
        </Card.Title>
      </Card.Body>
    </Card>
  );
}
