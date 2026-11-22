import React, { useState } from 'react';
import { Search, RefreshCw, History, Shield, Eye } from 'lucide-react';
import EmptyState from '../common/EmptyState';
import Modal from '../common/Modal';

export default function AuditLog({ audits, loading, onRefresh }) {
  const [search, setSearch] = useState('');
  const [selectedAudit, setSelectedAudit] = useState(null);

  const filtered = audits.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      a.action?.toLowerCase().includes(q) ||
      a.resourceType?.toLowerCase().includes(q) ||
      a.resourceId?.toLowerCase().includes(q) ||
      a.actor?.toLowerCase().includes(q) ||
      a.correlationId?.toLowerCase().includes(q)
    );
  });

  const formatDateTime = (val) => {
    if (!val) return '—';
    try {
      return new Intl.DateTimeFormat(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).format(new Date(val));
    } catch {
      return val;
    }
  };

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">OPERATOR HISTORY</p>
          <h1>Audit records</h1>
          <p className="muted">
            A chronological and immutable audit log of control-plane operations and gateway mutations.
          </p>
        </div>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search action, actor, resource or correlation ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className="button button-quiet"
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={History}
            title={audits.length === 0 ? 'No audit records' : 'No matching audit records'}
            description={
              audits.length === 0
                ? 'Mutations made to routes or organizations will appear here with correlation IDs.'
                : 'Try adjusting your search query.'
            }
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Resource</th>
                  <th>Actor</th>
                  <th>Result</th>
                  <th>Correlation ID</th>
                  <th>Time</th>
                  <th style={{ textAlign: 'right' }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((audit) => (
                  <tr key={audit.id}>
                    <td>
                      <div className="cell-primary">
                        <strong>{audit.action}</strong>
                        <small>{audit.durationMs != null ? `${audit.durationMs} ms` : '—'}</small>
                      </div>
                    </td>
                    <td>
                      <div className="cell-primary">
                        <strong>{audit.resourceType}</strong>
                        <small>{audit.resourceId || '—'}</small>
                      </div>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: '12px' }}>
                        {audit.actor}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          audit.result === 'SUCCESS' ? 'status-active' : 'status-inactive'
                        }`}
                      >
                        <i aria-hidden="true" />
                        {audit.result}
                      </span>
                    </td>
                    <td className="cell-secondary" title={audit.correlationId}>
                      {audit.correlationId
                        ? `${audit.correlationId.slice(0, 14)}...`
                        : '—'}
                    </td>
                    <td className="cell-secondary">{formatDateTime(audit.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        type="button"
                        className="button button-quiet"
                        style={{ minHeight: 30, padding: '4px 8px', fontSize: 11 }}
                        onClick={() => setSelectedAudit(audit)}
                      >
                        <Eye size={12} />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={Boolean(selectedAudit)}
        onClose={() => setSelectedAudit(null)}
        eyebrow="AUDIT RECORD INSPECTION"
        title={selectedAudit ? `${selectedAudit.action} Details` : ''}
        wide
      >
        {selectedAudit && (
          <div className="modal-body">
            <div className="profile-details">
              <div>
                <span>ACTION</span>
                <strong>{selectedAudit.action}</strong>
              </div>
              <div>
                <span>RESOURCE</span>
                <strong>
                  {selectedAudit.resourceType} ({selectedAudit.resourceId})
                </strong>
              </div>
              <div>
                <span>ACTOR</span>
                <strong>{selectedAudit.actor}</strong>
              </div>
              <div>
                <span>RESULT</span>
                <strong>{selectedAudit.result}</strong>
              </div>
              <div>
                <span>CORRELATION ID</span>
                <strong className="mono" style={{ fontSize: 12 }}>
                  {selectedAudit.correlationId || '—'}
                </strong>
              </div>
              <div>
                <span>EXECUTION DURATION</span>
                <strong>{selectedAudit.durationMs} ms</strong>
              </div>
              <div>
                <span>RECORD TIMESTAMP</span>
                <strong>{formatDateTime(selectedAudit.createdAt)}</strong>
              </div>
            </div>

            {selectedAudit.details && (
              <div>
                <span className="eyebrow">PAYLOAD DETAILS</span>
                <pre className="json-viewer" style={{ marginTop: 6 }}>
                  {selectedAudit.details}
                </pre>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="button button-primary"
            onClick={() => setSelectedAudit(null)}
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
}
