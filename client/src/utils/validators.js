export function isValidCode(code) {
  return /^[0-9]{6}$/.test(String(code || '').trim());
}
