import type { Board } from '@domain/board';
import { apiFetch } from './api';

export async function getBoard(id: string): Promise<Board> {
	const response = await apiFetch(`/boards/${id}`, {
		method: 'GET'
	});
	if (response.ok) {
		const data = await response.json();
		return data;
	} else {
		throw new Error('Failed to get board');
	}
}
