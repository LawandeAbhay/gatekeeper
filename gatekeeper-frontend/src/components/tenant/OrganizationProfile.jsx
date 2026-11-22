import React, { useState, useEffect } from 'react';
import { Building, Save } from 'lucide-react';
import { updateTenantOrganization } from '../../api/tenant';
import { useToast } from '../../context/ToastContext';
import { StatusBadge } from '../common/Badge';

export default function OrganizationProfile({ organization, onRefresh }) {
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (organization?.name) {
      setName(organization.name);
    }
  }, [organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);
    try {
      await updateTenantOrganization({ name: name.trim() });
      toast('Organization updated', `Display name updated to "${name.trim()}".`);
      onRefresh();
    } catch (err) {
      setError(err.message || 'Could not update organization display name.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (val) => {
    if (!val) return '—';
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(new Date(val));
    } catch {
      return val;
    }
  };

  if (!organization) {
    return (
      <div className="page-section">
        <div className="muted" style={{ padding: '40px 0', textAlign: 'center' }}>
          Loading organization profile...
        </div>
      </div>
    );
  }

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TENANT PROFILE</p>
          <h1>My organization</h1>
          <p className="muted">
            View tenant boundary identity and update your public organization display name.
          </p>
        </div>
      </div>

      <div className="profile-grid">
        <article className="profile-card">
          <div>
            <p className="eyebrow">TENANT IDENTITY</p>
            <h2>{organization.name}</h2>
            <p className="muted" style={{ fontFamily: 'var(--font-mono)' }}>
              /{organization.slug}
            </p>
          </div>

          <div className="profile-details">
            <div>
              <span>ORGANIZATION ID</span>
              <strong>#{organization.id}</strong>
            </div>
            <div>
              <span>STATUS</span>
              <div>
                <StatusBadge status={organization.status} />
              </div>
            </div>
            <div>
              <span>PROVISIONED</span>
              <strong>{formatDate(organization.createdAt)}</strong>
            </div>
            <div>
              <span>LAST MODIFIED</span>
              <strong>{formatDate(organization.updatedAt)}</strong>
            </div>
          </div>

          <p className="muted" style={{ fontSize: '12px' }}>
            All gateway routing rules created by this tenant are bound to the{' '}
            <span className="mono">/{organization.slug}</span> prefix and cannot access or
            alter other tenants' traffic.
          </p>
        </article>

        <form className="profile-card" onSubmit={handleSubmit}>
          <div>
            <h3>Update display name</h3>
            <p className="muted" style={{ fontSize: '13px', marginTop: 4 }}>
              The URL slug (<span className="mono">/{organization.slug}</span>) and lifecycle status remain platform-governed.
            </p>
          </div>

          {error && <div className="form-error">{error}</div>}

          <label className="field">
            <span>Organization Name</span>
            <input
              type="text"
              maxLength={150}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>

          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="button button-primary" disabled={submitting}>
              <Save size={16} />
              <span>{submitting ? 'Saving...' : 'Save name'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
