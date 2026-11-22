import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import { createTenantRoute, updateTenantRoute } from '../../api/tenant';
import { useToast } from '../../context/ToastContext';

const HTTP_METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'];

export default function RouteModal({ isOpen, onClose, route, organization, onSaved }) {
  const [routeId, setRouteId] = useState('');
  const [name, setName] = useState('');
  const [pathPattern, setPathPattern] = useState('');
  const [targetBaseUrl, setTargetBaseUrl] = useState('');
  const [targetPathPrefix, setTargetPathPrefix] = useState('/');
  const [requestsPerMinute, setRequestsPerMinute] = useState('');
  const [responseTimeoutMs, setResponseTimeoutMs] = useState(3000);
  const [allowedMethods, setAllowedMethods] = useState(['GET']);
  const [idempotencyEnabled, setIdempotencyEnabled] = useState(false);
  const [active, setActive] = useState(true);
  const [headerRules, setHeaderRules] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen) return;

    if (route) {
      setRouteId(route.routeId || '');
      setName(route.name || '');
      setPathPattern(route.pathPattern || '');
      setTargetBaseUrl(route.targetBaseUrl || '');
      setTargetPathPrefix(route.targetPathPrefix || '/');
      setRequestsPerMinute(route.requestsPerMinute != null ? String(route.requestsPerMinute) : '');
      setResponseTimeoutMs(route.responseTimeoutMs || 3000);
      setAllowedMethods(route.allowedMethods || ['GET']);
      setIdempotencyEnabled(Boolean(route.idempotencyEnabled));
      setActive(Boolean(route.active));
      setHeaderRules(
        (route.headerRules || []).map((r) => ({
          direction: r.direction || 'REQUEST',
          action: r.action || 'ADD',
          headerName: r.headerName || '',
          headerValue: r.headerValue || '',
        }))
      );
    } else {
      const defaultSlug = organization?.slug ? `/${organization.slug}/` : '/';
      setRouteId('');
      setName('');
      setPathPattern(`${defaultSlug}**`);
      setTargetBaseUrl('http://localhost:8093');
      setTargetPathPrefix('/');
      setRequestsPerMinute('');
      setResponseTimeoutMs(3000);
      setAllowedMethods(['GET']);
      setIdempotencyEnabled(false);
      setActive(true);
      setHeaderRules([]);
    }
    setError(null);
  }, [isOpen, route, organization]);

  const toggleMethod = (method) => {
    setAllowedMethods((prev) => {
      if (prev.includes(method)) {
        if (prev.length === 1) return prev; // Keep at least one method
        return prev.filter((m) => m !== method);
      } else {
        return [...prev, method];
      }
    });
  };

  const addHeaderRule = () => {
    setHeaderRules((prev) => [
      ...prev,
      { direction: 'REQUEST', action: 'ADD', headerName: '', headerValue: '' },
    ]);
  };

  const updateHeaderRule = (index, field, value) => {
    setHeaderRules((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeHeaderRule = (index) => {
    setHeaderRules((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!routeId.trim() || !name.trim() || !pathPattern.trim() || !targetBaseUrl.trim()) {
      setError('Please fill in all required route identity fields.');
      return;
    }

    if (allowedMethods.length === 0) {
      setError('Please select at least one allowed HTTP method.');
      return;
    }

    const cleanedHeaderRules = headerRules
      .filter((r) => r.headerName.trim())
      .map((r) => ({
        direction: r.direction,
        action: r.action,
        headerName: r.headerName.trim(),
        headerValue: r.action === 'REMOVE' ? null : r.headerValue.trim() || null,
      }));

    const body = {
      routeId: routeId.trim(),
      name: name.trim(),
      pathPattern: pathPattern.trim(),
      targetBaseUrl: targetBaseUrl.trim(),
      targetPathPrefix: targetPathPrefix.trim() || '/',
      requestsPerMinute: requestsPerMinute ? parseInt(requestsPerMinute, 10) : null,
      responseTimeoutMs: parseInt(responseTimeoutMs, 10) || 3000,
      idempotencyEnabled,
      active,
      allowedMethods,
      headerRules: cleanedHeaderRules,
    };

    setSubmitting(true);
    setError(null);
    try {
      if (route?.id) {
        await updateTenantRoute(route.id, body);
        toast('Route updated', `${routeId} saved with a new configuration version.`);
      } else {
        await createTenantRoute(body);
        toast('Route created', `${routeId} provisioned and ready on gateway.`);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save route configuration.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="GATEWAY CONFIGURATION"
      title={route ? 'Edit route' : 'New route'}
      wide
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          {error && <div className="form-error">{error}</div>}

          {/* Section 1: Route Identity */}
          <div className="form-section">
            <h3 className="form-section-title">Route identity</h3>
            <div className="form-grid">
              <label className="field">
                <span>Route ID</span>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. orders"
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  disabled={Boolean(route)}
                  required
                />
                <small>Immutable unique identifier for the route.</small>
              </label>

              <label className="field">
                <span>Display Name</span>
                <input
                  type="text"
                  maxLength={200}
                  placeholder="e.g. Orders Management API"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>

              <label className="field form-span-2">
                <span>Public Path Pattern</span>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="/tenant-slug/orders/**"
                  value={pathPattern}
                  onChange={(e) => setPathPattern(e.target.value)}
                  required
                />
                <small>The URL pattern intercepted by the Smart Gateway data plane.</small>
              </label>

              <label className="field">
                <span>Target Base URL</span>
                <input
                  type="url"
                  maxLength={1000}
                  placeholder="http://localhost:8093"
                  value={targetBaseUrl}
                  onChange={(e) => setTargetBaseUrl(e.target.value)}
                  required
                />
              </label>

              <label className="field">
                <span>Target Path Prefix</span>
                <input
                  type="text"
                  maxLength={500}
                  placeholder="/orders"
                  value={targetPathPrefix}
                  onChange={(e) => setTargetPathPrefix(e.target.value)}
                  required
                />
              </label>
            </div>
          </div>

          {/* Section 2: Policies */}
          <div className="form-section">
            <h3 className="form-section-title">Policies & Traffic Control</h3>
            <div className="form-grid form-grid-three">
              <label className="field">
                <span>Rate Limit (req/min)</span>
                <input
                  type="number"
                  min="1"
                  placeholder="e.g. 100 (unlimited if empty)"
                  value={requestsPerMinute}
                  onChange={(e) => setRequestsPerMinute(e.target.value)}
                />
              </label>

              <label className="field">
                <span>Timeout (ms)</span>
                <input
                  type="number"
                  min="1"
                  placeholder="3000"
                  value={responseTimeoutMs}
                  onChange={(e) => setResponseTimeoutMs(e.target.value)}
                  required
                />
              </label>

              <div className="field">
                <span>Allowed HTTP Methods</span>
                <div className="method-chips" style={{ marginTop: 2 }}>
                  {HTTP_METHODS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className={`method-chip ${allowedMethods.includes(m) ? 'selected' : ''}`}
                      onClick={() => toggleMethod(m)}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <label className="switch-row form-span-3">
                <span>
                  <strong>Idempotency Protection</strong>
                  <small>Enforce idempotency headers to prevent duplicate POST/PUT operations.</small>
                </span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={idempotencyEnabled}
                    onChange={(e) => setIdempotencyEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </label>

              <label className="switch-row form-span-3">
                <span>
                  <strong>Active in Gateway</strong>
                  <small>When enabled, gateway immediately loads route rules into memory.</small>
                </span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </label>
            </div>
          </div>

          {/* Section 3: Header Rules */}
          <div className="form-section">
            <div className="form-section-title">
              <div>
                <span>Header transformations</span>
                <p className="muted" style={{ fontSize: 12, fontWeight: 'normal', marginTop: 2 }}>
                  Inject or strip request and response headers at the gateway boundary.
                </p>
              </div>
              <button
                type="button"
                className="button button-quiet"
                style={{ minHeight: 32, padding: '4px 10px', fontSize: 12 }}
                onClick={addHeaderRule}
              >
                <Plus size={14} />
                <span>Add rule</span>
              </button>
            </div>

            {headerRules.length === 0 ? (
              <p className="muted" style={{ fontSize: 12, fontStyle: 'italic' }}>
                No header rules configured. Traffic will pass default headers unchanged.
              </p>
            ) : (
              <div className="rules-list">
                {headerRules.map((rule, idx) => (
                  <div key={idx} className="rule-row">
                    <select
                      value={rule.direction}
                      onChange={(e) => updateHeaderRule(idx, 'direction', e.target.value)}
                      aria-label="Direction"
                    >
                      <option value="REQUEST">Request</option>
                      <option value="RESPONSE">Response</option>
                    </select>

                    <select
                      value={rule.action}
                      onChange={(e) => updateHeaderRule(idx, 'action', e.target.value)}
                      aria-label="Action"
                    >
                      <option value="ADD">Add</option>
                      <option value="REMOVE">Remove</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Header Name"
                      maxLength={200}
                      value={rule.headerName}
                      onChange={(e) => updateHeaderRule(idx, 'headerName', e.target.value)}
                      required
                    />

                    <input
                      type="text"
                      placeholder={rule.action === 'REMOVE' ? 'N/A' : 'Header Value'}
                      maxLength={2000}
                      value={rule.headerValue}
                      disabled={rule.action === 'REMOVE'}
                      onChange={(e) => updateHeaderRule(idx, 'headerValue', e.target.value)}
                    />

                    <button
                      type="button"
                      className="icon-btn"
                      onClick={() => removeHeaderRule(idx)}
                      title="Remove rule"
                    >
                      <Trash2 size={14} style={{ color: 'var(--red)' }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="modal-actions">
          <button type="button" className="button button-quiet" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="button button-primary" disabled={submitting}>
            {submitting ? 'Saving...' : route ? 'Save route changes' : 'Create route'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
