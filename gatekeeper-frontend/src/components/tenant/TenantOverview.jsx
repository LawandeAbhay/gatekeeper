import React from 'react';
import { Route, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import StatsCard from '../common/StatsCard';

export default function TenantOverview({ routes, organization, audits, onNavigate }) {
  const total = routes.length;
  const active = routes.filter((r) => r.active).length;
  const policyEnabled = routes.filter(
    (r) => r.requestsPerMinute || r.idempotencyEnabled || r.headerRules?.length
  ).length;

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TENANT CONTROL PLANE</p>
          <h1>{organization?.name || 'Your tenant'}</h1>
          <p className="muted">
            Your organization's gateway configuration, securely isolated by the JWT tenant claim.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          label="Routes Configured"
          value={total}
          detail="GATEWAY ENDPOINTS"
          icon={Route}
        />
        <StatsCard
          label="Active Routes"
          value={active}
          detail="LIVE ON DATA PLANE"
          icon={CheckCircle2}
        />
        <StatsCard
          label="Policy-Protected"
          value={policyEnabled}
          detail={`${audits.length} AUDIT RECORDS RECORDED`}
          icon={ShieldCheck}
        />
      </div>

      <div className="spotlight-card">
        <div className="spotlight-copy">
          <p className="eyebrow" style={{ color: 'var(--lime)' }}>GATEWAY CONFIGURATION</p>
          <h2>Shape traffic before it reaches your services.</h2>
          <p>
            Define paths, destinations, allowed HTTP methods, rate limits, idempotency guards, and header
            transformations. Every mutation receives a durable, auditable configuration version snapshot.
          </p>
        </div>
        <button
          type="button"
          className="button button-lime"
          onClick={() => onNavigate('routes')}
        >
          <span>Manage routes</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
