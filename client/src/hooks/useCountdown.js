import { useEffect, useState } from 'react';

export function useCountdown(expiresAt) {
  const [remaining, setRemaining] = useState(() => {
    if (!expiresAt) return 0;
    return new Date(expiresAt).getTime() - Date.now();
  });

  useEffect(() => {
    if (!expiresAt) return undefined;
    const tick = () => {
      setRemaining(new Date(expiresAt).getTime() - Date.now());
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [expiresAt]);

  return { remaining: Math.max(0, remaining), expired: remaining <= 0 };
}
