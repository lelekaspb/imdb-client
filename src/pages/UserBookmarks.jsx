import { useState, useEffect } from "react";
import { Card, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { Trash } from "react-bootstrap-icons";
import { authFetch } from "../utils/authFetch";

function UserBookmarks() {
  const navigate = useNavigate();
  const [movieBookmarks, setMovieBookmarks] = useState([]);
  const [personBookmarks, setPersonBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = "e4f70d8185101e89d6853659d9cfd53b";

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchPersonPhoto = async (personName) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
          personName
        )}`
      );
      const data = await response.json();
      if (
        data.results &&
        data.results.length > 0 &&
        data.results[0].profile_path
      ) {
        return `https://image.tmdb.org/t/p/w185${data.results[0].profile_path}`;
      }
    } catch (err) {
      console.error("Failed to fetch person photo:", err);
    }
    return null;
  };

  const fetchBookmarks = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      navigate("/user/login");
      return;
    }

    try {
      const response = await authFetch("http://localhost:5079/api/Bookmarks");

      if (response.ok) {
        const result = await response.json();
        const bookmarks = result.data || [];
        // Separate bookmarks by type
        const movies = bookmarks.filter((b) => b.tconst && !b.nconst);
        const persons = bookmarks.filter((b) => b.nconst);

        setMovieBookmarks(movies);

        // Fetch photos for person bookmarks
        const personsWithPhotos = await Promise.all(
          persons.map(async (person) => {
            const photoUrl = await fetchPersonPhoto(person.personName);
            return { ...person, photoUrl };
          })
        );

        setPersonBookmarks(personsWithPhotos);
      } else {
        throw new Error("Failed to fetch bookmarks");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBookmark = async (bookmarkId, type) => {
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      const response = await authFetch(
        `http://localhost:5079/api/Bookmarks/${bookmarkId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        // Remove from local state
        if (type === "movie") {
          setMovieBookmarks(
            movieBookmarks.filter((b) => b.bookmarkId !== bookmarkId)
          );
        } else {
          setPersonBookmarks(
            personBookmarks.filter((b) => b.bookmarkId !== bookmarkId)
          );
        }
      } else {
        console.error("Failed to delete bookmark");
      }
    } catch (err) {
      console.error("Error deleting bookmark:", err);
    }
  };

  const handleNavigate = (bookmark) => {
    if (bookmark.tconst) {
      // Determine if it's a movie or series based on titleType if available
      const isSeries =
        bookmark.titleType === "tvSeries" ||
        bookmark.titleType === "tvMiniSeries" ||
        bookmark.titleType === "tvEpisode";
      const isEpisode = bookmark.titleType === "tvEpisode";
      const route = isEpisode ? "episode" : isSeries ? "series" : "movie";

      navigate(`/${route}/${bookmark.tconst}`, {
        state: {
          from: {
            label: "My Bookmarks",
            path: "/user/bookmarks",
          },
          ...(bookmark.seriesTitle
            ? { seriesTitle: bookmark.seriesTitle }
            : {}),
          ...(bookmark.episodeTitle
            ? { episodeTitle: bookmark.episodeTitle }
            : {}),
          ...(bookmark.movieTitle ? { movieTitle: bookmark.movieTitle } : {}),
          userBookmark: {
            bookmarkId: bookmark.bookmarkId,
            note: bookmark.note,
            rating: bookmark.rating,
            isBookmarked: true,
          },
        },
      });
    } else if (bookmark.nconst) {
      navigate(`/person/${bookmark.nconst}`, {
        state: {
          from: {
            label: "My Bookmarks",
            path: "/user/bookmarks",
          },
          userBookmark: {
            bookmarkId: bookmark.bookmarkId,
            note: bookmark.note,
            rating: bookmark.rating,
            isBookmarked: true,
          },
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">Error: {error}</Alert>;
  }

  return (
    <>
      {/* Movies/Series Bookmarks */}
      <Card className="mb-4">
        <Card.Body>
          <h4 className="mb-3">Bookmarked Movies & Series</h4>
          {movieBookmarks.length === 0 ? (
            <p className="text-muted">No bookmarked movies or series yet.</p>
          ) : (
            <Row xs={2} md={3} lg={4} className="g-3">
              {movieBookmarks.map((bookmark) => (
                <Col key={bookmark.bookmarkId}>
                  <Card className="h-100">
                    {bookmark.posterUrl ? (
                      <Card.Img
                        variant="top"
                        src={bookmark.posterUrl}
                        alt={bookmark.title}
                        style={{
                          height: "200px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => handleNavigate(bookmark)}
                      />
                    ) : (
                      <div
                        style={{
                          backgroundColor: "#e0e0e0",
                          height: "200px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => handleNavigate(bookmark)}
                      >
                        <span className="text-muted">No Poster</span>
                      </div>
                    )}
                    <Card.Body className="d-flex flex-column">
                      <Card.Title
                        style={{
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          flex: 1,
                        }}
                        onClick={() => handleNavigate(bookmark)}
                      >
                        {bookmark.movieTitle ||
                          bookmark.seriesTitle ||
                          bookmark.episodeTitle ||
                          "Unknown Title"}
                      </Card.Title>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleDeleteBookmark(bookmark.bookmarkId, "movie")
                        }
                      >
                        <Trash className="me-1" />
                        Remove
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>

      {/* Person Bookmarks */}
      <Card>
        <Card.Body>
          <h4 className="mb-3">Bookmarked People</h4>
          {personBookmarks.length === 0 ? (
            <p className="text-muted">No bookmarked people yet.</p>
          ) : (
            <Row xs={2} md={3} lg={6} className="g-3">
              {personBookmarks.map((bookmark) => (
                <Col key={bookmark.bookmarkId}>
                  <Card className="h-100">
                    {bookmark.photoUrl ? (
                      <Card.Img
                        variant="top"
                        src={bookmark.photoUrl}
                        alt={bookmark.name}
                        style={{
                          height: "150px",
                          objectFit: "cover",
                          cursor: "pointer",
                        }}
                        onClick={() => handleNavigate(bookmark)}
                      />
                    ) : (
                      <div
                        style={{
                          backgroundColor: "#e0e0e0",
                          height: "150px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                        }}
                        onClick={() => handleNavigate(bookmark)}
                      >
                        <span className="text-muted">No Photo</span>
                      </div>
                    )}
                    <Card.Body className="d-flex flex-column">
                      <Card.Title
                        style={{
                          fontSize: "0.9rem",
                          cursor: "pointer",
                          flex: 1,
                        }}
                        onClick={() => handleNavigate(bookmark)}
                      >
                        {bookmark.personName || "Unknown Person"}
                      </Card.Title>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          handleDeleteBookmark(bookmark.bookmarkId, "person")
                        }
                      >
                        <Trash className="me-1" />
                        Remove
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card.Body>
      </Card>
    </>
  );
}

export default UserBookmarks;
