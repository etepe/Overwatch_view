import { useState, useMemo } from 'react';
import { GlassPanel } from './ui/GlassPanel';
import { useDataStore } from '../stores/dataStore';
import { useSelectionStore } from '../stores/selectionStore';
import { useViewStore } from '../stores/viewStore';
import type { FacilityStatus } from '../types/facility';

const STATUS_COLORS: Record<FacilityStatus, string> = {
  operational: 'var(--status-operational)',
  damaged: 'var(--status-damaged)',
  destroyed: 'var(--status-destroyed)',
  offline: 'var(--status-destroyed)',
  unknown: 'var(--status-unknown)',
};

const STATUS_LABELS: Record<FacilityStatus, string> = {
  operational: 'OK',
  damaged: 'DMG',
  destroyed: 'DST',
  offline: 'OFF',
  unknown: '???',
};

interface FacilityListProps {
  onFacilityClick: (id: string) => void;
}

export function FacilityList({ onFacilityClick }: FacilityListProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const facilities = useDataStore((s) => s.facilities);
  const selectedIds = useSelectionStore((s) => s.selectedFacilityIds);
  const toggleFacility = useSelectionStore((s) => s.toggleFacility);
  const selectAll = useSelectionStore((s) => s.selectAll);
  const clearAll = useSelectionStore((s) => s.clearAll);
  const flyTo = useViewStore((s) => s.flyTo);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof facilities> = {};
    for (const f of facilities) {
      if (!groups[f.country]) groups[f.country] = [];
      groups[f.country]!.push(f);
    }
    return groups;
  }, [facilities]);

  const toggleGroup = (country: string) => {
    const next = new Set(collapsedGroups);
    if (next.has(country)) next.delete(country);
    else next.add(country);
    setCollapsedGroups(next);
  };

  const selectedCount = facilities.filter((f) => selectedIds.has(f.id)).length;

  return (
    <div style={{ position: 'absolute', top: 120, left: 16, zIndex: 10, width: 260 }}>
      <GlassPanel>
        <div style={{ padding: '12px 14px' }}>
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
              marginBottom: collapsed ? 0 : 8,
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
              FACILITIES ({selectedCount}/{facilities.length})
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

          {/* Content */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: collapsed ? 0 : 400,
              opacity: collapsed ? 0 : 1,
              transition: 'max-height 250ms ease, opacity 200ms ease',
            }}
          >
            {/* Actions */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <button
                type="button"
                onClick={() => selectAll(facilities.map((f) => f.id))}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: 'var(--cyan-glow)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--cyan-primary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAll}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: 'rgba(255,23,68,0.08)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 6,
                  color: 'var(--text-secondary)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  cursor: 'pointer',
                }}
              >
                Clear
              </button>
            </div>

            {/* Facility groups */}
            <div style={{ maxHeight: 340, overflowY: 'auto' }}>
              {Object.entries(grouped).map(([country, facs]) => (
                <div key={country} style={{ marginBottom: 6 }}>
                  <button
                    type="button"
                    onClick={() => toggleGroup(country)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px 0',
                      width: '100%',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 9,
                        color: 'var(--text-secondary)',
                        transform: collapsedGroups.has(country) ? 'rotate(-90deg)' : 'rotate(0)',
                        transition: 'transform 150ms',
                        display: 'inline-block',
                      }}
                    >
                      ▼
                    </span>
                    <span
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        fontWeight: 600,
                        color: 'var(--text-secondary)',
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                      }}
                    >
                      {country}
                    </span>
                  </button>

                  {!collapsedGroups.has(country) &&
                    facs.map((f) => {
                      const selected = selectedIds.has(f.id);
                      return (
                        <div
                          key={f.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '3px 0 3px 12px',
                          }}
                        >
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleFacility(f.id)}
                            style={{
                              accentColor: 'var(--cyan-primary)',
                              cursor: 'pointer',
                              flexShrink: 0,
                            }}
                          />
                          {/* Status dot */}
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: '50%',
                              background: STATUS_COLORS[f.status],
                              flexShrink: 0,
                            }}
                          />
                          {/* Name — clickable to fly */}
                          <button
                            type="button"
                            onClick={() => {
                              flyTo(f.coordinates.lon, f.coordinates.lat, 100_000);
                              onFacilityClick(f.id);
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                              fontFamily: "'IBM Plex Sans', sans-serif",
                              fontSize: 11,
                              cursor: 'pointer',
                              padding: 0,
                              textAlign: 'left',
                              flex: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                            title={f.name}
                          >
                            {f.name}
                          </button>
                          {/* Status label */}
                          <span
                            style={{
                              fontFamily: "'JetBrains Mono', monospace",
                              fontSize: 9,
                              fontWeight: 600,
                              color: STATUS_COLORS[f.status],
                              flexShrink: 0,
                            }}
                          >
                            {STATUS_LABELS[f.status]}
                          </span>
                        </div>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
