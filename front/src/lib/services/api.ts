import { PUBLIC_API_URL } from '$env/static/public';

const apiUrl = PUBLIC_API_URL;

export async function apiFetch(path: string, options: RequestInit | undefined) {
	const token = localStorage.getItem('token');
	const response = await fetch(`${apiUrl}${path}`, {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`
		},
		...options
	});
	return response;
}
