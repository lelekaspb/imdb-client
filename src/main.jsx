import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import MovieDetail from "./pages/MovieDetail.jsx";
import SeriesDetail from "./pages/SeriesDetail.jsx";
import PersonDetail from "./pages/PersonDetail.jsx";
import UserProfile from "./pages/UserProfile.jsx";
import UserLogIn from "./pages/UserLogIn.jsx";
import UserSignUp from "./pages/UserSignUp.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/series/:id" element={<SeriesDetail />} />
        <Route path="/person/:id" element={<PersonDetail />} />
        <Route path="/user" element={<UserProfile />} />
        <Route path="/user/login" element={<UserLogIn />} />
        <Route path="/user/signup" element={<UserSignUp />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
