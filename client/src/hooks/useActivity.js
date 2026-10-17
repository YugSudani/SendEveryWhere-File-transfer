import { useCallback, useEffect, useState } from 'react';
import {
  ACTIVITY_EVENT,
  bucketActivityByDay,
  clearActivity as clearStore,
  loadActivity,
  summarizeActivity,
} from '../utils/activity.js';

export function useActivity() {
  const [entries, setEntries] = useState(() => loadActivity());

  useEffect(() => {
    function refresh() {
      setEntries(loadActivity());
    }
    window.addEventListener(ACTIVITY_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(ACTIVITY_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const clear = useCallback(() => {
    clearStore();
    setEntries([]);
  }, []);

  return {
    entries,
    summary: summarizeActivity(entries),
    daily: bucketActivityByDay(entries, 7),
    clear,
  };
}
