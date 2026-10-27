import apiClient from './client';

/**
 * Step 1: ask our server for a share code + one presigned PUT URL per file.
 * No file bytes travel here; the browser uploads directly to Filebase next.
 */
export function initiateUpload(fileSpecs) {
  return apiClient
    .post('/files/initiate', { files: fileSpecs })
    .then((res) => res.data.data);
}

/**
 * Step 2: PUT one file straight to Filebase. No extra signed headers are
 * added; the Content-Type header sent must match the one signed on the
 * server, which is exactly what we pass in. XHR (not fetch) so we still get
 * upload progress events for the progress bar.
 */
export function putFileToUrl(url, file, contentType, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('PUT', url);
    xhr.setRequestHeader('Content-Type', contentType);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(e.loaded);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) return resolve();
      reject(new Error(`Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.send(file);
  });
}

/**
 * Step 3: tell our server every PUT finished. The share becomes 'ready' and
 * its 10-minute countdown restarts from this moment.
 */
export function completeUpload(code) {
  return apiClient.post(`/files/${code}/complete`).then((res) => res.data.data);
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
