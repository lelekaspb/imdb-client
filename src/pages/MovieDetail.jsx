import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
  ListGroup,
} from "react-bootstrap";
import { BookmarkPlus, BookmarkCheckFill } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const apiKey = "e4f70d8185101e89d6853659d9cfd53b";

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleAddToWatchlist = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/user/login");
      return;
    }

    const userData = localStorage.getItem("user");
    let userId = 0;

    if (userData) {
      try {
        const user = JSON.parse(userData);
        userId = user.id || user.userId || 0;
      } catch (e) {
        console.error("Failed to parse user data:", e);
      }
    }

    try {
      const response = await fetch("http://localhost:5079/api/Bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          tconst: id,
          nconst: null,
        }),
      });

      if (response.ok) {
        setIsInWatchlist(true);
      } else {
        const errorData = await response.json();
        console.error("Failed to add bookmark:", errorData);
      }
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
    }
  };

  useEffect(() => {
    setLoading(true);

    // Fetch both movie details and cast in parallel
    Promise.all([
      fetch(`http://localhost:5079/api/Movies/${id}`),
      fetch(`http://localhost:5079/api/Movies/${id}/cast`),
    ])
      .then(([movieRes, castRes]) => {
        if (!movieRes.ok) {
          return movieRes
            .json()
            .then((data) => {
              throw new Error(data.message || "Failed to fetch movie details");
            })
            .catch((err) => {
              if (
                err.message &&
                err.message !== "Failed to fetch movie details"
              ) {
                throw err;
              }
              throw new Error("Failed to fetch movie details");
            });
        }

        const moviePromise = movieRes.json();
        const castPromise = castRes.ok ? castRes.json() : Promise.resolve([]);

        return Promise.all([moviePromise, castPromise]);
      })
      .then(([movieData, castData]) => {
        setMovie(movieData);
        const rawCast = Array.isArray(castData)
          ? castData
          : castData.cast || castData.data || [];

        // Consolidate cast by nconst
        const castMap = new Map();
        rawCast.forEach((member) => {
          const key = member.nconst;
          if (castMap.has(key)) {
            const existing = castMap.get(key);
            // Collect all character names
            if (member.characterName && member.characterName.trim()) {
              existing.characterNames.push(member.characterName);
            }
            // Collect all jobs
            if (member.job && member.job.trim()) {
              existing.jobs.add(member.job.trim());
            }
          } else {
            castMap.set(key, {
              nconst: member.nconst,
              name: member.name,
              primaryName: member.primaryName,
              characterNames:
                member.characterName && member.characterName.trim()
                  ? [member.characterName]
                  : [],
              jobs: new Set(
                member.job && member.job.trim() ? [member.job.trim()] : []
              ),
              category: member.category,
            });
          }
        });

        // Convert to array and process character names
        const consolidatedCast = Array.from(castMap.values()).map((member) => ({
          ...member,
          allCharacters: member.characterNames
            .map((char) =>
              char
                .replace(/^\[|\]$/g, "")
                .replace(/'/g, "")
                .split(",")
                .map((c) => c.trim())
                .filter((c) => c)
            )
            .flat()
            .filter((char, idx, arr) => arr.indexOf(char) === idx) // Remove duplicates
            .join(", "),
          allJobs: Array.from(member.jobs).join(", "),
        }));

        // Fetch TMDB photos for each cast member
        const photoPromises = consolidatedCast.map((member) =>
          fetch(
            `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
              member.name
            )}`
          )
            .then((res) => res.json())
            .then((data) => {
              if (data.results && data.results.length > 0) {
                return {
                  ...member,
                  profile_path: data.results[0].profile_path,
                };
              }
              return member;
            })
            .catch(() => member)
        );

        return Promise.all(photoPromises);
      })
      .then((castWithPhotos) => {
        setCast(castWithPhotos);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const breadcrumbs = [
    { label: "Browse", path: "/" },
    { label: movie?.primaryTitle || movie?.title || "Movie", active: true },
  ];

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar
          breadcrumbs={[
            { label: "Browse", path: "/" },
            { label: "Movie", active: true },
          ]}
        />
        <Container fluid className="flex-grow-1 py-4 px-5">
          <div className="text-center py-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        </Container>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar
          breadcrumbs={[
            { label: "Browse", path: "/" },
            { label: "Movie", active: true },
          ]}
        />
        <Container fluid className="flex-grow-1 py-4 px-5">
          <Alert variant="danger">Error: {error}</Alert>
          <Button onClick={() => navigate(-1)}>Back to Browse</Button>
        </Container>
        <Footer />
      </div>
    );
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar breadcrumbs={breadcrumbs} />
      <Container fluid className="flex-grow-1 py-4 px-5">
        <Button
          variant="secondary"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          ← Back to Browse
        </Button>

        <Row>
          <Col md={4}>
            <div
              style={{
                backgroundColor: "#e0e0e0",
                height: "500px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span className="text-muted">No Poster</span>
            </div>
          </Col>
          <Col md={8}>
            <div className="d-flex align-items-center mb-2">
              <h1 className="mb-0">
                {movie.title || movie.primaryTitle}
                {movie.startYear && (
                  <span
                    className="text-muted"
                    style={{ fontSize: "1.5rem", marginLeft: "0.5rem" }}
                  >
                    ({movie.startYear})
                  </span>
                )}
              </h1>
              {isLoggedIn && (
                <Button
                  variant={isInWatchlist ? "success" : "outline-primary"}
                  className="ms-3"
                  onClick={handleAddToWatchlist}
                  disabled={isInWatchlist}
                >
                  {isInWatchlist ? (
                    <>
                      <BookmarkCheckFill className="me-2" />
                      In Watchlist
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="me-2" />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              )}
            </div>
            {movie.runtimeMinutes && (
              <p className="text-muted mb-3">
                Runtime: {movie.runtimeMinutes} minutes
                {movie.isAdult && (
                  <span className="badge bg-danger ms-2">Adult Content</span>
                )}
              </p>
            )}
            <Card className="mt-3">
              <Card.Body>
                <h5>Movie Information</h5>
                <p>
                  <strong>Type:</strong> Movie
                </p>
                <p>
                  <strong>ID:</strong> {movie.id || movie.tconst}
                </p>
                {movie.releaseYear && (
                  <p>
                    <strong>Release Year:</strong> {movie.releaseYear}
                  </p>
                )}
                {movie.runtime && (
                  <p>
                    <strong>Runtime:</strong> {movie.runtime} minutes
                  </p>
                )}
                {movie.genres && (
                  <p>
                    <strong>Genres:</strong> {movie.genres}
                  </p>
                )}
                {movie.rating && (
                  <p>
                    <strong>Rating:</strong> {movie.rating}/10
                  </p>
                )}
                {movie.plot && (
                  <>
                    <h5 className="mt-4">Plot</h5>
                    <p>{movie.plot}</p>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {cast.length > 0 && (
          <Row className="mt-4">
            <Col>
              <h4 className="mb-3">Cast</h4>
              <Row xs={2} md={3} lg={6} className="g-3">
                {cast.slice(0, 12).map((member, index) => (
                  <Col key={index}>
                    <Card
                      className="h-100"
                      onClick={() =>
                        navigate(`/person/${member.nconst}`, {
                          state: {
                            from: {
                              label: movie?.primaryTitle || movie?.title,
                              path: `/movie/${id}`,
                            },
                          },
                        })
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {member.profile_path ? (
                        <Card.Img
                          variant="top"
                          src={`https://image.tmdb.org/t/p/w185${member.profile_path}`}
                          alt={member.primaryName || member.name}
                          style={{
                            height: "180px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#e0e0e0",
                            height: "180px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <span className="text-muted">No Photo</span>
                        </div>
                      )}
                      <Card.Body className="p-2">
                        <Card.Title
                          style={{
                            fontSize: "0.9rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {member.primaryName || member.name}
                        </Card.Title>
                        <div
                          style={{ fontSize: "0.8rem" }}
                          className="text-muted mb-0"
                        >
                          {member.allCharacters && (
                            <div>
                              <strong>Roles:</strong> {member.allCharacters}
                            </div>
                          )}
                          {member.allJobs && (
                            <div>
                              <strong>Job:</strong> {member.allJobs}
                            </div>
                          )}
                          {!member.allCharacters &&
                            !member.allJobs &&
                            member.category && <div>{member.category}</div>}
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}
      </Container>
      <Footer />
    </div>
  );
}

export default MovieDetail;
