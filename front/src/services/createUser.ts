export async function createUser(name: string): Promise<string> {
  const response = await fetch(`http://localhost:3000/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: name })
  });
  if (response.ok) {
    const data = await response.json();
    return data.id;
  } else {
    throw new Error('Failed to create user');
  }
}
