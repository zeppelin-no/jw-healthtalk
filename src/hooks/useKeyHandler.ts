import React, { useCallback } from 'react';

export default function useKeyHandler(key: React.Key, onKey: (() => void) | undefined) {
  if (!onKey) {
    return undefined;
  }

  return useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === key) {
        onKey();
      }
    },
    [key, onKey],
  );
}
