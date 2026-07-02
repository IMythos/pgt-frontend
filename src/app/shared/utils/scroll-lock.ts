export function scrollLock(lock: boolean): void {
  document.body.style.overflow = lock ? 'hidden' : 'auto';
}
