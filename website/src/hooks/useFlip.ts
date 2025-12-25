import { useState, useCallback } from 'react';

const DEFAULT_FLIP_DURATION = 500; // ms

export function useFlip(onComplete?: () => void, duration = DEFAULT_FLIP_DURATION) {
  const [isFlipped, setIsFlipped] = useState(false);

  const flip = useCallback(() => {
    setIsFlipped(true);
    if (onComplete) {
      setTimeout(onComplete, duration);
    }
  }, [onComplete, duration]);

  const unflip = useCallback((onUnflipComplete?: () => void) => {
    setIsFlipped(false);
    if (onUnflipComplete) {
      setTimeout(onUnflipComplete, duration);
    }
  }, [duration]);

  const reset = useCallback(() => {
    setIsFlipped(false);
  }, []);

  return { isFlipped, flip, unflip, reset };
}

