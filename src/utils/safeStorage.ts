/**
 * Robust, cross-device safe storage utility.
 * Falls back gracefully to memory cache if localStorage is disabled, private browsing restricted,
 * quota exceeded, or running on restricted old browsers/iFrames.
 */

const memoryFallbackStore = new Map<string, string>();

export const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // localStorage restricted or unavailable (e.g. strict Safari private mode)
    }
    return memoryFallbackStore.get(key) ?? null;
  },

  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // quota exceeded or unavailable
    }
    memoryFallbackStore.set(key, value);
  },

  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
      }
    } catch {
      // ignore
    }
    memoryFallbackStore.delete(key);
  },

  clear(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }
    } catch {
      // ignore
    }
    memoryFallbackStore.clear();
  }
};
