import { useState } from 'react';
import { uploadFiles } from '../../api/files.js';
import { logTransfer } from '../../utils/activity.js';

export function useUpload() {
  const [files, setFiles] = useState([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function select(newFiles) {
    const list = Array.from(newFiles || []);
    if (list.length === 0) return;
    setError('');
    setResult(null);
    setFiles(list);
    setProgress(0);
  }

  function appendFiles(newFiles) {
    const list = Array.from(newFiles || []);
    if (list.length === 0) return;
    setError('');
    setResult(null);
    setFiles((prev) => [...prev, ...list]);
    setProgress(0);
  }

  function removeFile(index) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function clear() {
    setFiles([]);
    setProgress(0);
    setResult(null);
    setError('');
  }

  async function startUpload() {
    if (files.length === 0 || uploading) return;
    setUploading(true);
    setError('');
    setProgress(0);
    try {
      const data = await uploadFiles(files, setProgress);
      setResult(data);
      logTransfer({
        direction: 'sent',
        code: data.code,
        fileCount: data.files?.length ?? files.length,
        totalBytes: data.totalSize,
      });
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  }

  return { files, progress, uploading, result, error, select, appendFiles, removeFile, clear, startUpload };
}
