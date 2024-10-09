export async function createCard(boardId: string, text: string, column: number): Promise<string> {
  const response = await fetch(`http://localhost:3000/boards/${boardId}/cards`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ text, column, boardId })
  });
  if (response.ok) {
    const data = await response.json();
    return data.cardId;
  } else {
    throw new Error('Failed to create card');
  }
}
