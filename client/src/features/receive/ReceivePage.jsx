import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { CodeInput } from '../../components/CodeInput.jsx';
import { useDownload } from './useDownload.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { formatBytes, formatCountdown } from '../../utils/formatBytes.js';

export function ReceivePage() {
  const { code, setCode, info, loading, error, lookup, downloadUrl } =
    useDownload();
  const { remaining } = useCountdown(info?.expiresAt);

  return (
    <Card title="Receive files" subtitle="Enter the 6-digit code to download.">
      <form
        className="receive-form"
        onSubmit={(e) => {
          e.preventDefault();
          lookup();
        }}
      >
        <label htmlFor="code" className="field-label">
          6-digit code
        </label>
        <CodeInput value={code} onChange={setCode} disabled={loading} />
        <Button type="submit" variant="primary" disabled={loading} fullWidth>
          {loading ? 'Looking up…' : 'Find files'}
        </Button>
      </form>

      {error && <p className="error">{error}</p>}

      {info && (
        <div className="result">
          <p className="countdown">Expires in {formatCountdown(remaining)}</p>
          <ul className="file-list">
            {info.files.map((f) => (
              <li key={`${f.name}-${f.size}`} className="file-row">
                <span className="file-name">{f.name}</span>
                <span className="file-size">{formatBytes(f.size)}</span>
              </li>
            ))}
          </ul>
          <p className="total">Total: {formatBytes(info.totalSize)}</p>
          <a className="btn btn-primary btn-full" href={downloadUrl()}>
            Download{info.files.length > 1 ? ' as ZIP' : ''}
          </a>
        </div>
      )}
    </Card>
  );
}
