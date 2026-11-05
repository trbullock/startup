async function authRequest(path, method = 'GET', body) {
  const response = await fetch(`/api/auth/${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (response.status === 204) {
    return null;
  }

  const result = await response.json();
  if (!response.ok) {
    const error = new Error(result.msg || 'Authentication request failed.');
    error.status = response.status;
    throw error;
  }

  return result;
}

export async function getCurrentUser() {
  try {
    return await authRequest('me');
  } catch (error) {
    if (error.status === 401) {
      return null;
    }
    throw error;
  }
}

export function createAccount(account) {
  return authRequest('create', 'POST', account);
}

export function signIn(email, password) {
  return authRequest('login', 'POST', { email, password });
}

export function signOut() {
  return authRequest('logout', 'DELETE');
}