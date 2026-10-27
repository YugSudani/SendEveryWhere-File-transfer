import { useState, useRef } from 'react';
import { initiateUpload, putFileToUrl, completeUpload } from '../../api/files.js';
import { validateSelectedFiles } from '../../utils/validators.js';
import { logTransfer } from '../../utils/activity.js';

export function useUpload() {
  const [files, setFiles] = useState([]);
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
    const combined = [...filesRef.current, ...list];
    const message = validateSelectedFiles(combined);
    if (message) {
      setError(message);
      return;
    }
    setError('');
    setResult(null);
    setProgress(0);
    setFileList(combined);
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

    // Weighted progress: bytes done across all files / total bytes.
    const loaded = files.map(() => 0);
    const total = files.reduce((sum, f) => sum + (f.size || 0), 0);
    const emit = () => {
      if (total > 0) {
        setProgress(
          Math.min(
            100,
            Math.round((loaded.reduce((a, b) => a + b, 0) / total) * 100)
          )
        );
      }
    };

    try {
      const specs = files.map((f) => ({
        filename: f.name,
        size: f.size,
        type: f.type || 'application/octet-stream',
      }));
      const { code, uploads } = await initiateUpload(specs);

      // No signed-date/ContentEncoding extras: only Content-Type, and it
      // matches what the server signed for this file.
      for (let i = 0; i < uploads.length; i += 1) {
        // eslint-disable-next-line no-await-in-loop
        await putFileToUrl(
          uploads[i].putUrl,
          files[i],
          files[i].type || 'application/octet-stream',
          (done) => {
            loaded[i] = done;
            emit();
          }
        );
      }

      const data = await completeUpload(code);
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
      setProgress(0);
    }
    return undefined;
  }

  return { files, progress, uploading, result, error, select, appendFiles, removeFile, clear, startUpload };
}
