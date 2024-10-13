import type { Board } from "$lib/domain/board";

export async function getBoard(id: string): Promise<Board> {
  const response = await fetch(`http://localhost:3000/boards/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
  });
  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error('Failed to get board');
  }
}
