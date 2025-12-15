import React, { useEffect, useMemo, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import {
  Container,
  Spinner,
  Alert,
  Card,
  Button,
  Form,
} from "react-bootstrap";
import { BookmarkPlus, BookmarkCheckFill } from "react-bootstrap-icons";

import useSeries from "../hooks/useSeries";
import useCast from "../hooks/useCast";
import useSeriesEpisodes from "../hooks/useSeriesEpisodes";
import useBookmarks from "../hooks/useBookmarks";
import useRating from "../hooks/useRating";
import { normalizeList } from "../utils/normalizeList";

import PersonCard from "../components/people/PersonCard";
import EpisodeCard from "../components/series/EpisodeCard";
import Breadcrumbs from "../components/navigation/Breadcrumbs";
import DetailLayout from "../components/layout/DetailLayout";
import InfoCard from "../components/common/InfoCard";
import SmartImage from "../components/common/SmartImage";
import NotesSection from "../components/notes/NotesSection";

export default function SeriesDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const { series, loading, error } = useSeries(id);
  const rawCast = useCast(id, "series");

  const { episodes = [], loading: loadingEpisodes, error: episodesError } =
    useSeriesEpisodes(id);

  const { isLoggedIn, isBookmarked, addBookmark, removeBookmark } =
    useBookmarks({ tconst: id });

  const { rating, saveRating } = useRating(id);

  const [cast, setCast] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);

  useEffect(() => {
    setCast(normalizeList(rawCast));
  }, [rawCast]);

  const seasons = useMemo(() => {
    const set = new Set(
      episodes
        .map(e => e.seasonNumber)
        .filter(n => typeof n === "number")
    );
    return Array.from(set).sort((a, b) => a - b);
  }, [episodes]);

  useEffect(() => {
    if (seasons.length && selectedSeason === null) {
      setSelectedSeason(seasons[0]);
    }
  }, [seasons, selectedSeason]);

  const filteredEpisodes = useMemo(() => {
    if (!selectedSeason) return [];
    return episodes
      .filter(e => e.seasonNumber === selectedSeason)
      .sort(
        (a, b) =>
          (a.episodeNumber ?? 0) - (b.episodeNumber ?? 0)
      );
  }, [episodes, selectedSeason]);

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

  if (!series) return null;

  const title =
    series.seriesTitle ??
    series.primaryTitle ??
    series.title ??
    location.state?.from?.label ??
    "Series";

  const posterNode = (
    <>
      <SmartImage
        src={series.posterUrl}
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

      <div className="d-grid gap-2 mt-3">
        {isLoggedIn ? (
          <>
            <Button
              variant={isBookmarked ? "success" : "outline-primary"}
              onClick={isBookmarked ? removeBookmark : addBookmark}
            >
              {isBookmarked ? (
                <BookmarkCheckFill className="me-2" />
              ) : (
                <BookmarkPlus className="me-2" />
              )}
              {isBookmarked ? "Bookmarked" : "Add to Watchlist"}
            </Button>

            <Form.Select
              value={rating ?? ""}
              onChange={(e) => saveRating(Number(e.target.value))}
            >
              <option value="">Rate this series</option>
              {[1,2,3,4,5,6,7,8,9,10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </Form.Select>
          </>
        ) : (
          <Button
            variant="outline-secondary"
            onClick={() => navigate("/user/login")}
          >
            Log in to bookmark or rate
          </Button>
        )}
      </div>
    </>
  );

  const aboutItems = [
    { label: "Plot", value: series.plot },
    { label: "Language", value: series.language },
    { label: "Country", value: series.country },
    { label: "Seasons", value: series.numberOfSeasons },
    { label: "Released", value: series.releaseDate },
  ];

  const trail = [];
  if (location.state?.from) trail.push(location.state.from);
  trail.push({ label: title, path: `/series/${id}` });

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
                      from: {
                        label: title,
                        path: `/series/${id}`,
                      },
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
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="mb-0">Episodes</h4>
          <Form.Select
            style={{ maxWidth: 220 }}
            value={selectedSeason ?? ""}
            onChange={(e) => setSelectedSeason(Number(e.target.value))}
          >
            {seasons.map(s => (
              <option key={s} value={s}>
                Season {s}
              </option>
            ))}
          </Form.Select>
        </div>

        {loadingEpisodes && <Spinner />}

        {episodesError && (
          <Alert variant="danger">
            Failed to load episodes
          </Alert>
        )}

        <div className="row g-3">
          {filteredEpisodes.map(ep => (
            <div
              key={ep.tconst}
              className="col-12 col-sm-6 col-md-4 col-lg-3"
            >
              <EpisodeCard
                episode={ep}
                context={{
                  from: {
                    label: title,
                    path: `/series/${id}`,
                  },
                }}
              />
            </div>
          ))}
        </div>
      </DetailLayout>
    </Container>
  );
}
