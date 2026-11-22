import { request } from './client';

export async function getOrganizations() {
  return await request('/api/platform/organizations');
}

export async function getOrganization(id) {
  return await request(`/api/platform/organizations/${id}`);
}

export async function createOrganization(data) {
  return await request('/api/platform/organizations', {
    method: 'POST',
    body: {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
    },
  });
}

export async function updateOrganization(id, data) {
  return await request(`/api/platform/organizations/${id}`, {
    method: 'PUT',
    body: {
      name: data.name.trim(),
      slug: data.slug.trim().toLowerCase(),
    },
  });
}

export async function updateOrganizationStatus(id, status) {
  return await request(`/api/platform/organizations/${id}/status`, {
    method: 'PATCH',
    body: { status },
  });
}

export async function deleteOrganization(id) {
  return await request(`/api/platform/organizations/${id}`, {
    method: 'DELETE',
  });
}

export async function getTenantAdmin(organizationId) {
  return await request(`/api/platform/organizations/${organizationId}/tenant-admin`, {
    allow404: true,
  });
}

export async function createTenantAdmin(organizationId, data) {
  return await request(`/api/platform/organizations/${organizationId}/tenant-admin`, {
    method: 'POST',
    body: {
      username: data.username.trim(),
      password: data.password,
      enabled: data.enabled ?? true,
    },
  });
}

export async function updateTenantAdmin(organizationId, data) {
  const body = {
    username: data.username.trim(),
    enabled: data.enabled ?? true,
  };
  if (data.password) {
    body.password = data.password;
  }
  return await request(`/api/platform/organizations/${organizationId}/tenant-admin`, {
    method: 'PUT',
    body,
  });
}

export async function deleteTenantAdmin(organizationId) {
  return await request(`/api/platform/organizations/${organizationId}/tenant-admin`, {
    method: 'DELETE',
  });
}
