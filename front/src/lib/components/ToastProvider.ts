import { getToastStore } from "@skeletonlabs/skeleton";

export function handleError(error: Error) {
  const toastStore = getToastStore();
  toastStore.trigger({ message: error.message });
}

export function showToast(message: string) {
  const toastStore = getToastStore();
  toastStore.trigger({ message: message });
  console.log('show toast', message);
}
