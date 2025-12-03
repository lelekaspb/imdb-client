import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  ButtonGroup,
  Button,
  Form,
  Alert,
  Spinner,
  Pagination,
  Row,
  Col,
  Card,
} from "react-bootstrap";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [contentType, setContentType] = useState("all"); // "all", "films", "series"
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(() => {
    const params = new URLSearchParams(location.search);
    return parseInt(params.get("page")) || 1;
  });
  const [pageSize] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [pageInput, setPageInput] = useState("");

  const genres = ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Thriller"];

  const handlePageChange = (newPage) => {
    setPage(newPage);
    navigate(`/?page=${newPage}`);
  };

  const handlePageJump = (e) => {
    e.preventDefault();
    const pageNum = parseInt(pageInput);
    if (pageNum && pageNum > 0 && pageNum <= totalPages) {
      handlePageChange(pageNum);
      setPageInput("");
    }
  };

  // Sync page state with URL params when navigating back
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlPage = parseInt(params.get("page")) || 1;
    if (urlPage !== page) {
      setPage(urlPage);
    }
  }, [location.search]);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:5079/api/Movies?page=${page}&pageSize=${pageSize}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch movies");
        }
        return response.json();
      })
      .then((data) => {
        console.log("API Response:", data);
        // Handle if data is an object with an array property or directly an array
        const moviesArray = Array.isArray(data)
          ? data
          : data.movies || data.data || data.items || [];
        setMovies(moviesArray);

        // Handle pagination metadata if available
        if (data.totalPages) setTotalPages(data.totalPages);
        if (data.total) setTotalPages(Math.ceil(data.total / pageSize));

        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [page, pageSize]);

  const breadcrumbs = [{ label: "Browse", path: "/", active: true }];

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar breadcrumbs={breadcrumbs} />

      <Container fluid className="flex-grow-1 py-4 px-5">
        <div className="d-flex align-items-end gap-4 mb-4">
          <div>
            <h5 className="mb-3">Content Type</h5>
            <ButtonGroup>
              <Button
                variant={contentType === "all" ? "primary" : "outline-primary"}
                onClick={() => setContentType("all")}
              >
                All
              </Button>
              <Button
                variant={
                  contentType === "films" ? "primary" : "outline-primary"
                }
                onClick={() => setContentType("films")}
              >
                Films
              </Button>
              <Button
                variant={
                  contentType === "series" ? "primary" : "outline-primary"
                }
                onClick={() => setContentType("series")}
              >
                Series
              </Button>
            </ButtonGroup>
          </div>

          <div>
            <Form.Group>
              <Form.Label>Genre</Form.Label>
              <Form.Select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                style={{ minWidth: "200px" }}
              >
                <option value="all">All Genres</option>
                {genres.map((genre) => (
                  <option key={genre} value={genre}>
                    {genre}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        <div>
          <h2 className="mb-3">Results</h2>
          {loading && (
            <div className="text-center py-5">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          )}
          {error && <Alert variant="danger">Error: {error}</Alert>}
          {!loading && !error && (
            <>
              <Alert variant="info">
                Showing: {contentType === "all" ? "All Content" : contentType} |
                Genre: {selectedGenre}
              </Alert>
              <p className="text-muted">
                Page {page} of {totalPages} | Items on this page:{" "}
                {movies.length}
              </p>
              <Row xs={2} md={3} lg={4} xl={5} className="g-4 mb-4">
                {movies.map((movie) => {
                  // Determine if it's a series or movie based on titleType or other property
                  const isSeries =
                    movie.titleType === "tvSeries" ||
                    movie.titleType === "tvMiniSeries" ||
                    movie.titleType === "tvEpisode" ||
                    movie.type === "series";
                  const itemId = movie.id || movie.tconst;

                  // Determine display label
                  let typeLabel = "Movie";
                  if (movie.titleType === "tvSeries") typeLabel = "TV Series";
                  else if (movie.titleType === "tvMiniSeries")
                    typeLabel = "Mini Series";
                  else if (movie.titleType === "tvEpisode")
                    typeLabel = "TV Episode";
                  else if (movie.titleType === "movie") typeLabel = "Movie";
                  else if (movie.titleType) typeLabel = movie.titleType;

                  // Log first item to see structure
                  if (movies.indexOf(movie) === 0) {
                    console.log("First movie object:", movie);
                  }

                  return (
                    <Col key={itemId}>
                      <Card
                        className="h-100"
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                          navigate(
                            isSeries ? `/series/${itemId}` : `/movie/${itemId}`
                          )
                        }
                      >
                        <div
                          style={{
                            backgroundColor: "#e0e0e0",
                            height: "300px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span className="text-muted">No Poster</span>
                        </div>
                        <Card.Body>
                          <Card.Title style={{ fontSize: "1rem" }}>
                            {movie.title || movie.primaryTitle}
                          </Card.Title>
                          <Card.Text className="text-muted small">
                            {typeLabel}
                          </Card.Text>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>
              <Pagination className="justify-content-center align-items-center">
                <Pagination.Prev
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                />
                <Pagination.Item active>{page}</Pagination.Item>
                <Pagination.Next
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page >= totalPages}
                />
                <Form
                  onSubmit={handlePageJump}
                  className="d-flex align-items-center ms-3"
                >
                  <Form.Control
                    type="number"
                    placeholder="Go to page"
                    value={pageInput}
                    onChange={(e) => setPageInput(e.target.value)}
                    style={{ width: "120px" }}
                    className="me-2"
                    min="1"
                    max={totalPages}
                  />
                  <Button type="submit" variant="outline-primary" size="sm">
                    Go
                  </Button>
                </Form>
              </Pagination>
            </>
          )}
        </div>
      </Container>

      <Footer />
    </div>
  );
}

export default App;
