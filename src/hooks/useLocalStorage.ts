import { useState, useEffect, useCallback } from 'react';

const EVENT_NAME = 'local-storage-change';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  const read = useCallback((): T => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const [storedValue, setStoredValue] = useState<T>(read);

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: { key } }));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as { key?: string } | undefined;
      if (detail?.key && detail.key !== key) return;
      setStoredValue(read());
    };
    window.addEventListener(EVENT_NAME, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(EVENT_NAME, handler);
      window.removeEventListener('storage', handler);
    };
  }, [key, read]);

  return [storedValue, setStoredValue];
}
