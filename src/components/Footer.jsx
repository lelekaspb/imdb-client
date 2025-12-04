import { Container } from "react-bootstrap";

function Footer() {
  return (
    <footer className="bg-dark text-white mt-auto py-3">
      <Container fluid className="text-center px-5">
        <p className="mb-1 text-white-50">
          Study Portfolio Project - Group 2 - Using IMDb data - RUC, Autumn 2025
        </p>
        <p className="mb-0 text-white-50 small">
          &copy; {new Date().getFullYear()} IMDb Clone
        </p>
      </Container>
    </footer>
  );
}

export default Footer;
