import { apiFetch } from "./api";

export async function joinBoard(id: string): Promise<void> {
  const response = await apiFetch(`/api/boards/${id}/join`, {
    method: 'POST',
  });
  if (response.ok) {
    console.log('joined board');
  } else {
    throw new Error('Failed to join board');
  }
}
