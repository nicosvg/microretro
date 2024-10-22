import { apiFetch } from "./api";

export async function createUser(name: string): Promise<string> {
  const response = await apiFetch(`/users`, {
    method: 'POST',
    body: JSON.stringify({ name: name })
  });
  if (response.ok) {
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data.id;
  } else {
    throw new Error('Failed to create user');
  }
}
