import { useState, useRef } from 'react';
import { uploadFiles } from '../../api/files.js';
import { validateSelectedFiles } from '../../utils/validators.js';
import { logTransfer } from '../../utils/activity.js';

export function useUpload() {
  const [files, setFiles] = useState([]);
  // Mirror of `files` so append/remove can validate against the whole batch.
  const filesRef = useRef([]);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  function setFileList(list) {
    filesRef.current = list;
    setFiles(list);
  }

  function select(newFiles) {
    const list = Array.from(newFiles || []);
    if (list.length === 0) return;
    const message = validateSelectedFiles(list);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setResult(null);
    setProgress(0);
    setFileList(list);
  }

  function appendFiles(newFiles) {
    const list = Array.from(newFiles || []);
    if (list.length === 0) return;
    // Validate against the combined batch so the total-size limit holds
    // even when files are added across multiple drops.
    const message = validateSelectedFiles([...filesRef.current, ...list]);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setResult(null);
    setProgress(0);
    setFileList([...filesRef.current, ...list]);
  }

  function removeFile(index) {
    setFileList(filesRef.current.filter((_, i) => i !== index));
    setError('');
  }

  function clear() {
    setFileList([]);
    setProgress(0);
    setResult(null);
    setError('');
  }

  async function startUpload() {
    if (files.length === 0 || uploading) return;
    const message = validateSelectedFiles(files);
    if (message) {
      setError(message);
      return;
    }
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
