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
  Modal,
} from "react-bootstrap";
import { BookmarkPlus, BookmarkCheckFill } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function PersonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [person, setPerson] = useState(null);
  const [filmography, setFilmography] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkId, setBookmarkId] = useState(null);
  const apiKey = "e4f70d8185101e89d6853659d9cfd53b";

  const handleImageClick = (image) => {
    setSelectedImage(image);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleNextImage = () => {
    const currentIndex = images.findIndex(
      (img) => img.file_path === selectedImage.file_path
    );
    const nextIndex = (currentIndex + 1) % images.length;
    setSelectedImage(images[nextIndex]);
  };

  const handlePrevImage = () => {
    const currentIndex = images.findIndex(
      (img) => img.file_path === selectedImage.file_path
    );
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setSelectedImage(images[prevIndex]);
  };

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleAddBookmark = async () => {
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
          tconst: null,
          nconst: id,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setIsBookmarked(true);
        setBookmarkId(data.id || data.bookmarkId);
      } else {
        const errorData = await response.json();
        console.error("Failed to add bookmark:", errorData);
      }
    } catch (err) {
      console.error("Failed to add bookmark:", err);
    }
  };

  const handleRemoveBookmark = async () => {
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
        setIsBookmarked(false);
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
    setLoading(true);

    // Fetch person details and filmography in parallel
    Promise.all([
      fetch(`http://localhost:5079/api/Person/${id}`),
      fetch(`http://localhost:5079/api/Person/${id}/filmography`),
    ])
      .then(([personRes, filmRes]) => {
        if (!personRes.ok) {
          return personRes
            .json()
            .then((data) => {
              throw new Error(data.message || "Failed to fetch person details");
            })
            .catch(() => {
              throw new Error("Failed to fetch person details");
            });
        }

        const personPromise = personRes.json();
        const filmPromise = filmRes.ok ? filmRes.json() : Promise.resolve([]);

        return Promise.all([personPromise, filmPromise]);
      })
      .then(([personData, filmData]) => {
        setPerson(personData);
        setFilmography(
          Array.isArray(filmData) ? filmData : filmData.filmography || []
        );

        // Fetch TMDB photo
        return fetch(
          `https://api.themoviedb.org/3/search/person?api_key=${apiKey}&query=${encodeURIComponent(
            personData.primaryName || personData.name
          )}`
        );
      })
      .then((res) => res.json())
      .then((data) => {
        if (data.results && data.results.length > 0) {
          const tmdbPersonId = data.results[0].id;
          setPerson((prev) => ({
            ...prev,
            profile_path: data.results[0].profile_path,
            tmdbId: tmdbPersonId,
          }));

          // Fetch person images from TMDB
          return fetch(
            `https://api.themoviedb.org/3/person/${tmdbPersonId}/images?api_key=${apiKey}`
          );
        }
        return Promise.resolve(null);
      })
      .then((res) => {
        if (res) {
          return res.json();
        }
        return null;
      })
      .then((imageData) => {
        if (imageData && imageData.profiles) {
          setImages(imageData.profiles);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id, apiKey]);

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar
          breadcrumbs={[
            { label: "Browse", path: "/" },
            { label: "Person", active: true },
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
            { label: "Person", active: true },
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

  const breadcrumbs = [
    { label: "Browse", path: "/" },
    ...(location.state?.from ? [location.state.from] : []),
    { label: person?.primaryName || person?.name || "Person", active: true },
  ];

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
          <Col md={4}>
            {person.profile_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w500${person.profile_path}`}
                alt={person.primaryName || person.name}
                style={{
                  width: "100%",
                  maxHeight: "600px",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div
                style={{
                  backgroundColor: "#e0e0e0",
                  height: "600px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <span className="text-muted">No Photo</span>
              </div>
            )}
          </Col>
          <Col md={8}>
            <div className="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h1>{person.primaryName || person.name}</h1>
                {person.primaryProfession && (
                  <p className="text-muted mb-0" style={{ fontSize: "1.2rem" }}>
                    {person.primaryProfession}
                  </p>
                )}
              </div>
              {isLoggedIn && (
                <Button
                  variant={isBookmarked ? "success" : "primary"}
                  onClick={
                    isBookmarked ? handleRemoveBookmark : handleAddBookmark
                  }
                  className="d-flex align-items-center gap-2"
                >
                  {isBookmarked ? (
                    <>
                      <BookmarkCheckFill />
                      Bookmarked
                    </>
                  ) : (
                    <>
                      <BookmarkPlus />
                      Add to Bookmarks
                    </>
                  )}
                </Button>
              )}
            </div>
            <Card className="mt-3">
              <Card.Body>
                <h5>Person Information</h5>
                <p>
                  <strong>ID:</strong> {person.nconst}
                </p>
                {person.birthYear && (
                  <p>
                    <strong>Birth Year:</strong> {person.birthYear}
                  </p>
                )}
                {person.deathYear && (
                  <p>
                    <strong>Death Year:</strong> {person.deathYear}
                  </p>
                )}
                {person.primaryProfession && (
                  <p>
                    <strong>Primary Profession:</strong>{" "}
                    {person.primaryProfession}
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {images.length > 0 && (
          <Row className="mt-4">
            <Col>
              <h4 className="mb-3">Images</h4>
              <Row xs={3} md={4} lg={6} className="g-3">
                {images.slice(0, 12).map((image, index) => (
                  <Col key={index}>
                    <img
                      src={`https://image.tmdb.org/t/p/w185${image.file_path}`}
                      alt={`${person.primaryName || person.name} - ${
                        index + 1
                      }`}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                      onClick={() => handleImageClick(image)}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}

        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>{person?.primaryName || person?.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center" style={{ position: "relative" }}>
            {selectedImage && (
              <>
                <Button
                  variant="light"
                  onClick={handlePrevImage}
                  style={{
                    position: "absolute",
                    left: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    opacity: 0.8,
                  }}
                >
                  ←
                </Button>
                <img
                  src={`https://image.tmdb.org/t/p/original${selectedImage.file_path}`}
                  alt={person?.primaryName || person?.name}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "80vh",
                    objectFit: "contain",
                  }}
                />
                <Button
                  variant="light"
                  onClick={handleNextImage}
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 1,
                    opacity: 0.8,
                  }}
                >
                  →
                </Button>
              </>
            )}
          </Modal.Body>
        </Modal>

        {filmography.length > 0 && (
          <Row className="mt-4">
            <Col>
              <h4 className="mb-3">Appears In</h4>
              <Row xs={2} md={3} lg={6} className="g-3">
                {filmography.slice(0, 12).map((item, index) => (
                  <Col key={index}>
                    <Card
                      className="h-100"
                      onClick={() => {
                        const isSeries =
                          item.titleType === "tvSeries" ||
                          item.titleType === "tvMiniSeries" ||
                          item.titleType === "tvEpisode";
                        const path = `/${isSeries ? "series" : "movie"}/${
                          item.tconst
                        }`;
                        navigate(path, {
                          state: {
                            from: {
                              label:
                                person?.primaryName || person?.name || "Person",
                              path: `/person/${id}`,
                            },
                            ...(isSeries
                              ? { seriesTitle: item.title || item.primaryTitle }
                              : {
                                  movieTitle: item.title || item.primaryTitle,
                                }),
                          },
                        });
                      }}
                      style={{ cursor: "pointer" }}
                    >
                      {item.posterUrl ? (
                        <Card.Img
                          variant="top"
                          src={item.posterUrl}
                          alt={item.title || item.primaryTitle}
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
                          <span className="text-muted">No Poster</span>
                        </div>
                      )}
                      <Card.Body className="p-2">
                        <Card.Title
                          style={{
                            fontSize: "0.9rem",
                            marginBottom: "0.25rem",
                          }}
                        >
                          {item.title || item.primaryTitle}
                        </Card.Title>
                        <div
                          style={{ fontSize: "0.8rem" }}
                          className="text-muted mb-0"
                        >
                          {item.startYear && <div>{item.startYear}</div>}
                          {item.jobs && item.jobs.length > 0 && (
                            <div>
                              <strong>Job:</strong> {item.jobs.join(", ")}
                            </div>
                          )}
                          {item.characters && item.characters.length > 0 && (
                            <div>
                              <strong>Character:</strong>{" "}
                              {item.characters
                                .filter((char) => char && char.trim())
                                .join(", ")}
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

export default PersonDetail;
