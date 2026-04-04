export const theme = {
  bg: {
    primary: '#0a0e17',
    panel: 'rgba(12, 18, 30, 0.85)',
    panelHover: 'rgba(20, 28, 45, 0.9)',
  },
  cyan: {
    primary: '#00e5ff',
    dim: '#00a3b4',
    glow: 'rgba(0, 229, 255, 0.15)',
  },
  amber: {
    primary: '#ff9100',
    dim: '#b36500',
  },
  red: {
    critical: '#ff1744',
  },
  text: {
    primary: '#e8edf5',
    secondary: '#7a8ba8',
  },
  border: {
    subtle: 'rgba(100, 130, 180, 0.15)',
  },
  status: {
    operational: '#00e676',
    damaged: '#ff9100',
    destroyed: '#ff1744',
    unknown: '#7a8ba8',
  },
} as const;
