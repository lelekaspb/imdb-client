import React from "react";
import { Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import SmartImage from "../common/SmartImage";

export default function EpisodeCard({ episode, context }) {
  const navigate = useNavigate();
  if (!episode) return null;

  return (
    <Card
      className="h-100"
      role="button"
      onClick={() =>
        navigate(`/episode/${episode.tconst}`, { state: { from: context?.from } })
      }
    >
      <SmartImage
        src={episode.posterUrl}
        type="title"
        name={episode.episodeTitle}
        tmdbSize="w342"
        style={{ height: 200, objectFit: "cover" }}
      />

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
