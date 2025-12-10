import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { authFetch } from "../utils/authFetch";
import {
  Container,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { BookmarkPlus, BookmarkCheckFill } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function EpisodeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [episode, setEpisode] = useState(null);
  const [cast, setCast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const [userNote, setUserNote] = useState(null);
  const [userRating, setUserRating] = useState(null);
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
      const response = await authFetch("http://localhost:5079/api/Bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          tconst: id,
          nconst: null,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsInWatchlist(true);
        setBookmarkId(data.id || data.bookmarkId);
      } else {
        const errorData = await response.json();
        console.error("Failed to add bookmark:", errorData);
      }
    } catch (err) {
      console.error("Failed to add to watchlist:", err);
    }
  };

  const handleRemoveFromWatchlist = async () => {
    const token = localStorage.getItem("authToken");

    if (!token) {
      navigate("/user/login");
      return;
    }

    if (!bookmarkId) {
      console.error("No bookmark ID available");
      return;
    }

    try {
      const response = await authFetch(
        `http://localhost:5079/api/Bookmarks/${bookmarkId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        setIsInWatchlist(false);
        setBookmarkId(null);
      } else {
        const errorData = await response.json();
        console.error("Failed to remove bookmark:", errorData);
      }
    } catch (err) {
      console.error("Failed to remove bookmark:", err);
    }
  };

  useEffect(() => {
    // Fetch episode details and cast in parallel
    Promise.all([
      authFetch(`http://localhost:5079/api/Movies/${id}`),
      authFetch(`http://localhost:5079/api/Movies/${id}/cast`),
    ])
      .then(([episodeRes, castRes]) => {
        if (!episodeRes.ok) {
          return episodeRes
            .json()
            .then((data) => {
              throw new Error(
                data.message || "Failed to fetch episode details"
              );
            })
            .catch(() => {
              throw new Error("Failed to fetch episode details");
            });
        }

        const episodePromise = episodeRes.json();
        const castPromise = castRes.ok ? castRes.json() : Promise.resolve([]);

        return Promise.all([episodePromise, castPromise]);
      })
      .then(([episodeData, castData]) => {
        setEpisode(episodeData);

        // Set bookmark status from location.state (if navigating from bookmarks) or API response
        const bookmarkData =
          location.state?.userBookmark || episodeData.userBookmark;
        if (bookmarkData) {
          setIsInWatchlist(true);
          setBookmarkId(bookmarkData.bookmarkId);
          setUserNote(bookmarkData.note);
          setUserRating(bookmarkData.rating);
        }

        // Process cast data with TMDB photos
        const castArray = Array.isArray(castData)
          ? castData
          : castData.cast || [];

        // Consolidate cast by nconst to avoid duplicates
        const castMap = new Map();
        castArray.forEach((member) => {
          if (!castMap.has(member.nconst)) {
            castMap.set(member.nconst, {
              ...member,
              characters: member.characterName ? [member.characterName] : [],
              jobs: member.job ? [member.job] : [],
            });
          } else {
            const existing = castMap.get(member.nconst);
            if (
              member.characterName &&
              !existing.characters.includes(member.characterName)
            ) {
              existing.characters.push(member.characterName);
            }
            if (member.job && !existing.jobs.includes(member.job)) {
              existing.jobs.push(member.job);
            }
          }
        });

        const consolidatedCast = Array.from(castMap.values());

        // Fetch TMDB photos for cast members
        const photoPromises = consolidatedCast.map(async (member) => {
          try {
            const response = await fetch(
              `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
                member.name || member.primaryName || ""
              )}`
            );
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              return {
                ...member,
                profile_path: data.results[0].profile_path,
              };
            }
            return member;
          } catch (err) {
            console.error("Failed to fetch photo for:", member.name);
            return member;
          }
        });

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
  }, [id, apiKey]);

  const breadcrumbs = [
    { label: "Browse", path: "/" },
    ...(location.state?.from
      ? [location.state.from]
      : episode?.parentSeriesId && episode?.parentSeriesTitle
      ? [
          {
            label: episode.parentSeriesTitle,
            path: `/series/${episode.parentSeriesId}`,
          },
        ]
      : []),
    {
      label: location.state?.episodeTitle || episode?.episodeTitle || "Episode",
      active: true,
    },
  ];

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar
          breadcrumbs={[
            { label: "Browse", path: "/" },
            { label: "Episode", active: true },
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
            { label: "Episode", active: true },
          ]}
        />
        <Container fluid className="flex-grow-1 py-4 px-5">
          <Alert variant="danger">Error: {error}</Alert>
          <Button onClick={() => navigate(-1)}>Back</Button>
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
          ← Back
        </Button>

        <Row>
          <Col md={3}>
            {episode.posterUrl ? (
              <img
                src={episode.posterUrl}
                alt={episode.title || episode.primaryTitle}
                style={{
                  width: "100%",
                  maxHeight: "450px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  backgroundColor: "#e0e0e0",
                  height: "450px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="text-muted">No Poster</span>
              </div>
            )}
          </Col>
          <Col md={9}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                {episode.parentSeriesTitle && (
                  <h5 className="text-muted mb-2">
                    {episode.parentSeriesTitle}
                  </h5>
                )}
                <h1>{location.state?.episodeTitle || episode.episodeTitle}</h1>
                <p className="text-muted mb-0" style={{ fontSize: "1.1rem" }}>
                  {episode.seasonNumber && episode.episodeNumber && (
                    <span>
                      Season {episode.seasonNumber}, Episode{" "}
                      {episode.episodeNumber}
                    </span>
                  )}
                  {episode.releaseDate && (
                    <span>
                      {episode.seasonNumber && episode.episodeNumber
                        ? " • "
                        : ""}
                      Air Date:{" "}
                      {new Date(episode.releaseDate).toLocaleDateString()}
                    </span>
                  )}
                </p>
              </div>
              {isLoggedIn && (
                <Button
                  variant={isInWatchlist ? "success" : "primary"}
                  onClick={
                    isInWatchlist
                      ? handleRemoveFromWatchlist
                      : handleAddToWatchlist
                  }
                  className="d-flex align-items-center gap-2"
                >
                  {isInWatchlist ? (
                    <>
                      <BookmarkCheckFill />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <BookmarkPlus />
                      Add to Watchlist
                    </>
                  )}
                </Button>
              )}
            </div>

            <Card className="mt-3">
              <Card.Body>
                <h5>Details</h5>
                {episode.titleType && (
                  <p>
                    <strong>Type:</strong>{" "}
                    <span className="text-capitalize">{episode.titleType}</span>
                  </p>
                )}
                {episode.originalTitle &&
                  episode.originalTitle !== episode.episodeTitle && (
                    <p>
                      <strong>Original Title:</strong> {episode.originalTitle}
                    </p>
                  )}
                {episode.parentSeriesTitle && (
                  <p>
                    <strong>Series:</strong> {episode.parentSeriesTitle}
                    {episode.parentSeriesId && (
                      <span
                        className="text-primary"
                        style={{ cursor: "pointer", marginLeft: "0.5rem" }}
                        onClick={() =>
                          navigate(`/series/${episode.parentSeriesId}`, {
                            state: {
                              from: {
                                label: episode.episodeTitle || "Episode",
                                path: `/episode/${episode.tconst}`,
                              },
                              seriesTitle: episode.parentSeriesTitle,
                            },
                          })
                        }
                      >
                        (View Series)
                      </span>
                    )}
                  </p>
                )}
                {episode.seasonNumber && (
                  <p>
                    <strong>Season:</strong> {episode.seasonNumber}
                  </p>
                )}
                {episode.episodeNumber && (
                  <p>
                    <strong>Episode:</strong> {episode.episodeNumber}
                  </p>
                )}
                {episode.releaseDate && (
                  <p>
                    <strong>Air Date:</strong>{" "}
                    {new Date(episode.releaseDate).toLocaleDateString()}
                  </p>
                )}
                {episode.runtimeMinutes && (
                  <p>
                    <strong>Runtime:</strong> {episode.runtimeMinutes} minutes
                  </p>
                )}
                {episode.writerNames && (
                  <p>
                    <strong>Writers:</strong> {episode.writerNames}
                  </p>
                )}
                {episode.language && (
                  <p>
                    <strong>Language:</strong> {episode.language}
                  </p>
                )}
                {episode.country && (
                  <p>
                    <strong>Country:</strong> {episode.country}
                  </p>
                )}
                {episode.genres && (
                  <p>
                    <strong>Genres:</strong>{" "}
                    {Array.isArray(episode.genres)
                      ? episode.genres.join(", ")
                      : episode.genres}
                  </p>
                )}
                {episode.plot && (
                  <>
                    <h5 className="mt-4">Plot</h5>
                    <p>{episode.plot}</p>
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
              <Row xs={3} md={4} lg={6} className="g-3">
                {cast.slice(0, 12).map((member, index) => (
                  <Col key={index}>
                    <Card
                      className="h-100"
                      onClick={() =>
                        navigate(`/person/${member.nconst}`, {
                          state: {
                            from: {
                              label: episode.episodeTitle || "Episode",
                              path: `/episode/${id}`,
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
                          alt={member.name || member.primaryName}
                          style={{
                            height: "200px",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            backgroundColor: "#e0e0e0",
                            height: "200px",
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
                          {member.name || member.primaryName}
                        </Card.Title>
                        <div
                          style={{ fontSize: "0.8rem" }}
                          className="text-muted"
                        >
                          {member.characters.length > 0 && (
                            <div>
                              <strong>Character:</strong>{" "}
                              {member.characters
                                .filter((char) => char && char.trim())
                                .join(", ")}
                            </div>
                          )}
                          {member.jobs.length > 0 && (
                            <div>
                              <strong>Job:</strong> {member.jobs.join(", ")}
                            </div>
                          )}
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

export default EpisodeDetail;
