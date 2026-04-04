import { useState } from 'react';
import { GlassPanel } from './ui/GlassPanel';
import { ToggleSwitch } from './ui/ToggleSwitch';
import { useLayerStore } from '../stores/layerStore';

const LAYER_DEFS = [
  { id: 'facilities', name: 'Facilities', icon: '\u{1F3ED}' },
  { id: 'infrastructure', name: 'Infrastructure', icon: '\u{1F6E2}\uFE0F' },
  { id: 'airspace', name: 'Airspace', icon: '\u2708\uFE0F' },
  { id: 'commodities', name: 'Commodities', icon: '\u{1F4CA}' },
  { id: 'satellites', name: 'Satellites', icon: '\u{1F6F0}\uFE0F' },
] as const;

export function LayerPanel() {
  const [collapsed, setCollapsed] = useState(false);
  const layers = useLayerStore((s) => s.layers);
  const toggleLayer = useLayerStore((s) => s.toggleLayer);

  return (
    <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 10, width: 220 }}>
      <GlassPanel>
        <div style={{ padding: '12px 16px' }}>
          {/* Header */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              marginBottom: collapsed ? 0 : 12,
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: '0.1em',
                color: 'var(--text-primary)',
              }}
            >
              LAYERS
            </span>
            <span
              style={{
                color: 'var(--text-secondary)',
                fontSize: 12,
                transition: 'transform 200ms ease',
                transform: collapsed ? 'rotate(-90deg)' : 'rotate(0)',
                display: 'inline-block',
              }}
            >
              ▼
            </span>
          </button>

          {/* Layer list */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: collapsed ? 0 : 300,
              opacity: collapsed ? 0 : 1,
              transition: 'max-height 250ms ease, opacity 200ms ease',
            }}
          >
            {LAYER_DEFS.map((def) => {
              const layer = layers[def.id];
              if (!layer) return null;
              return (
                <div
                  key={def.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '6px 0',
                  }}
                >
                  <ToggleSwitch
                    enabled={layer.enabled}
                    disabled={layer.locked}
                    onChange={() => toggleLayer(def.id)}
                  />
                  <span style={{ fontSize: 14 }}>{def.icon}</span>
                  <span
                    style={{
                      fontFamily: "'IBM Plex Sans', sans-serif",
                      fontSize: 13,
                      color: layer.locked ? 'var(--text-secondary)' : 'var(--text-primary)',
                      flex: 1,
                    }}
                  >
                    {def.name}
                  </span>
                  {layer.locked && (
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        color: 'var(--text-secondary)',
                        background: 'rgba(100, 130, 180, 0.1)',
                        padding: '2px 6px',
                        borderRadius: 4,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      SOON
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
