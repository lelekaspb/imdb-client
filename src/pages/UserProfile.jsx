import { useState, useEffect } from "react";
import { Container, Row, Col, Card, Button, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PersonCircle } from "react-bootstrap-icons";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

function UserProfile() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("authToken");
    const userData = localStorage.getItem("user");

    if (!token) {
      // Redirect to login if not authenticated
      navigate("/user/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [navigate]);

  if (loading) {
    return (
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
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

  return (
    <div className="d-flex flex-column min-vh-100">
      <Navbar />
      <Container fluid className="flex-grow-1 py-4 px-5">
        <h2 className="mb-4">User Profile</h2>

        <Row>
          <Col md={3} className="text-center">
            <PersonCircle size={150} className="mb-3" />
            <p className="text-muted">Profile Picture</p>
          </Col>

          <Col md={9}>
            <Card>
              <Card.Body>
                <h4 className="mb-4">Profile Details</h4>

                <Row className="mb-3">
                  <Col sm={3}>
                    <strong>Username:</strong>
                  </Col>
                  <Col sm={9}>{user?.username || "N/A"}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={3}>
                    <strong>Email:</strong>
                  </Col>
                  <Col sm={9}>{user?.email || "N/A"}</Col>
                </Row>

                <Row className="mb-3">
                  <Col sm={3}>
                    <strong>Member Since:</strong>
                  </Col>
                  <Col sm={9}>
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </Col>
                </Row>

                <Button
                  variant="primary"
                  className="mt-3"
                  onClick={() => navigate("/user/edit")}
                >
                  Edit Profile
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </div>
  );
}

export default UserProfile;
