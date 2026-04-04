import { GlassPanel } from './ui/GlassPanel';

export function Header() {
  return (
    <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 10 }}>
      <GlassPanel>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '10px 18px',
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 18,
              letterSpacing: '0.15em',
              color: 'var(--cyan-primary)',
            }}
          >
            OVERWATCH
          </span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 500,
              color: 'var(--status-operational)',
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: 'var(--status-operational)',
                animation: 'pulse 2s infinite',
                display: 'inline-block',
              }}
            />
            LIVE
          </span>
        </div>
        <style>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.4; }
          }
        `}</style>
      </GlassPanel>
    </div>
  );
}
