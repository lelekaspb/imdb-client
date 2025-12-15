import React, { useState } from "react";
import { Navbar, Container, Nav, Form, Button } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FaUser } from "react-icons/fa";

export default function AppNavbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    const q = searchQuery.trim();
    if (!q) return;

    navigate(`/search?query=${encodeURIComponent(q)}`);
  };

  const handleUserClick = () => {
    navigate(isLoggedIn ? "/user/profile" : "/user/login");
  };

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand>MovieApp</Navbar.Brand>
        </LinkContainer>

        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/browse">
              <Nav.Link>Browse</Nav.Link>
            </LinkContainer>
          </Nav>

          {/* Search Bar */}
          <Form className="d-flex" onSubmit={handleSearch}>
            <Form.Control
              type="search"
              placeholder="Search movies..."
              className="me-2"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button variant="outline-success" type="submit">
              Search
            </Button>
          </Form>

          {/* User Icon */}
          <Nav>
            <Nav.Link onClick={handleUserClick} style={{ cursor: "pointer" }}>
              <FaUser size={24} />
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
