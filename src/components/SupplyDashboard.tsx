import { useState } from 'react';
import { GlassPanel } from './ui/GlassPanel';
import { useSupplyCalculation, type SupplyMetric } from '../hooks/useSupplyCalculation';
import { useAnimatedNumber } from '../hooks/useAnimatedNumber';
import { useDataStore } from '../stores/dataStore';
import { useSelectionStore } from '../stores/selectionStore';

function MetricCard({
  label,
  metric,
  expanded,
  onToggle,
}: {
  label: string;
  metric: SupplyMetric;
  expanded: boolean;
  onToggle: () => void;
}) {
  const animatedLoss = useAnimatedNumber(metric.loss);
  const animatedPct = useAnimatedNumber(metric.globalSharePct);
  const facilities = useDataStore((s) => s.facilities);
  const selectedIds = useSelectionStore((s) => s.selectedFacilityIds);

  // Build breakdown data for detail view
  const breakdown = (() => {
    if (!expanded) return [];
    const items: { name: string; loss: number; status: string }[] = [];
    const selected = facilities.filter((f) => selectedIds.has(f.id));

    for (const f of selected) {
      if (label === 'OIL') {
        let loss = f.post_crisis.supply_loss_mbpd ?? 0;
        if (f.sub_facilities) {
          loss += f.sub_facilities.reduce((s, sf) => s + (sf.supply_loss_mbpd ?? 0), 0);
        }
        if (loss > 0) items.push({ name: f.name, loss, status: f.status });
      } else if (label === 'LNG') {
        const loss = f.post_crisis.supply_loss_mtpa ?? 0;
        if (loss > 0) items.push({ name: f.name, loss, status: f.status });
      } else if (label === 'HELIUM') {
        if (f.sub_facilities) {
          const loss = f.sub_facilities
            .filter((sf) => sf.type === 'helium_plant')
            .reduce((s, sf) => s + (sf.supply_loss_mcm ?? 0), 0);
          if (loss > 0) items.push({ name: f.name, loss, status: f.status });
        }
      }
    }

    return items.sort((a, b) => b.loss - a.loss);
  })();

  const maxBreakdown = breakdown.length > 0 ? breakdown[0]!.loss : 1;

  return (
    <div
      style={{
        flex: 1,
        minWidth: 160,
        cursor: 'pointer',
        borderRadius: 8,
        padding: '12px 14px',
        background: expanded ? 'rgba(0, 229, 255, 0.05)' : 'transparent',
        border: expanded ? '1px solid var(--border-subtle)' : '1px solid transparent',
        transition: 'background 200ms, border-color 200ms',
      }}
      onClick={onToggle}
    >
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          letterSpacing: '0.08em',
          marginBottom: 4,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 24,
          fontWeight: 700,
          color: metric.loss > 0 ? 'var(--amber-primary)' : 'var(--text-secondary)',
          lineHeight: 1.1,
        }}
      >
        {metric.loss > 0 ? '-' : ''}
        {animatedLoss.toFixed(metric.unit === 'Mbpd' ? 3 : 1)}
      </div>
      <div
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        {metric.unit}
      </div>
      {metric.globalSharePct > 0 && (
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--red-critical)',
            marginTop: 4,
          }}
        >
          ▼ {animatedPct.toFixed(1)}% global
        </div>
      )}

      {/* Detail breakdown */}
      {expanded && breakdown.length > 0 && (
        <div style={{ marginTop: 10, borderTop: '1px solid var(--border-subtle)', paddingTop: 8 }}>
          {breakdown.map((item) => (
            <div key={item.name} style={{ marginBottom: 6 }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 10,
                  fontFamily: "'IBM Plex Sans', sans-serif",
                  color: 'var(--text-primary)',
                  marginBottom: 2,
                }}
              >
                <span
                  style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '70%',
                  }}
                >
                  {item.name}
                </span>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: item.status === 'destroyed' || item.status === 'offline'
                      ? 'var(--red-critical)'
                      : 'var(--amber-primary)',
                  }}
                >
                  -{item.loss.toFixed(metric.unit === 'Mbpd' ? 3 : 1)}
                </span>
              </div>
              <div
                style={{
                  height: 3,
                  borderRadius: 2,
                  background: 'rgba(100, 130, 180, 0.1)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${(item.loss / maxBreakdown) * 100}%`,
                    borderRadius: 2,
                    background:
                      item.status === 'destroyed' || item.status === 'offline'
                        ? 'var(--red-critical)'
                        : 'var(--amber-primary)',
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function SupplyDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const supply = useSupplyCalculation();

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 10,
      }}
    >
      <GlassPanel>
        <div style={{ padding: '12px 16px' }}>
          {/* Header */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: collapsed ? 0 : 10,
            }}
          >
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
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
                SUPPLY IMPACT
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
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--text-secondary)',
              }}
            >
              {supply.totalSelected}/{supply.totalFacilities} facilities selected
            </span>
          </div>

          {/* Cards */}
          <div
            style={{
              overflow: 'hidden',
              maxHeight: collapsed ? 0 : 500,
              opacity: collapsed ? 0 : 1,
              transition: 'max-height 250ms ease, opacity 200ms ease',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
              }}
            >
              <MetricCard
                label="OIL"
                metric={supply.oil}
                expanded={expandedCard === 'oil'}
                onToggle={() => setExpandedCard(expandedCard === 'oil' ? null : 'oil')}
              />
              <MetricCard
                label="LNG"
                metric={supply.lng}
                expanded={expandedCard === 'lng'}
                onToggle={() => setExpandedCard(expandedCard === 'lng' ? null : 'lng')}
              />
              <MetricCard
                label="HELIUM"
                metric={supply.helium}
                expanded={expandedCard === 'helium'}
                onToggle={() => setExpandedCard(expandedCard === 'helium' ? null : 'helium')}
              />
            </div>
          </div>
        </div>
      </GlassPanel>
    </div>
  );
}
