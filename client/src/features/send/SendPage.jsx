import { useRef, useState } from 'react';
import { Card } from '../../components/Card.jsx';
import { Button } from '../../components/Button.jsx';
import { ProgressBar } from '../../components/ProgressBar.jsx';
import { useUpload } from './useUpload.js';
import { useCopy } from '../../hooks/useCopy.js';
import { useCountdown } from '../../hooks/useCountdown.js';
import { formatBytes, formatCountdown } from '../../utils/formatBytes.js';

export function SendPage() {
  const { files, progress, uploading, result, error, select, clear, startUpload } =
    useUpload();
  const { copied, copy } = useCopy();
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const { remaining } = useCountdown(result?.expiresAt);

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer?.files?.length) select(e.dataTransfer.files);
  }

  return (
    <Card
      title="Send files"
      subtitle="Files expire automatically after 10 minutes."
    >
      {!result ? (
        <>
          <div
            className={`dropzone${dragging ? ' dropzone-active' : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
          >
            <p className="dropzone-title">Drag and drop files here</p>
            <p className="dropzone-sub">or click to browse</p>
            <input
              ref={inputRef}
              type="file"
              multiple
              hidden
              onChange={(e) => select(e.target.files)}
            />
          </div>

          {files.length > 0 && (
            <ul className="file-list">
              {files.map((f) => (
                <li key={`${f.name}-${f.size}`} className="file-row">
                  <span className="file-name">{f.name}</span>
                  <span className="file-size">{formatBytes(f.size)}</span>
                </li>
              ))}
            </ul>
          )}

          {uploading && <ProgressBar value={progress} label={`${progress}% uploading`} />}

          {error && <p className="error">{error}</p>}

          <div className="row">
            <Button
              variant="primary"
              disabled={files.length === 0 || uploading}
              onClick={startUpload}
              fullWidth
            >
              {uploading ? 'Uploading…' : 'Get code'}
            </Button>
            {files.length > 0 && !uploading && (
              <Button variant="secondary" onClick={clear}>
                Clear
              </Button>
            )}
          </div>
        </>
      ) : (
        <div className="result">
          <p className="result-label">Share this code with the receiver:</p>
          <p className="result-code">{result.code}</p>
          <p className="countdown">Expires in {formatCountdown(remaining)}</p>
          <div className="row">
            <Button variant="primary" onClick={() => copy(result.code)}>
              {copied ? 'Copied' : 'Copy code'}
            </Button>
            <Button variant="secondary" onClick={clear}>
              Send more
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
