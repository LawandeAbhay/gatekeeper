import { request } from './client';

export async function getTenantOrganization() {
  return await request('/api/tenant/organization');
}

export async function updateTenantOrganization(data) {
  return await request('/api/tenant/organization', {
    method: 'PUT',
    body: {
      name: data.name.trim(),
    },
  });
}

export async function getTenantRoutes() {
  return await request('/api/tenant/routes');
}

export async function getTenantRoute(id) {
  return await request(`/api/tenant/route/${id}`);
}

export async function createTenantRoute(data) {
  return await request('/api/tenant/route', {
    method: 'POST',
    body: data,
  });
}

export async function updateTenantRoute(id, data) {
  return await request(`/api/tenant/route/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function updateRouteStatus(id, active) {
  return await request(`/api/tenant/route/${id}/status`, {
    method: 'PATCH',
    body: { active },
  });
}

export async function deleteTenantRoute(id) {
  return await request(`/api/tenant/route/${id}`, {
    method: 'DELETE',
  });
}

export async function getRouteVersions(routeId) {
  return await request(`/api/tenant/route-versions/${encodeURIComponent(routeId)}`);
}

export async function getAuditRecords() {
  return await request('/api/tenant/audit-records');
}
