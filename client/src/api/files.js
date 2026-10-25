import apiClient from './client';

export function uploadFiles(files, onProgress) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  return apiClient
    .post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (!e.total) return;
        onProgress?.(Math.round((e.loaded * 100) / e.total));
      },
    })
    .then((res) => res.data.data);
}

export function getFileInfo(code) {
  return apiClient.get(`/files/${code}`).then((res) => res.data.data);
}

export function getDownloadUrl(code) {
  const base = import.meta.env.VITE_API_BASE_URL || '/api';
  return `${base}/files/${code}/download`;
}

// Absolute URL for QR codes: scanners need a full URL, not a path.
export function getAbsoluteDownloadUrl(code) {
  const url = getDownloadUrl(code);
  if (/^https?:\/\//i.test(url)) return url;
  const path = url.startsWith('/') ? url : `/${url}`;
  return `${window.location.origin}${path}`;
}

// Receive-page URL encoded in the sender's QR code, so a phone's default
// camera app opens the page and the download starts automatically.
export function getReceiveUrl(code) {
  return `${window.location.origin}/receive?code=${code}`;
}
