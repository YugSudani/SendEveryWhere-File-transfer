import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { CloseIcon } from './Icons.jsx';

// Maps raw scanner errors to short, friendly guidance for the user.
function friendlyCameraError(err) {
  const name = err?.name || err?.type || '';
  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'Camera access was blocked. Allow camera permission and retry, or enter the 6-digit code manually.';
  }
  if (name === 'NotFoundError' || name === 'OverconstrainedError') {
    return 'No usable camera was found on this device. Enter the 6-digit code manually.';
  }
  if (name === 'NotReadableError') {
    return 'The camera looks busy in another app or tab. Close it and retry, or enter the 6-digit code manually.';
  }
  return 'Could not start the camera. Enter the 6-digit code manually.';
}

/**
 * Fullscreen camera modal for scanning the sender's QR code.
 * Uses the rear camera, shows a friendly message when permissions fail,
 * and reports the decoded value via onResult. Requires HTTPS (or localhost).
 */
export function QRScannerModal({ onResult, onClose }) {
  const [error, setError] = useState('');

  return (
    <div className="qr-scanner-backdrop" role="dialog" aria-modal="true" aria-label="Scan QR code">
      <div className="qr-scanner-stage">
        <Scanner
          constraints={{ facingMode: 'environment' }}
          onScan={(res) => res?.[0] && onResult(res[0].rawValue)}
          onError={(e) => setError(friendlyCameraError(e))}
          paused={Boolean(error)}
          classNames={{ container: 'qr-scanner-container', video: 'qr-scanner-video' }}
        />

        {error && <div className="qr-scanner-error">{error}</div>}

        <div className="qr-scanner-frame" aria-hidden="true" />

        <button type="button" className="qr-scanner-cancel" onClick={onClose}>
          <CloseIcon size={16} color="#ffffff" />
          <span>Cancel</span>
        </button>
      </div>
    </div>
  );
}
