import React from "react";
import useUserRatings from "../../hooks/useUserRatings";
import { Spinner, Alert, Card, Badge } from "react-bootstrap";
import MovieCard from "../movies/MovieCard";

export default function UserRatingsPanel() {
  const { items, loading, error } = useUserRatings();

  const hasRatings = items.length > 0;

  if (loading) return <Spinner />;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!hasRatings) return <p>No ratings yet.</p>;

  return (
    <div className="d-flex flex-wrap gap-3">
      {items.map((rating) => (
        <Card key={rating.ratingId} style={{ width: 220 }}>
          <MovieCard
            movie={{
              tconst: rating.tconst,
              primaryTitle: rating.title,
              titleType: rating.titleType,
              posterUrl: rating.posterUrl,
            }}
          />
          <Card.Body className="pt-2 text-center">
            <Badge bg="primary">
              My rating: {rating.rating} / 10
            </Badge>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}
