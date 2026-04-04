import type { FacilityStatus } from '../../types/facility';

const statusColors: Record<FacilityStatus, string> = {
  operational: 'var(--status-operational)',
  damaged: 'var(--status-damaged)',
  destroyed: 'var(--status-destroyed)',
  offline: 'var(--text-secondary)',
  unknown: 'var(--status-unknown)',
};

interface StatusBadgeProps {
  status: FacilityStatus;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const color = statusColors[status];
  const displayLabel = label ?? status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 8px',
        borderRadius: 6,
        background: `color-mix(in srgb, ${color} 15%, transparent)`,
        fontSize: 11,
        fontFamily: "'JetBrains Mono', monospace",
        fontWeight: 500,
        color,
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: color,
        }}
      />
      {displayLabel}
    </span>
  );
}
