import { getToastStore } from "@skeletonlabs/skeleton";

export function handleError(error: Error) {
  const toastStore = getToastStore();
  toastStore.trigger({ message: error.message });
}
