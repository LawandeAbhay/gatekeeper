import React from 'react';

export function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();
  let className = 'status-badge ';
  if (normalized === 'ACTIVE') {
    className += 'status-active';
  } else if (normalized === 'PENDING') {
    className += 'status-pending';
  } else {
    className += 'status-inactive';
  }

  return (
    <span className={className}>
      <i aria-hidden="true" />
      {normalized}
    </span>
  );
}

export function MethodTag({ method }) {
  return <span className="method-tag">{method}</span>;
}

export function PolicyTag({ children }) {
  return <span className="policy-tag">{children}</span>;
}
