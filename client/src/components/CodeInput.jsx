export function CodeInput({ value, onChange, disabled = false, id = 'code' }) {
  function handleChange(e) {
    const next = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
    onChange?.(next);
  }

  return (
    <input
      id={id}
      className="code-input"
      inputMode="numeric"
      autoComplete="one-time-code"
      placeholder="000000"
      maxLength={6}
      value={value}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}
