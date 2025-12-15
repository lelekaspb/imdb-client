import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Card,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import MyActivityPanel from "../components/user/MyActivityPanel";

import useMovie from "../hooks/useMovie";
import useCast from "../hooks/useCast";
import useBookmarks from "../hooks/useBookmarks";
import useRating from "../hooks/useRating";
import { normalizeList } from "../utils/normalizeList";

import PersonCard from "../components/people/PersonCard";
import Breadcrumbs from "../components/navigation/Breadcrumbs";
import DetailLayout from "../components/layout/DetailLayout";
import InfoCard from "../components/common/InfoCard";
import SmartImage from "../components/common/SmartImage";

export default function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { movie, loading, error } = useMovie(id);
  const rawCast = useCast(id, "movie");
  const [cast, setCast] = useState([]);

  const { isLoggedIn, isBookmarked, addBookmark, removeBookmark } =
    useBookmarks({ tconst: id });

  const { rating, saveRating } = useRating(id);

  useEffect(() => {
    setCast(normalizeList(rawCast));
  }, [rawCast]);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{String(error)}</Alert>
      </Container>
    );
  }

  if (!movie) return null;

  const title =
    movie.movieTitle ?? movie.primaryTitle ?? movie.title ?? "Untitled";

  const aboutItems = [
    { label: "Plot", value: movie.plot },
    { label: "Genres", value: movie.genres?.join(", ") },
    {
      label: "Runtime",
      value: movie.runtimeMinutes
        ? `${movie.runtimeMinutes} min`
        : null,
    },
    { label: "Released", value: movie.releaseDate },
    { label: "Language", value: movie.language },
    { label: "Country", value: movie.country },
  ];

  const trail = [];
  if (location.state?.from) trail.push(location.state.from);
  trail.push({ label: title, path: `/movie/${id}` });

  const posterNode = (
    <>
      <SmartImage
        src={movie.posterUrl}
        type="title"
        name={title}
        size="detail"
        tmdbSize="w500"
        style={{
          width: "100%",
          maxHeight: 500,
          objectFit: "cover",
          borderRadius: 6,
        }}
      />

<MyActivityPanel
  isLoggedIn={isLoggedIn}
  isBookmarked={isBookmarked}
  onBookmark={addBookmark}
  onUnbookmark={removeBookmark}
  rating={rating}
  onRate={saveRating}
  noteTarget={{ tconst: id }}
/>

    </>
  );

  const footerContent = (
    <>
      

      {cast.length > 0 && (
        <Card className="shadow-sm">
          <Card.Header className="fw-semibold bg-white">
            Cast
          </Card.Header>
          <Card.Body>
            <div className="row g-3">
              {cast.slice(0, 24).map((m, i) => (
                <div className="col-6 col-md-4 col-lg-3" key={i}>
                  <PersonCard
                    person={m}
                    context={{
                      from: { label: title, path: `/movie/${id}` },
                    }}
                  />
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}
    </>
  );

  return (
    <Container className="py-4">
      <DetailLayout
        breadcrumbs={<Breadcrumbs trail={trail} />}
        title={
          <>
            {title}
            {movie.startYear && (
              <span className="text-muted ms-2">
                ({movie.startYear})
              </span>
            )}
            {movie.titleType && (
              <Badge bg="secondary" className="ms-3 text-capitalize">
                {movie.titleType}
              </Badge>
            )}
          </>
        }
        poster={posterNode}
        aboutCard={<InfoCard title="About" items={aboutItems} />}
        footerContent={footerContent}
      />
    </Container>
  );
}