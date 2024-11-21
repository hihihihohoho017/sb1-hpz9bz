export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
) {
  let timeout: ReturnType<typeof setTimeout> | undefined;

  const debounced = (...args: Parameters<T>) => {
    const later = () => {
      timeout = undefined;
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }
  };

  return debounced;
}