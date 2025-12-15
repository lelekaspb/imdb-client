import React, { useState } from "react";
import { Card, Row, Col, Spinner, Alert, Pagination } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import useUserSearchHistory from "../../hooks/useUserSearchHistory";

const PAGE_SIZE = 20;

export default function UserSearchHistoryPanel() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);

  const { history, total, loading, error } =
    useUserSearchHistory({ page, pageSize: PAGE_SIZE });

  const totalPages = Math.ceil(total / PAGE_SIZE);
  const hasHistory = history.length > 0;

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <Card>
      <Card.Body>
        <h4 className="mb-3">Search History</h4>

        {!hasHistory && (
          <p className="text-muted">
            Your search history will appear here.
          </p>
        )}

        {hasHistory && (
          <Row xs={1} md={2} lg={3} className="g-3">
            {history.map((item) => (
              <Col key={item.tconst}>
                <Card
                  className="h-100"
                  style={{ cursor: "pointer" }}
                  onClick={() => navigate(`/movie/${item.tconst}`)}
                >
                  <Card.Body>
                    <Card.Title>{item.title}</Card.Title>
                    <Card.Text className="text-muted small">
                      {new Date(item.visitedAt).toLocaleString()}
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        )}

        {totalPages > 1 && (
          <div className="d-flex justify-content-center mt-4">
            <Pagination>
              <Pagination.Prev
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              />
              <Pagination.Next
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              />
            </Pagination>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}
