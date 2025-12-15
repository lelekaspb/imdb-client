import React from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Container, Card, Spinner, Alert, Button } from "react-bootstrap";

import usePersonDetails from "../hooks/usePersonDetails";
import usePersonImages from "../hooks/usePersonImages";
import useBookmarks from "../hooks/useBookmarks";
import MyActivityPanel from "../components/user/MyActivityPanel";

import Breadcrumbs from "../components/navigation/Breadcrumbs";
import DetailLayout from "../components/layout/DetailLayout";
import InfoCard from "../components/common/InfoCard";
import CreditCard from "../components/people/CreditCard";
import PersonImageGallery from "../components/people/PersonImageGallery";
import SmartImage from "../components/common/SmartImage";

export default function PersonDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { person, loading, error } = usePersonDetails(id);
  const { images } = usePersonImages(id);

  const { isLoggedIn, isBookmarked, addBookmark, removeBookmark } =
    useBookmarks({ nconst: id });

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

  if (!person) return null;

  const name = person.primaryName ?? person.name ?? "Unknown";

  const posterNode = (
    <>
      <SmartImage
        src={person.profileUrl}
        type="person"
        name={name}
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
        noteTarget={{ nconst: id }}
      />

    </>
  );

  const aboutItems = [
    { label: "Profession", value: person.primaryProfession },
    { label: "Born", value: person.birthYear },
    { label: "Died", value: person.deathYear },
  ];

  const trail = [];
  if (location.state?.from) trail.push(location.state.from);
  trail.push({ label: name, path: `/person/${id}` });

  return (
    <Container className="py-4">
      <DetailLayout
        breadcrumbs={<Breadcrumbs trail={trail} />}
        title={name}
        poster={posterNode}
        aboutCard={<InfoCard title="About" items={aboutItems} />}
        footerContent={
          <>
            

            {images.length > 0 && (
              <Card className="mb-4 shadow-sm">
                <Card.Header className="fw-semibold bg-white">
                  Photos
                </Card.Header>
                <Card.Body>
                  <PersonImageGallery images={images} />
                </Card.Body>
              </Card>
            )}

            {Array.isArray(person.credits) &&
              person.credits.length > 0 && (
                <Card className="shadow-sm">
                  <Card.Header className="fw-semibold bg-white">
                    Credits
                  </Card.Header>
                  <Card.Body>
                    <div className="row g-3">
                      {person.credits.map((credit, idx) => (
                        <div
                          className="col-6 col-md-4 col-lg-3"
                          key={idx}
                        >
                          <CreditCard credit={credit} />
                        </div>
                      ))}
                    </div>
                  </Card.Body>
                </Card>
              )}
          </>
        }
      />
    </Container>
  );
}
