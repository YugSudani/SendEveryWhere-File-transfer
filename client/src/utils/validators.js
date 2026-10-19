export const MAX_FILE_SIZE_MB = Number(import.meta.env.VITE_MAX_FILE_SIZE_MB) || 100;
export const MAX_FILES_COUNT = Number(import.meta.env.VITE_MAX_FILES_COUNT) || 10;

export function isValidCode(code) {
  return /^[0-9]{6}$/.test(String(code || '').trim());
}

export function validateSelectedFiles(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) return 'Select at least one file.';
  if (files.length > MAX_FILES_COUNT) {
    return `You can send up to ${MAX_FILES_COUNT} files.`;
  }
  const maxBytes = MAX_FILE_SIZE_MB * 1024 * 1024;
  const tooBig = files.find((f) => f.size > maxBytes);
  if (tooBig) {
    return `${tooBig.name} exceeds ${MAX_FILE_SIZE_MB}MB.`;
  }
  return null;
}