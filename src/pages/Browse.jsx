import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useMoviesList from "../hooks/useMoviesList";

import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Pagination,
  Button,
  Form,
  ButtonGroup,
  Collapse,
} from "react-bootstrap";

import MovieCard from "../components/movies/MovieCard";
import { getCardPath, buildPageButtons } from "./listPageHelpers";

/* ---------------------------
   Debug flag (build-time)
---------------------------- */
const ENABLE_DEBUG =
  import.meta?.env?.MODE === "development" &&
  import.meta?.env?.VITE_SHOW_DEBUG === "true";

/* ---------------------------
   Constants
---------------------------- */
const GENRES = [
  "All", "Fantasy", "Game-Show", "Adventure", "Documentary", "Family",
  "Action", "Animation", "Music", "Reality-TV", "Sport", "Comedy",
  "Western", "Short", "Crime", "Horror", "War", "Adult", "News",
  "Talk-Show", "Musical", "Romance", "Biography", "Thriller",
  "History", "Drama", "Mystery", "Sci-Fi",
];

/**
 * Unified browse page for movies and series.
 * Content type (movie / series / all) is treated as a filter.
 */
export default function Browse({ defaultType = "all" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const search = new URLSearchParams(location.search);

  const [page, setPage] = useState(
    () => parseInt(search.get("page") || "1", 10)
  );
  const [contentType, setContentType] = useState(
    search.get("type") || defaultType
  );
  const [genre, setGenre] = useState(
    search.get("genre") || "All"
  );
  const [sort, setSort] = useState(
    search.get("sort") || "default"
  );
  const [showRaw, setShowRaw] = useState(false);

  const params = {
    page,
    pageSize: 20,
    type: contentType === "all" ? undefined : contentType,
    genre: genre !== "All" ? genre : undefined,
    sort: sort !== "default" ? sort : undefined,
  };

  const { list, loading, totalPages, total } = useMoviesList(params);

  const pageStart = (page - 1) * params.pageSize + 1;
  const pageEnd = pageStart + list.length - 1;

  /* ---------------------------
     Sync state to URL
  ---------------------------- */
  useEffect(() => {
    const qs = new URLSearchParams();
    qs.set("page", String(page));
    qs.set("type", contentType);
    if (genre !== "All") qs.set("genre", genre);
    if (sort !== "default") qs.set("sort", sort);

    navigate({ search: `?${qs.toString()}` }, { replace: true });
  }, [page, contentType, genre, sort, navigate]);

  /* ---------------------------
     Reset page on filter change
  ---------------------------- */
  useEffect(() => {
    setPage(1);
  }, [contentType, genre, sort]);

  const title =
    contentType === "movie"
      ? "Movies"
      : contentType === "series"
      ? "Series"
      : "All Titles";

  return (
    <div className="d-flex flex-column min-vh-100">
      <Container fluid className="py-4 px-5 flex-grow-1">
        {/* Header */}
        <div className="mb-3">
          <h2 className="mb-1">{title}</h2>

          {!loading && (
            <div className="text-muted">
              <strong>Page {page}</strong> of{" "}
              <strong>{totalPages ?? "Unknown"}</strong> — Showing{" "}
              <strong>{pageStart}–{pageEnd}</strong> of{" "}
              <strong>{total ?? "Unknown"}</strong>
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="d-flex flex-wrap gap-4 mb-4 align-items-end">
          <ButtonGroup>
            <Button
              variant={contentType === "all" ? "primary" : "outline-primary"}
              onClick={() => setContentType("all")}
            >
              All
            </Button>
            <Button
              variant={contentType === "movie" ? "primary" : "outline-primary"}
              onClick={() => setContentType("movie")}
            >
              Movies
            </Button>
            <Button
              variant={contentType === "series" ? "primary" : "outline-primary"}
              onClick={() => setContentType("series")}
            >
              Series
            </Button>
          </ButtonGroup>

          <Form.Group>
            <Form.Label>Genre</Form.Label>
            <Form.Select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              {GENRES.map((g) => (
                <option key={g}>{g}</option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Sort</Form.Label>
            <Form.Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="default">Default</option>
              <option value="top-rated">Top Rated</option>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </Form.Select>
          </Form.Group>

          {/* Debug toggle (DEV ONLY) */}
          {ENABLE_DEBUG && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowRaw((s) => !s)}
            >
              Raw Debug
            </Button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" />
          </div>
        )}

        {/* Empty */}
        {!loading && list.length === 0 && (
          <Alert variant="info">No results found.</Alert>
        )}

        {/* Debug output (DEV ONLY) */}
        {ENABLE_DEBUG && (
          <Collapse in={showRaw}>
            <pre
              className="p-2 bg-light"
              style={{ maxHeight: 300, overflow: "auto" }}
            >
              {JSON.stringify(
                { params, preview: list.slice(0, 3) },
                null,
                2
              )}
            </pre>
          </Collapse>
        )}

        {/* Grid */}
        <Row xs={2} md={3} lg={4} xl={5} className="g-4">
          {list.map((item) => {
            const id = item.tconst ?? item.id;
            const avg =
              item.AverageRating ??
              item.averageRating ??
              item._avg ??
              0;

            item._avg = avg;

            return (
              <Col key={id}>
                <Card
                  className="h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(getCardPath(item))}
                >
                  <MovieCard movie={item} />
                  <Card.Footer>
                    <small className="text-muted">
                      Rating: {avg ? avg.toFixed(1) : "—"}
                    </small>
                  </Card.Footer>
                </Card>
              </Col>
            );
          })}
        </Row>

        {/* Pagination */}
        <div className="d-flex flex-column align-items-center mt-4">
          <Pagination>
            <Pagination.Prev
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
            />

            {buildPageButtons(page, totalPages).map((p, i) =>
              p === "ellipsis" ? (
                <Pagination.Ellipsis key={i} disabled />
              ) : (
                <Pagination.Item
                  key={p}
                  active={p === page}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Pagination.Item>
              )
            )}

            <Pagination.Next
              disabled={
                totalPages
                  ? page >= totalPages
                  : list.length < params.pageSize
              }
              onClick={() => setPage(page + 1)}
            />
          </Pagination>
        </div>
      </Container>
    </div>
  );
}
