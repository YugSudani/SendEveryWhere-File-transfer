// Limits are GB values because the cap is the TOTAL transfer size, not per file.
export const MAX_TOTAL_SIZE_GB =
  Number(import.meta.env.VITE_MAX_TOTAL_SIZE_GB) || 1;
export const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_GB * 1024 * 1024 * 1024;
export const MAX_FILES_COUNT =
  Number(import.meta.env.VITE_MAX_FILES_COUNT) || 10;
export const HTML_FILE_ERROR = "HTML files are not allowed.";

export function isValidCode(code) {
  return /^[0-9]{6}$/.test(String(code || "").trim());
}

export function isHtmlFile(file) {
  return String(file?.name || "")
    .toLowerCase()
    .endsWith(".html");
}

// Scan results and share links may be a full receive URL
// (e.g. https://app.example/receive?code=123456) or a plain 6-digit code.
export function extractTransferCode(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  try {
    const url = new URL(value);
    return (url.searchParams.get("code") || value).trim();
  } catch {
    return value;
  }
}

export function validateSelectedFiles(fileList) {
  const files = Array.from(fileList || []);
  if (files.length === 0) return "Select at least one file.";
  if (files.some(isHtmlFile)) return HTML_FILE_ERROR;
  if (files.length > MAX_FILES_COUNT) {
    return `You can send up to ${MAX_FILES_COUNT} files.`;
  }
  const totalBytes = files.reduce((acc, f) => acc + (f.size || 0), 0);
  if (totalBytes > MAX_TOTAL_SIZE_BYTES) {
    return `Out of limit: total size must stay under ${MAX_TOTAL_SIZE_GB}GB. Remove some files.`;
  }
  return null;
}
