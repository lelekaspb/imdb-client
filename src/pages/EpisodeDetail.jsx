import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import { Container, Card, Spinner, Alert } from "react-bootstrap";

import useEpisode from "../hooks/useEpisode";
import useCast from "../hooks/useCast";
import { normalizeList } from "../utils/normalizeList";

import PersonCard from "../components/people/PersonCard";
import Breadcrumbs from "../components/navigation/Breadcrumbs";
import DetailLayout from "../components/layout/DetailLayout";
import InfoCard from "../components/common/InfoCard";
import SmartImage from "../components/common/SmartImage";
import NotesSection from "../components/notes/NotesSection";

export default function EpisodeDetail() {
  const { id } = useParams();
  const location = useLocation();

  const { episode, loading, error } = useEpisode(id);
  const rawCast = useCast(id);
  const [cast, setCast] = useState([]);

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

  if (!episode) return null;

  const title =
    episode.episodeTitle ??
    episode.primaryTitle ??
    episode.title ??
    "Episode";

  const posterNode = (
    <SmartImage
      src={episode.posterUrl}
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
  );

  const aboutItems = [
    { label: "Plot", value: episode.plot },
    { label: "Season", value: episode.seasonNumber },
    { label: "Episode", value: episode.episodeNumber },
    {
      label: "Released",
      value: episode.releaseDate
        ? new Date(episode.releaseDate).toLocaleDateString()
        : null,
    },
  ];

  const trail = [];
  if (episode.parentSeriesId) {
    trail.push({
      label: episode.parentSeriesTitle,
      path: `/series/${episode.parentSeriesId}`,
    });
  }
  trail.push({ label: title, path: `/episode/${id}` });

  const footerContent = (
    <>
      <NotesSection tconst={id} />

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
                      from: { label: title, path: `/episode/${id}` },
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
        title={title}
        poster={posterNode}
        aboutCard={<InfoCard title="About" items={aboutItems} />}
        footerContent={footerContent}
      />
    </Container>
  );
}
