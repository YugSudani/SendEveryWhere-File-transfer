import React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useActivity } from '../../hooks/useActivity.js';
import { useTheme } from '../../hooks/useTheme.js';
import { formatBytes } from '../../utils/formatBytes.js';

function StatCard({ label, value, sub }) {
  return (
    <div className="activity-stat">
      <span className="activity-stat-label">{label}</span>
      <span className="activity-stat-value">{value}</span>
      {sub ? <span className="activity-stat-sub">{sub}</span> : null}
    </div>
  );
}

export function ActivityPanel() {
  const { entries, summary, daily, clear } = useActivity();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const gridColor = isDark ? '#292524' : '#E7E5E4';
  const tickColor = isDark ? '#A8A29E' : '#78716C';
  const sentColor = isDark ? '#FB923C' : '#C2410C';
  const totalTransfers = summary.sentTransfers + summary.receivedTransfers;

  if (entries.length === 0) {
    return (
      <div className="sendora-card activity-card">
        <div className="receive-header">
          <h2 className="receive-title">Transfer Activity</h2>
          <p className="receive-sub">
            Your send and receive history will appear here. Stored only in
            this browser.
          </p>
        </div>
        <div className="activity-empty">
          <p>No transfers yet. Send or receive files to see usage.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="sendora-card activity-card">
      <div className="receive-header">
        <h2 className="receive-title">Transfer Activity</h2>
        <p className="receive-sub">
          Stored only in this browser. Clearing wipes local history.
        </p>
      </div>

      <div className="activity-stats">
        <StatCard
          label="Sent"
          value={formatBytes(summary.sentBytes)}
          sub={`${summary.sentTransfers} transfers · ${summary.sentFiles} files`}
        />
        <StatCard
          label="Received"
          value={formatBytes(summary.receivedBytes)}
          sub={`${summary.receivedTransfers} transfers · ${summary.receivedFiles} files`}
        />
        <StatCard label="Transfers" value={String(totalTransfers)} sub="total this browser" />
        <StatCard
          label="Bandwidth"
          value={formatBytes(summary.totalBytes)}
          sub="sent + received"
        />
      </div>

      <h4 className="activity-section-title">Bandwidth — last 7 days (MB)</h4>
      <div className="activity-chart-wrap">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={daily} margin={{ top: 4, right: 4, bottom: 0, left: -12 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke={tickColor} />
            <YAxis tick={{ fontSize: 11 }} stroke={tickColor} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 12, color: tickColor }} />
            <Bar dataKey="sent" name="Sent (MB)" fill={sentColor} radius={[3, 3, 0, 0]} />
            <Bar dataKey="received" name="Received (MB)" fill="#16a34a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="activity-history-head">
        <h4 className="activity-section-title">Recent transfers</h4>
        <button type="button" className="btn-clear-side" onClick={clear}>
          Clear history
        </button>
      </div>
      <ul className="activity-history">
        {entries.slice(0, 20).map((e) => (
          <li key={e.id} className="activity-row">
            <span className={`activity-badge ${e.direction}`}>
              {e.direction === 'sent' ? 'Sent' : 'Received'}
            </span>
            <span className="activity-code">{e.code || '—'}</span>
            <span className="activity-meta">
              {e.fileCount} {e.fileCount === 1 ? 'file' : 'files'} ·{' '}
              {formatBytes(e.totalBytes)}
            </span>
            <span className="activity-date">
              {new Date(e.at).toLocaleString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
