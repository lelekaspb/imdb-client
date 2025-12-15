import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import useUserProfile from "../../hooks/useUserProfile";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Row,
  Col,
  Card,
  Dropdown,
  Spinner,
  Alert,
} from "react-bootstrap";

/**
 * Layout component for the protected user area.
 * Handles navigation and renders nested user panels.
 */
export default function UserProfile() {
  const { logout } = useAuth();
  const { profile, loading, error } = useUserProfile();
  const navigate = useNavigate();
  const location = useLocation();

  const currentRoute = location.pathname.split("/").pop();

  const labelMap = {
    profile: "Profile",
    bookmarks: "Bookmarks",
    ratings: "Ratings",
    history: "Search history",
    notes: "Notes",
  };

  function handleLogout() {
    logout();
    navigate("/user/login", { replace: true });
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Container className="py-4 flex-grow-1">
        <Row className="mb-4">
          <Col className="d-flex justify-content-end">
            <Dropdown align="end">
              <Dropdown.Toggle variant="outline-secondary">
                {labelMap[currentRoute] || "Profile"}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/user/profile")}>
                  Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/user/bookmarks")}>
                  Bookmarks
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/user/ratings")}>
                  Ratings
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/user/history")}>
                  Search history
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/user/notes")}>
                  Notes
                </Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item
                  className="text-danger"
                  onClick={handleLogout}
                >
                  Log out
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Col>
        </Row>

        {loading && <Spinner />}
        {error && <Alert variant="danger">{String(error)}</Alert>}

        {!loading && profile && (
          <Row>
            <Col md={4} className="text-center mb-4">
              <div
                className="rounded-circle bg-secondary mx-auto mb-3"
                style={{ width: 120, height: 120 }}
              />
            </Col>

            <Col md={8}>
              <Card>
                <Card.Body>
                  <Outlet />
                </Card.Body>
              </Card>
            </Col>
          </Row>
        )}
      </Container>
    </div>
  );
}
