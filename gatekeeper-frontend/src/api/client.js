// Centralized API client with automatic JWT bearer token, correlation ID, and error handling

const SESSION_KEY = 'gatekeeper-control-plane-session';

export function getStoredSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveSession(session) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

function generateCorrelationId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `ui-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

export async function request(path, options = {}) {
  const session = getStoredSession();
  const headers = {
    Accept: 'application/json',
    ...(options.headers || {}),
  };

  if (options.body !== undefined && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (!options.publicRequest && session?.token) {
    headers.Authorization = `Bearer ${session.token}`;
  }

  const method = options.method || 'GET';
  if (method !== 'GET') {
    headers['X-Correlation-ID'] = options.correlationId || generateCorrelationId();
  }

  const response = await fetch(path, {
    method,
    headers,
    body:
      options.body === undefined
        ? undefined
        : options.body instanceof FormData
        ? options.body
        : JSON.stringify(options.body),
  });

  if (response.status === 401 && !options.publicRequest) {
    clearSession();
    window.dispatchEvent(new CustomEvent('gatekeeper:session-expired'));
    throw new Error('Your session has expired. Please sign in again.');
  }

  if (response.status === 404 && options.allow404) {
    return null;
  }

  if (response.status === 204) {
    return null;
  }

  let data = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    let message = data?.message || `Request failed with status ${response.status}`;
    if (data?.errors) {
      const details = Object.entries(data.errors)
        .map(([field, err]) => `${field}: ${err}`)
        .join(' · ');
      if (details) {
        message += ` — ${details}`;
      }
    }
    const err = new Error(message);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}
