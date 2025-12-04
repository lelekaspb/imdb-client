import {
  Navbar as BsNavbar,
  Container,
  Nav,
  Form,
  FormControl,
  Breadcrumb,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { PersonCircle } from "react-bootstrap-icons";

function Navbar({ breadcrumbs }) {
  const navigate = useNavigate();

  const handleUserIconClick = () => {
    const token = localStorage.getItem("authToken");
    if (token) {
      navigate("/user");
    } else {
      navigate("/user/login");
    }
  };

  return (
    <>
      <BsNavbar bg="dark" variant="dark" className="mb-0">
        <Container fluid className="px-5">
          <BsNavbar.Brand
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img
              src="/imdb.png"
              alt="IMDb Logo"
              height="40"
              className="d-inline-block align-top me-2"
            />
          </BsNavbar.Brand>

          <Nav className="me-auto">
            <Nav.Link onClick={() => navigate("/")}>Browse</Nav.Link>
          </Nav>

          <Form
            className="d-flex mx-auto"
            style={{ maxWidth: "500px", flex: 1 }}
          >
            <FormControl
              type="search"
              placeholder="Search IMDb"
              className="me-2"
              aria-label="Search"
            />
          </Form>

          <Nav>
            <Nav.Link onClick={handleUserIconClick}>
              <PersonCircle size={28} />
            </Nav.Link>
          </Nav>
        </Container>
      </BsNavbar>

      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className="bg-light border-bottom mb-3">
          <Container fluid className="px-5 py-2">
            <Breadcrumb className="mb-0">
              {breadcrumbs.map((crumb, index) => (
                <Breadcrumb.Item
                  key={index}
                  active={index === breadcrumbs.length - 1}
                  onClick={() =>
                    !crumb.active && crumb.path && navigate(crumb.path)
                  }
                  style={{ cursor: crumb.path ? "pointer" : "default" }}
                >
                  {crumb.label}
                </Breadcrumb.Item>
              ))}
            </Breadcrumb>
          </Container>
        </div>
      )}
    </>
  );
}

export default Navbar;
