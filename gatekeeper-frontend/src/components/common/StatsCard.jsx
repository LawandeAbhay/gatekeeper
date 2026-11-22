import React from 'react';

export default function StatsCard({ label, value, detail, icon: Icon }) {
  return (
    <article className="stat-card">
      <div className="stat-header">
        <span>{label}</span>
        {Icon && <Icon size={16} className="muted" />}
      </div>
      <strong className="stat-number">{value}</strong>
      <small className="stat-footer">{detail}</small>
    </article>
  );
}
