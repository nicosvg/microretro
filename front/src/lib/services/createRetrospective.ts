import { handleError } from "$lib/components/ToastProvider";
import { apiFetch } from "./api";

export async function createRetrospective(columnNames?: string[]) {
  const response = await apiFetch('/api/boards', {
    method: 'POST',
    body: JSON.stringify({ columnNames }),
  });
  if (response.ok) {
    const data = await response.json();
    return data.id;
  } else {
    console.error('Failed to create board', response);
    handleError(new Error('Failed to create board'));
    return null
  }
}
