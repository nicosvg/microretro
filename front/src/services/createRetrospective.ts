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
    alert('Failed to create retrospective');
  }
}
