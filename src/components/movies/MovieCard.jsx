import React from "react";
import { Card, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatTitleType } from "../../utils/formatLabel";
import { getTitleTypeVariant } from "../../utils/titleTypeBadge";
import { getCardPath } from "../../pages/listPageHelpers";
import SmartImage from "../common/SmartImage";

import "./MovieCard.css";

export default function MovieCard({ movie, rating }) {
  const navigate = useNavigate();
  const route = getCardPath(movie);
  const isClickable = Boolean(route);

  const title =
    movie?.primaryTitle ??
    movie?.movieTitle ??
    movie?.seriesTitle ??
    movie?.title ??
    movie?.name ??
    "Untitled";

  const poster =
    movie?.posterUrl ??
    movie?.poster_path ??
    movie?.banner ??
    null;

  return (
    <Card
      className="movie-card"
      role={isClickable ? "button" : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={isClickable ? () => navigate(route, { state: { from: { label: title } } }) : undefined}
    >
      <div className="movie-card__poster-wrapper">
        <SmartImage
          src={poster}
          type="title"
          name={title}
          tmdbSize="w342"
          className="movie-card__poster"
        />

        {movie?.titleType && (
          <Badge
            bg={getTitleTypeVariant(movie.titleType)}
            className="movie-card__badge"
          >
            {formatTitleType(movie.titleType)}
          </Badge>
        )}
      </div>

      <Card.Body className="movie-card__body">
        <div className="movie-card__title">{title}</div>
      </Card.Body>

      {typeof rating === "number" && (
        <Card.Footer className="movie-card__footer">
          Rating: {rating ? rating.toFixed(1) : "—"}
        </Card.Footer>
      )}
    </Card>
  );
}
