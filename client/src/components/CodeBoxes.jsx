import React, { useRef } from 'react';

export function CodeBoxes({
  value = '',
  onChange,
  onComplete,
  disabled = false,
  length = 6,
  id = 'receive-code',
}) {
  const boxesRef = useRef([]);

  function focusBox(i) {
    const el = boxesRef.current[i];
    if (el) {
      el.focus();
      el.select();
    }
  }

  function toArray(str) {
    const arr = String(str || '').split('');
    while (arr.length < length) arr.push('');
    return arr.slice(0, length);
  }

  function emit(next) {
    onChange?.(next);
    if (next.length === length) onComplete?.(next);
  }

  function handleChange(e, i) {
    const cleaned = e.target.value.replace(/[^0-9]/g, '');
    const arr = toArray(value);
    arr[i] = cleaned.slice(-1);
    emit(arr.join(''));
    if (cleaned && i < length - 1) {
      setTimeout(() => focusBox(i + 1), 0);
    }
  }

  function handleKeyDown(e, i) {
    const arr = toArray(value);
    if (e.key === 'Backspace' && !arr[i] && i > 0) {
      e.preventDefault();
      arr[i - 1] = '';
      emit(arr.join('').slice(0, length));
      setTimeout(() => focusBox(i - 1), 0);
    } else if (e.key === 'ArrowLeft' && i > 0) {
      e.preventDefault();
      focusBox(i - 1);
    } else if (e.key === 'ArrowRight' && i < length - 1) {
      e.preventDefault();
      focusBox(i + 1);
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') || '')
      .replace(/[^0-9]/g, '')
      .slice(0, length);
    if (!pasted) return;
    emit(pasted);
    setTimeout(() => focusBox(Math.min(pasted.length, length - 1)), 0);
  }

  const digits = toArray(value);

  return (
    <div
      className="code-boxes"
      role="group"
      aria-label="6-digit transfer code"
      onPaste={handlePaste}
    >
      {digits.map((d, i) => (
        <input
          key={i}
          id={i === 0 ? id : undefined}
          ref={(el) => {
            boxesRef.current[i] = el;
          }}
          className={`code-box${d ? ' filled' : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          value={d}
          disabled={disabled}
          aria-label={`Digit ${i + 1}`}
          autoFocus={i === 0}
          onChange={(e) => handleChange(e, i)}
          onKeyDown={(e) => handleKeyDown(e, i)}
          onFocus={(e) => e.target.select()}
        />
      ))}
    </div>
  );
}
