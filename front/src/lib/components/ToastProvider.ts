import { toaster } from '$lib/toaster';

export function handleError(error: Error) {
  toaster.error({ title: 'Error', description: error.message });
}

export function showToast(message: string) {
  toaster.info({ title: message });
  console.log('show toast', message);
}
