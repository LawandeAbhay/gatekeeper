import React from 'react';
import { Building2, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import StatsCard from '../common/StatsCard';

export default function PlatformOverview({ organizations, onNavigate }) {
  const total = organizations.length;
  const active = organizations.filter((o) => o.status === 'ACTIVE').length;
  const pending = organizations.filter((o) => o.status === 'PENDING').length;
  const suspended = organizations.filter((o) => o.status === 'SUSPENDED').length;
  const awaiting = pending + suspended;

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">PLATFORM OPERATIONS</p>
          <h1>Control plane overview</h1>
          <p className="muted">
            Tenant provisioning, gateway security boundaries, and platform-level administration.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <StatsCard
          label="Organizations"
          value={total}
          detail="TOTAL PROVISIONED TENANTS"
          icon={Building2}
        />
        <StatsCard
          label="Active Tenants"
          value={active}
          detail="READY FOR GATEWAY TRAFFIC"
          icon={CheckCircle2}
        />
        <StatsCard
          label="Awaiting Action"
          value={awaiting}
          detail={`${pending} PENDING · ${suspended} SUSPENDED`}
          icon={AlertTriangle}
        />
      </div>

      <div className="spotlight-card">
        <div className="spotlight-copy">
          <p className="eyebrow" style={{ color: 'var(--lime)' }}>NEXT PLATFORM ACTION</p>
          <h2>Provision a tenant without crossing its boundary.</h2>
          <p>
            Create an organization, assign a dedicated tenant administrator, and activate its status.
            The tenant receives an isolated JWT-scoped control plane workspace where they configure their own
            gateway routes and transformation policies.
          </p>
        </div>
        <button
          type="button"
          className="button button-lime"
          onClick={() => onNavigate('organizations')}
        >
          <span>Manage organizations</span>
          <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}
