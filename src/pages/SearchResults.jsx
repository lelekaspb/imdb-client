import React from "react";
import { useSearchParams } from "react-router-dom";
import useSearchResults from "../hooks/useSearchResults";
import { Container, Spinner, Alert } from "react-bootstrap";
import MovieCard from "../components/movies/MovieCard";
import Pagination from "../components/common/Pagination";
import "./SearchResults.css";

export default function SearchResults() {
  const [params] = useSearchParams();
  const query = params.get("query") || "";

  const {
    results,
    loading,
    error,
    page,
    setPage,
    totalPages,
  } = useSearchResults(query);

  return (
    <Container className="py-4">
      <h2 className="mb-4">Search results for “{query}”</h2>

      {loading && (
        <div className="text-center my-4">
          <Spinner animation="border" />
        </div>
      )}

      {error && <Alert variant="danger">{String(error)}</Alert>}

      {!loading && results.length === 0 && (
        <p className="text-muted">No results found.</p>
      )}

      {!loading && results.length > 0 && (
        <>
          <div className="search-results-grid">
            {results.map(movie => (
              <MovieCard
                key={movie.tconst}
                movie={movie}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <Pagination
                current={page}
                total={totalPages}
                onChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </Container>
  );
}
