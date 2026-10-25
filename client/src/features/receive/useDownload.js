import { useState, useRef } from 'react';
import { getFileInfo, getDownloadUrl } from '../../api/files.js';
import { isValidCode } from '../../utils/validators.js';
import { logTransfer } from '../../utils/activity.js';

export function useDownload() {
  const [code, setCode] = useState('');
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Guards against double lookups when a code arrives from both a programmatic
  // set (QR scan / URL param) and the code inputs' onComplete handler.
  const loadingRef = useRef(false);

  async function lookup(nextCode) {
    const value = (nextCode ?? code).trim();
    if (!isValidCode(value)) {
      setError('Enter a 6-digit code.');
      return;
    }
    if (loadingRef.current) return;
    loadingRef.current = true;
    setLoading(true);
    setError('');
    setInfo(null);
    try {
      const data = await getFileInfo(value);
      setInfo(data);
      logTransfer({
        direction: 'received',
        code: data.code,
        fileCount: data.files?.length,
        totalBytes: data.totalSize,
      });
    } catch (err) {
      setError(err.message || 'Could not find files for this code.');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }

  function downloadUrl() {
    if (!info) return '';
    return getDownloadUrl(info.code);
  }

  function reset() {
    setCode('');
    setInfo(null);
    setError('');
  }

  return { code, setCode, info, loading, error, lookup, downloadUrl, reset };
}
