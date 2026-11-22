import React, { useState } from 'react';
import { Search, RefreshCw, Plus, Route as RouteIcon, History, Edit2, Trash2, Power } from 'lucide-react';
import RouteModal from './RouteModal';
import RouteVersionsModal from './RouteVersionsModal';
import EmptyState from '../common/EmptyState';
import { updateRouteStatus, deleteTenantRoute } from '../../api/tenant';
import { useToast } from '../../context/ToastContext';

export default function RoutesList({
  routes,
  organization,
  loading,
  onRefresh,
}) {
  const [search, setSearch] = useState('');
  const [editingRoute, setEditingRoute] = useState(null);
  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [versionRoute, setVersionRoute] = useState(null);
  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const { toast } = useToast();

  const filtered = routes.filter((r) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      r.routeId?.toLowerCase().includes(q) ||
      r.name?.toLowerCase().includes(q) ||
      r.pathPattern?.toLowerCase().includes(q)
    );
  });

  const handleToggleStatus = async (route) => {
    try {
      await updateRouteStatus(route.id, !route.active);
      toast(
        route.active ? 'Route deactivated' : 'Route activated',
        `${route.routeId} received a new configuration version.`
      );
      onRefresh();
    } catch (err) {
      toast('Could not toggle route', err.message, true);
    }
  };

  const handleDelete = async (route) => {
    if (
      !window.confirm(
        `Delete route "${route.routeId}"? Its configuration history will remain available.`
      )
    ) {
      return;
    }
    try {
      await deleteTenantRoute(route.id);
      toast('Route deleted', `${route.routeId} removed; version history retained.`);
      onRefresh();
    } catch (err) {
      toast('Could not delete route', err.message, true);
    }
  };

  return (
    <div className="page-section">
      <div className="section-heading">
        <div>
          <p className="eyebrow">GATEWAY CONFIGURATION</p>
          <h1>Routes</h1>
          <p className="muted">
            Routing, traffic shaping, rate limits, and header transformations for {organization?.name || 'your tenant'}.
          </p>
        </div>
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            setEditingRoute(null);
            setIsRouteModalOpen(true);
          }}
        >
          <Plus size={16} />
          <span>New route</span>
        </button>
      </div>

      <div className="table-card">
        <div className="table-toolbar">
          <div className="search-wrapper">
            <Search size={16} />
            <input
              type="text"
              className="search-input"
              placeholder="Search route ID, name or path pattern..."
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
            icon={RouteIcon}
            title={routes.length === 0 ? 'No routes configured' : 'No matching routes'}
            description={
              routes.length === 0
                ? 'Create the first gateway route for this tenant to begin handling traffic.'
                : 'Try adjusting your search criteria.'
            }
            action={
              routes.length === 0 && (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={() => {
                    setEditingRoute(null);
                    setIsRouteModalOpen(true);
                  }}
                >
                  <Plus size={16} />
                  <span>Configure first route</span>
                </button>
              )
            }
          />
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Route</th>
                  <th>Public Path</th>
                  <th>Policies</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((route) => {
                  const tags = [];
                  if (route.requestsPerMinute) tags.push(`${route.requestsPerMinute}/min`);
                  if (route.idempotencyEnabled) tags.push('Idempotent');
                  if (route.headerRules?.length) tags.push(`${route.headerRules.length} headers`);
                  if (!tags.length) tags.push('Base routing');

                  return (
                    <tr key={route.id}>
                      <td>
                        <div className="cell-primary">
                          <strong>{route.name}</strong>
                          <small>
                            <span className="mono">{route.routeId}</span> ·{' '}
                            {(route.allowedMethods || []).join(', ')}
                          </small>
                        </div>
                      </td>
                      <td>
                        <span className="path-code" title={route.pathPattern}>
                          {route.pathPattern}
                        </span>
                      </td>
                      <td>
                        <div className="policy-tags">
                          {tags.map((tag, i) => (
                            <span key={i} className="policy-tag">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`status-badge ${
                            route.active ? 'status-active' : 'status-inactive'
                          }`}
                        >
                          <i aria-hidden="true" />
                          {route.active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </td>
                      <td className="cell-secondary">v{route.configurationVersion}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            type="button"
                            className="row-action"
                            onClick={() => {
                              setVersionRoute(route);
                              setIsVersionModalOpen(true);
                            }}
                            title="Inspect version snapshots"
                          >
                            <History size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Versions
                          </button>
                          <button
                            type="button"
                            className="row-action"
                            onClick={() => handleToggleStatus(route)}
                            title={route.active ? 'Deactivate route' : 'Activate route'}
                          >
                            <Power size={13} style={{ display: 'inline', marginRight: 4 }} />
                            {route.active ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            type="button"
                            className="row-action"
                            onClick={() => {
                              setEditingRoute(route);
                              setIsRouteModalOpen(true);
                            }}
                            title="Edit route policies"
                          >
                            <Edit2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="row-action danger"
                            onClick={() => handleDelete(route)}
                            title="Delete route"
                          >
                            <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <RouteModal
        isOpen={isRouteModalOpen}
        onClose={() => setIsRouteModalOpen(false)}
        route={editingRoute}
        organization={organization}
        onSaved={onRefresh}
      />

      <RouteVersionsModal
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        route={versionRoute}
      />
    </div>
  );
}
