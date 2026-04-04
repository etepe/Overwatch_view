import { type ReactNode, type CSSProperties } from 'react';

interface GlassPanelProps {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  hover?: boolean;
}

export function GlassPanel({ children, className = '', style, hover = true }: GlassPanelProps) {
  return (
    <div
      className={`glass-panel ${hover ? 'glass-panel--hover' : ''} ${className}`}
      style={style}
    >
      {children}
      <style>{`
        .glass-panel {
          background: var(--bg-panel);
          backdrop-filter: blur(16px) saturate(120%);
          -webkit-backdrop-filter: blur(16px) saturate(120%);
          border: 1px solid var(--border-subtle);
          border-radius: 12px;
          animation: glassEnter 150ms ease-out;
        }

        .glass-panel--hover {
          transition: border-color 200ms ease, box-shadow 200ms ease;
        }

        .glass-panel--hover:hover {
          border-color: var(--cyan-dim);
          box-shadow: 0 0 20px var(--cyan-glow);
        }

        @keyframes glassEnter {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
