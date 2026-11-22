import { request, saveSession, clearSession } from './client';

export async function loginApi(username, password) {
  const response = await request('/api/auth/login', {
    method: 'POST',
    body: { username, password },
    publicRequest: true,
  });

  if (response.role !== 'PLATFORM_ADMIN' && response.role !== 'TENANT_ADMIN') {
    throw new Error('This panel supports platform and tenant administrators only.');
  }

  const session = {
    token: response.token,
    username,
    role: response.role,
    organizationId: response.organizationId,
    tokenType: response.tokenType,
    expiresInSeconds: response.expiresInSeconds,
  };

  saveSession(session);
  return session;
}

export function logoutApi() {
  clearSession();
}
