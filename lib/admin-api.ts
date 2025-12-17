/**
 * Helper para chamadas autenticadas à API admin
 */

export async function adminFetch(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : null;

  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  headers.set('Content-Type', 'application/json');

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Se receber 401 e não estiver na página de login, redirecionar
  if (response.status === 401) {
    if (typeof window !== 'undefined' && !window.location.pathname.endsWith('/admin')) {
      console.warn('[adminFetch] Token inválido ou expirado, redirecionando para login');
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      window.location.href = '/admin';
    }
  }

  return response;
}
