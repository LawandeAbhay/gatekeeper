import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Building2, UserCog, Edit2, Trash2 } from 'lucide-react';
import OrganizationModal from './OrganizationModal';
import TenantAdminModal from './TenantAdminModal';
import EmptyState from '../common/EmptyState';
import { updateOrganizationStatus, deleteOrganization } from '../../api/platform';
import { useToast } from '../../context/ToastContext';

export default function OrganizationsList({
  organizations,
  loading,
  onRefresh,
}) {
  const [search, setSearch] = useState('');
  const [editingOrg, setEditingOrg] = useState(null);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [adminOrg, setAdminOrg] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const { toast } = useToast();

  const filtered = organizations.filter((org) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      org.name?.toLowerCase().includes(q) ||
      org.slug?.toLowerCase().includes(q) ||
      String(org.id).includes(q)
    );
  });

  const handleStatusChange = async (org, newStatus) => {
    const prevStatus = org.status;
    try {
      await updateOrganizationStatus(org.id, newStatus);
      toast('Status updated', `${org.name} is now ${newStatus.toLowerCase()}.`);
      onRefresh();
    } catch (err) {
      toast('Could not update status', err.message, true);
    }
  };

  const handleDelete = async (org) => {
    if (
      !window.confirm(
        `Soft-delete organization "${org.name}"? Its tenant administrator will no longer be able to log in.`
      )
    ) {
      return;
    }
    try {
      await deleteOrganization(org.id);
      toast('Organization deleted', `${org.name} was soft-deleted.`);
      onRefresh();
    } catch (err) {
      toast('Could not delete organization', err.message, true);
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

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">TENANT DIRECTORY</p>
          <h1>Organizations</h1>
          <p className="muted">
            Provision tenants, control lifecycle status, and manage their administrators.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            setEditingOrg(null);
            setIsOrgModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New organization</span>
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search by name, slug or ID..."
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
            icon={Building2}
            title={organizations.length === 0 ? 'No organizations yet' : 'No matching organizations'}
            description={
              organizations.length === 0
                ? 'Create FoodFast or QuickShop to begin routing traffic.'
                : 'Try adjusting your search query.'
            }
            action={
              organizations.length === 0 && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    setEditingOrg(null);
                    setIsOrgModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Create first organization</span>
                </button>
              )
            }
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Organization</th>
                  <th>Route Prefix Slug</th>
                  <th>Status</th>
                  <th>Provisioned</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((org) => (
                  <tr key={org.id}>
                    <td>
                      <div className="cell-primary">
                        <strong>{org.name}</strong>
                        <small>TENANT ID #{org.id}</small>
                      </div>
                    </td>
                    <td>
                      <span className="path-code">/{org.slug}</span>
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={org.status}
                        onChange={(e) => handleStatusChange(org, e.target.value)}
                      >
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="PENDING">PENDING</option>
                        <option value="SUSPENDED">SUSPENDED</option>
                      </select>
                    </td>
                    <td className="cell-secondary">{formatDate(org.createdAt)}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          className="row-action"
                          onClick={() => {
                            setAdminOrg(org);
                            setIsAdminModalOpen(true);
                          }}
                          title="Manage Tenant Administrator"
                        >
                          <UserCog size={13} style={{ display: 'inline', marginRight: 4 }} />
                          Admin
                        </button>
                        <button
                          type="button"
                          className="row-action"
                          onClick={() => {
                            setEditingOrg(org);
                            setIsOrgModalOpen(true);
                          }}
                          title="Edit organization"
                        >
                          <Edit2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                          Edit
                        </button>
                        <button
                          type="button"
                          className="row-action danger"
                          onClick={() => handleDelete(org)}
                          title="Soft delete organization"
                        >
                          <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <OrganizationModal
        isOpen={isOrgModalOpen}
        onClose={() => setIsOrgModalOpen(false)}
        organization={editingOrg}
        onSaved={onRefresh}
      />

      <TenantAdminModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        organization={adminOrg}
      />
    </div>
  );
}
