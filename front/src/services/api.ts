export const ssr = false
export async function apiFetch(path: string, options: RequestInit | undefined) {
  const token = localStorage.getItem('token');
  const response = await fetch(`http://localhost:3000${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...options
  });
  return response
}
