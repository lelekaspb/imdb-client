import React from "react";
import { Row, Col, Card } from "react-bootstrap";

export default function DetailLayout({
  breadcrumbs,
  title,
  poster,
  aboutCard,
  children,
  footerContent,
}) {
  return (
    <>
      {breadcrumbs && <div className="mb-3">{breadcrumbs}</div>}

      {title && <h1 className="mb-4">{title}</h1>}

      {/* Poster + About */}
      <Row className="g-4 mb-5">
        <Col xs={12} md={4}>
          {poster}
        </Col>

        <Col xs={12} md={8}>
          {aboutCard}
        </Col>
      </Row>

      {/* MAIN CONTENT (Episodes etc.) */}
      {children && (
        <Card className="mb-5 shadow-sm">
          <Card.Body>{children}</Card.Body>
        </Card>
      )}

      {/* FOOTER CONTENT (Cast, Photos, Credits) */}
      {footerContent && (
        <div className="mt-5">
          {footerContent}
        </div>
      )}
    </>
  );
}
