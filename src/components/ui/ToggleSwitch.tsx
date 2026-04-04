interface ToggleSwitchProps {
  enabled: boolean;
  disabled?: boolean;
  onChange: () => void;
}

export function ToggleSwitch({ enabled, disabled = false, onChange }: ToggleSwitchProps) {
  return (
    <button
      type="button"
      onClick={disabled ? undefined : onChange}
      style={{
        width: 36,
        height: 20,
        borderRadius: 10,
        border: 'none',
        padding: 2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.3 : 1,
        background: enabled ? 'var(--cyan-primary)' : '#2a2f3a',
        transition: 'background 200ms ease, opacity 200ms ease',
        display: 'flex',
        alignItems: 'center',
        flexShrink: 0,
      }}
      aria-checked={enabled}
      role="switch"
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          background: '#ffffff',
          transition: 'transform 200ms ease',
          transform: enabled ? 'translateX(16px)' : 'translateX(0)',
          display: 'block',
        }}
      />
    </button>
  );
}
