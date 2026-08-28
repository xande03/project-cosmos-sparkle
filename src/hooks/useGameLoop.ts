import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (deltaTime: number) => void) {
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number | null>(null);
  const callbackRef = useRef(callback);

  callbackRef.current = callback;

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== null) {
        const deltaTime = Math.min((time - previousTimeRef.current) / 1000, 0.1);
        callbackRef.current(deltaTime);
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = null;
    };
  }, []);
}
