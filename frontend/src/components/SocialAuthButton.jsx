const providerConfig = {
  google: {
    badge: "Google",
    className: "social-auth-button-google",
    icon: <GoogleLogo />
  }
};

export default function SocialAuthButton({
  provider,
  title,
  description,
  onClick,
  disabled = false
}) {
  const config = providerConfig[provider];

  if (!config) {
    return null;
  }

  return (
    <button
      className={`social-auth-button ${config.className}`}
      type="button"
      onClick={onClick}
      disabled={disabled}
    >
      <span className="social-auth-logo" aria-hidden="true">
        {config.icon}
      </span>
      <span className="social-auth-copy">
        <strong>{title}</strong>
        <small>{description}</small>
      </span>
      <span className="social-auth-provider-tag">{config.badge}</span>
    </button>
  );
}

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" role="presentation" focusable="false">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.55-.2-2.27H12v4.31h6.45a5.52 5.52 0 0 1-2.39 3.63v3h3.88c2.27-2.09 3.55-5.17 3.55-8.67Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.07 7.94-2.91l-3.88-3c-1.07.72-2.45 1.15-4.06 1.15-3.12 0-5.77-2.11-6.72-4.95H1.27v3.09A11.99 11.99 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.29A7.18 7.18 0 0 1 4.9 12c0-.79.14-1.55.38-2.29V6.62H1.27A11.99 11.99 0 0 0 0 12c0 1.94.47 3.77 1.27 5.38l4.01-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.59 1.81l3.44-3.44C17.94 1.16 15.23 0 12 0A11.99 11.99 0 0 0 1.27 6.62l4.01 3.09c.95-2.84 3.6-4.94 6.72-4.94Z"
      />
    </svg>
  );
}
