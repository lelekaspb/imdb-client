// src/App.jsx
import React from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";

// Layout
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/common/ScrollToTop";

// Pages
import Home from "./pages/Home";
import Browse from "./pages/Browse";
import MovieDetail from "./pages/MovieDetail";
import SeriesDetail from "./pages/SeriesDetail";
import EpisodeDetail from "./pages/EpisodeDetail";
import PersonDetail from "./pages/PersonDetail";
import SearchResults from "./pages/SearchResults";

// User components
import UserLogIn from "./components/user/UserLogIn";
import UserSignUp from "./components/user/UserSignUp";
import UserProfile from "./components/user/UserProfile";
import ProfilePanel from "./components/ProfilePanel";
import UserBookmarksPanel from "./components/user/UserBookmarks";
import UserRatingsPanel from "./components/user/UserRatings";
import UserSearchHistoryPanel from "./components/user/UserSearchHistory";
import UserNotesPanel from "./components/user/UserNotesPanel";


// Auth
import RequireAuth from "./components/common/RequireAuth";

/* ---------------------------
   Layout
---------------------------- */
function MainLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}

/* ---------------------------
   404
---------------------------- */
function NotFound() {
  return (
    <div className="container py-5 text-center">
      <h1>404 — Not Found</h1>
      <p>The page you are looking for doesn't exist.</p>
    </div>
  );
}

/* ---------------------------
   App
---------------------------- */
export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />

      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          {/* Browse / Lists */}
          <Route path="/browse" element={<Browse />} />
          <Route path="/films" element={<Browse defaultType="movie" />} />
          <Route path="/series" element={<Browse defaultType="series" />} />

          {/* Titles */}
          <Route path="/movie/:id" element={<MovieDetail />} />
          <Route path="/series/:id" element={<SeriesDetail />} />
          <Route path="/episode/:id" element={<EpisodeDetail />} />

          {/* People */}
          <Route path="/people" element={<SearchResults />} />
          <Route path="/person/:id" element={<PersonDetail />} />

          {/* Search */}
          <Route path="/search" element={<SearchResults />} />

          {/* Auth */}
          <Route path="/user/login" element={<UserLogIn />} />
          <Route path="/user/signup" element={<UserSignUp />} />

          {/* Protected user area */}
          <Route
            path="/user"
            element={
              <RequireAuth>
                <UserProfile />
              </RequireAuth>
            }
          >
            <Route index element={<ProfilePanel />} />
            <Route path="profile" element={<ProfilePanel />} />
            <Route path="bookmarks" element={<UserBookmarksPanel />} />
            <Route path="ratings" element={<UserRatingsPanel />} />
            <Route path="history" element={<UserSearchHistoryPanel />} />
            <Route path="notes" element={<UserNotesPanel />} />

          </Route>

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
