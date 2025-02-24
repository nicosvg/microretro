import { handleError } from "$lib/components/ToastProvider";
import { apiFetch } from "./api";

export async function createRetrospective(columns: string[]) {
  const response = await apiFetch('/boards', {
    method: 'POST',
    body: JSON.stringify({ columns }),
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
