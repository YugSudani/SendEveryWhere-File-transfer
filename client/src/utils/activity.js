// Per-browser usage store (localStorage). Backend owns transfer limits;
// this only records successful transfers for the Activity tab.
const STORAGE_KEY = 'sendeverywhere:activity:v1';
const MAX_ENTRIES = 100;

export const ACTIVITY_EVENT = 'sendeverywhere:activity';

function safeParse(raw) {
  try {
    const value = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function loadActivity() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return safeParse(raw).filter((e) => e && typeof e.at === 'number');
  } catch {
    return [];
  }
}

function persist(entries) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)));
  } catch {
    // storage full or unavailable: keep in-memory behavior, skip persist
  }
  window.dispatchEvent(new Event(ACTIVITY_EVENT));
}

export function logTransfer({ direction, code, fileCount, totalBytes }) {
  if (direction !== 'sent' && direction !== 'received') return;
  const entry = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    direction,
    code: String(code || ''),
    fileCount: Number(fileCount) || 0,
    totalBytes: Number(totalBytes) || 0,
    at: Date.now(),
  };
  persist([entry, ...loadActivity()]);
}

export function clearActivity() {
  persist([]);
}

export function summarizeActivity(entries = []) {
  const summary = {
    sentTransfers: 0,
    receivedTransfers: 0,
    sentBytes: 0,
    receivedBytes: 0,
    sentFiles: 0,
    receivedFiles: 0,
    totalBytes: 0,
  };
  for (const e of entries) {
    summary.totalBytes += e.totalBytes || 0;
    if (e.direction === 'sent') {
      summary.sentTransfers += 1;
      summary.sentBytes += e.totalBytes || 0;
      summary.sentFiles += e.fileCount || 0;
    } else {
      summary.receivedTransfers += 1;
      summary.receivedBytes += e.totalBytes || 0;
      summary.receivedFiles += e.fileCount || 0;
    }
  }
  return summary;
}

export function bucketActivityByDay(entries = [], days = 7) {
  const now = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    buckets.push({
      key: d.toDateString(),
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      sent: 0,
      received: 0,
    });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const e of entries) {
    const bucket = byKey.get(new Date(e.at).toDateString());
    if (!bucket) continue;
    const mb = (e.totalBytes || 0) / (1024 * 1024);
    if (e.direction === 'sent') bucket.sent += mb;
    else bucket.received += mb;
  }
  return buckets.map((b) => ({
    label: b.label,
    sent: Math.round(b.sent * 100) / 100,
    received: Math.round(b.received * 100) / 100,
  }));
}
