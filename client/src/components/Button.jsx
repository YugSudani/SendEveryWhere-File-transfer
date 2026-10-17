import { Link } from 'react-router-dom';

export function Button({
  children,
  variant = 'primary',
  disabled = false,
  type = 'button',
  onClick,
  fullWidth = false,
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn btn-${variant}${fullWidth ? ' btn-full' : ''}`}
    >
      {children}
    </button>
  );
}

export function LinkButton({ to, children, variant = 'secondary' }) {
  return (
    <Link to={to} className={`btn btn-${variant} btn-full`}>
      {children}
    </Link>
  );
}
