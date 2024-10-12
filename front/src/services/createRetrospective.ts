import { handleError } from "$lib/components/ErrorHandler";

export async function createRetrospective() {
  const response = await fetch('http://localhost:3000/boards', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  });
  if (response.ok) {
    const data = await response.json();
    return data.id;
  } else {
    handleError(new Error('Failed to create board'));
    return null
  }
}
