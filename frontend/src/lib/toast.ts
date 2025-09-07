export type ToastType = "info" | "success" | "error";
export type ToastItem = { id: number; message: string; type: ToastType };

type Listener = (t: ToastItem) => void;

let listeners: Listener[] = [];
let nextId = 1;

export function toast(message: string, type: ToastType = "info") {
  const item: ToastItem = { id: nextId++, message, type };
  listeners.forEach((l) => l(item));
}

export function onToast(l: Listener) {
  listeners.push(l);
  return () => {
    listeners = listeners.filter((x) => x !== l);
  };
}
