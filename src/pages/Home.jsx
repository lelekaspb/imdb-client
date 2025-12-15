import React from "react";
import { Container, Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useMoviesList from "../hooks/useMoviesList";
import MovieCard from "../components/movies/MovieCard";
import { getCardPath } from "./listPageHelpers";

/* ---------------------------
   Helpers
---------------------------- */
const getPoster = (item) =>
  item.posterUrl || item.tmdbPoster || item.poster_path || null;

/* ---------------------------
   Skeleton Card
---------------------------- */
function SkeletonCard() {
  return (
    <div
      style={{
        width: 180,
        height: 300,
        background: "#e5e5e5",
        borderRadius: 6,
        flex: "0 0 auto",
      }}
    />
  );
}

/* ---------------------------
   Horizontal Section Row
   MOVIES ONLY
---------------------------- */
function SectionRow({ title, params, seeMoreLink }) {
  const navigate = useNavigate();

  const { list, loading } = useMoviesList({
    ...params,
    type: "movie", // ✅ FORCE MOVIES ONLY
  });

  return (
    <section className="mb-5">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4 className="mb-0">{title}</h4>

        {seeMoreLink && (
          <span
            role="button"
            className="text-primary"
            onClick={() => navigate(seeMoreLink)}
          >
            See more →
          </span>
        )}
      </div>

      <div className="d-flex gap-3 overflow-auto pb-2">
        {loading &&
          Array.from({ length: params.pageSize || 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}

        {!loading &&
          list.map((item) => {
            const path = getCardPath(item);

            return (
              <div
                key={item.tconst}
                style={{ width: 180, height: 300, cursor: "pointer" }}
                onClick={() =>
                  navigate(path, {
                    state: {
                      from: { label: "Home", path: "/" },
                    },
                  })
                }
              >
                <MovieCard movie={item} />
              </div>
            );
          })}
      </div>
    </section>
  );
}

/* ---------------------------
   Featured Carousel
   MOVIES ONLY
---------------------------- */
function FeaturedCarousel() {
  const navigate = useNavigate();

  const { list, loading } = useMoviesList({
    sort: "top-rated",
    type: "movie", // ✅ FORCE MOVIES ONLY
    pageSize: 5,
  });

  const itemsWithImages = list.filter((i) => getPoster(i));

  return (
    <div style={{ width: "100vw", marginLeft: "calc(-50vw + 50%)" }}>
      <Carousel fade controls indicators className="mb-5">
        {loading && (
          <Carousel.Item>
            <div
              style={{
                height: "60vh",
                minHeight: 420,
                background: "#e5e5e5",
              }}
            />
          </Carousel.Item>
        )}

        {!loading &&
          itemsWithImages.map((item) => {
            const path = getCardPath(item);
            const image = getPoster(item);

            return (
              <Carousel.Item
                key={item.tconst}
                style={{ cursor: "pointer" }}
                onClick={() =>
                  navigate(path, {
                    state: { from: { label: "Home", path: "/" } },
                  })
                }
              >
                <div
                  style={{
                    height: "60vh",
                    minHeight: 420,
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />

                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0))",
                  }}
                />

                <Carousel.Caption className="text-start">
                  <h2 className="fw-bold">{item.primaryTitle}</h2>
                  {item.startYear && <p>{item.startYear}</p>}
                </Carousel.Caption>
              </Carousel.Item>
            );
          })}
      </Carousel>
    </div>
  );
}

/* ---------------------------
   Home Page
---------------------------- */
export default function Home() {
  return (
    <>
      <FeaturedCarousel />

      <Container fluid className="py-4 px-5">
        <SectionRow
          title="Top Action Movies"
          params={{ genre: "Action", sort: "top-rated", pageSize: 6 }}
          seeMoreLink="/browse?type=movie&genre=Action&sort=top-rated"
        />

        <SectionRow
          title="Top Drama Movies"
          params={{ genre: "Drama", sort: "top-rated", pageSize: 6 }}
          seeMoreLink="/browse?type=movie&genre=Drama&sort=top-rated"
        />

        <SectionRow
          title="Top Comedy Movies"
          params={{ genre: "Comedy", sort: "top-rated", pageSize: 6 }}
          seeMoreLink="/browse?type=movie&genre=Comedy&sort=top-rated"
        />

        <SectionRow
          title="Top Documentary Movies"
          params={{ genre: "Documentary", sort: "top-rated", pageSize: 6 }}
          seeMoreLink="/browse?type=movie&genre=Documentary&sort=top-rated"
        />
      </Container>
    </>
  );
}
