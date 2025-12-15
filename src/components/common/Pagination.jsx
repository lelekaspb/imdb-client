import React from 'react';
import { Pagination as BSPagination } from 'react-bootstrap';

export default function Pagination({ current = 1, total = 1, onChange = () => {} }) {
  const items = [];
  const start = Math.max(1, current - 2);
  const end = Math.min(total, start + 4);
  for (let i = start; i <= end; i++) {
    items.push(
      <BSPagination.Item key={i} active={i === current} onClick={() => onChange(i)}>{i}</BSPagination.Item>
    );
  }
  return <BSPagination>{items}</BSPagination>;
}
