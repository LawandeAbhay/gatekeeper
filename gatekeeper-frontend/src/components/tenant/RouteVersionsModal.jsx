import React, { useState, useEffect } from 'react';
import { History, Copy, Check, Clock } from 'lucide-react';
import Modal from '../common/Modal';
import { getRouteVersions } from '../../api/tenant';
import { useToast } from '../../context/ToastContext';

export default function RouteVersionsModal({ isOpen, onClose, route }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !route?.routeId) return;
    let isMounted = true;
    setLoading(true);

    getRouteVersions(route.routeId)
      .then((data) => {
        if (!isMounted) return;
        setVersions(data || []);
      })
      .catch((err) => {
        if (isMounted) toast('Could not load versions', err.message, true);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, route, toast]);

  const handleCopyJson = (id, jsonString) => {
    try {
      const formatted = JSON.stringify(JSON.parse(jsonString), null, 2);
      navigator.clipboard.writeText(formatted);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      toast('Copied', 'Configuration snapshot copied to clipboard.');
    } catch {
      navigator.clipboard.writeText(jsonString);
    }
  };

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

  const formatJson = (raw) => {
    try {
      return JSON.stringify(JSON.parse(raw), null, 2);
    } catch {
      return raw;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="CONFIGURATION HISTORY"
      title={`${route?.routeId || 'Route'} versions`}
      wide
    >
      <div className="modal-body">
        {loading ? (
          <div style={{ padding: '36px 0', textAlign: 'center' }} className="muted">
            Loading route history timeline...
          </div>
        ) : versions.length === 0 ? (
          <div className="empty-state">
            <History size={28} className="muted" />
            <strong>No version history found</strong>
            <span>This route has no recorded revisions yet.</span>
          </div>
        ) : (
          <div className="timeline">
            {versions.map((ver) => (
              <article key={ver.id} className="timeline-item">
                <div className="timeline-content">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3>
                      Version {ver.versionNumber} · <span className="mono">{ver.changeType}</span>
                    </h3>
                    <span className="role-badge" style={{ fontSize: '10px' }}>
                      v{ver.versionNumber}
                    </span>
                  </div>

                  <p>
                    <Clock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    {formatDateTime(ver.createdAt)}
                  </p>

                  <div style={{ marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="eyebrow" style={{ margin: 0 }}>SNAPSHOT PAYLOAD</span>
                      <button
                        type="button"
                        className="button button-quiet"
                        style={{ minHeight: 28, padding: '4px 8px', fontSize: 11 }}
                        onClick={() => handleCopyJson(ver.id, ver.configurationSnapshot)}
                      >
                        {copiedId === ver.id ? (
                          <>
                            <Check size={12} style={{ color: 'var(--green)' }} />
                            <span>Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="json-viewer">{formatJson(ver.configurationSnapshot)}</pre>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      <div className="modal-actions">
        <button type="button" className="button button-primary" onClick={onClose}>
          Done
        </button>
      </div>
    </Modal>
  );
}
