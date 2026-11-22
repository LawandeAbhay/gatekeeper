import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import {
  getTenantAdmin,
  createTenantAdmin,
  updateTenantAdmin,
  deleteTenantAdmin,
} from '../../api/platform';
import { useToast } from '../../context/ToastContext';

export default function TenantAdminModal({ isOpen, onClose, organization }) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [adminExists, setAdminExists] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [enabled, setEnabled] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!isOpen || !organization?.id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    setAdminExists(false);
    setUsername('');
    setPassword('');
    setEnabled(true);

    getTenantAdmin(organization.id)
      .then((data) => {
        if (!isMounted) return;
        if (data) {
          setAdminExists(true);
          setUsername(data.username || '');
          setEnabled(data.enabled ?? true);
        } else {
          setAdminExists(false);
          setUsername(`${organization.slug}-admin`);
          setEnabled(true);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Failed to load tenant administrator.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, organization]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    if (!adminExists && !password) {
      setError('Password is required for new administrator.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      if (adminExists) {
        await updateTenantAdmin(organization.id, {
          username,
          password: password || undefined,
          enabled,
        });
        toast('Administrator updated', `Account ${username} has been saved.`);
      } else {
        await createTenantAdmin(organization.id, {
          username,
          password,
          enabled,
        });
        toast('Administrator created', `Account ${username} can now sign in.`);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Could not save administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete tenant administrator "${username}"? This cannot be undone.`)) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await deleteTenantAdmin(organization.id);
      toast('Administrator deleted', 'The tenant administrator account has been removed.');
      onClose();
    } catch (err) {
      setError(err.message || 'Could not delete administrator.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      eyebrow="TENANT ACCESS"
      title="Tenant administrator"
    >
      <form onSubmit={handleSubmit}>
        <div className="modal-body">
          <p className="muted" style={{ marginTop: '-10px', fontSize: '13px' }}>
            {organization?.name} · <span className="mono">/{organization?.slug}</span>
          </p>

          {error && <div className="form-error">{error}</div>}

          {loading ? (
            <div style={{ padding: '24px 0', textAlign: 'center' }} className="muted">
              Loading administrator profile...
            </div>
          ) : (
            <div className="form-grid">
              <label className="field form-span-2">
                <span>Admin Username</span>
                <input
                  type="text"
                  maxLength={100}
                  placeholder="e.g. foodfast-admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </label>

              <label className="field form-span-2">
                <span>Password</span>
                <input
                  type="password"
                  minLength={adminExists ? 0 : 8}
                  maxLength={100}
                  placeholder={adminExists ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required={!adminExists}
                />
              </label>

              <label className="switch-row form-span-2">
                <span>
                  <strong>Account enabled</strong>
                  <small>Disabled users cannot authenticate to the control plane.</small>
                </span>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={(e) => setEnabled(e.target.checked)}
                  />
                  <span className="toggle-slider" />
                </label>
              </label>
            </div>
          )}
        </div>

        <div className="modal-actions split-actions">
          {adminExists ? (
            <button
              type="button"
              className="button button-danger"
              onClick={handleDelete}
              disabled={submitting || loading}
            >
              Delete administrator
            </button>
          ) : (
            <span />
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="button button-quiet"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={submitting || loading}
            >
              {submitting ? 'Saving...' : 'Save administrator'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
