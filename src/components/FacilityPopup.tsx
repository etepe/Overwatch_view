import { GlassPanel } from './ui/GlassPanel';
import { useDataStore } from '../stores/dataStore';
import { useViewStore } from '../stores/viewStore';
import type { Facility, FacilityStatus } from '../types/facility';

const STATUS_COLORS: Record<FacilityStatus, string> = {
  operational: 'var(--status-operational)',
  damaged: 'var(--status-damaged)',
  destroyed: 'var(--status-destroyed)',
  offline: 'var(--status-destroyed)',
  unknown: 'var(--status-unknown)',
};

const DAMAGE_FILL: Record<string, number> = {
  minor: 25,
  moderate: 50,
  severe: 75,
  critical: 100,
};

const DAMAGE_COLORS: Record<string, string> = {
  minor: 'var(--status-operational)',
  moderate: '#ffd600',
  severe: 'var(--amber-primary)',
  critical: 'var(--red-critical)',
};

interface FacilityPopupProps {
  facilityId: string | null;
  onClose: () => void;
}

export function FacilityPopup({ facilityId, onClose }: FacilityPopupProps) {
  const facilities = useDataStore((s) => s.facilities);
  const flyTo = useViewStore((s) => s.flyTo);

  if (!facilityId) return null;

  const facility: Facility | undefined = facilities.find((f) => f.id === facilityId);
  if (!facility) return null;

  const pre = facility.pre_crisis;
  const post = facility.post_crisis;
  const damagePct = DAMAGE_FILL[post.damage_level] ?? 0;
  const damageColor = DAMAGE_COLORS[post.damage_level] ?? 'var(--text-secondary)';

  return (
    <div style={{ position: 'absolute', top: 16, right: 250, zIndex: 20, width: 300 }}>
      <GlassPanel>
        <div style={{ padding: '14px 16px', maxHeight: '80vh', overflowY: 'auto' }}>
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 10,
              right: 12,
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: 16,
              cursor: 'pointer',
              padding: '2px 6px',
              lineHeight: 1,
            }}
          >
            ✕
          </button>

          {/* Name + Country */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              fontSize: 14,
              color: 'var(--text-primary)',
              marginBottom: 4,
              paddingRight: 24,
            }}
          >
            {facility.name.toUpperCase()}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
            }}
          >
            <span
              style={{
                fontFamily: "'IBM Plex Sans', sans-serif",
                fontSize: 12,
                color: 'var(--text-secondary)',
              }}
            >
              {facility.country}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                fontWeight: 600,
                color: STATUS_COLORS[facility.status],
                background: `color-mix(in srgb, ${STATUS_COLORS[facility.status]} 15%, transparent)`,
                padding: '2px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}
            >
              {facility.status}
            </span>
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />

          {/* PRE-CRISIS */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--cyan-primary)',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            PRE-CRISIS
          </div>
          <div style={{ fontSize: 12, fontFamily: "'IBM Plex Sans', sans-serif", color: 'var(--text-secondary)', marginBottom: 8 }}>
            {pre.description}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
            {pre.capacity_mtpa != null && <InfoRow label="Capacity" value={`${pre.capacity_mtpa} MTPA`} />}
            {pre.capacity_mbpd != null && <InfoRow label="Capacity" value={`${pre.capacity_mbpd} Mbpd`} />}
            {pre.capacity_mcm_day != null && <InfoRow label="Capacity" value={`${pre.capacity_mcm_day} mcm/day`} />}
            {pre.capacity_bpd != null && <InfoRow label="Capacity" value={`${(pre.capacity_bpd / 1000).toFixed(0)}k bpd`} />}
            {pre.capacity_mw != null && <InfoRow label="Capacity" value={`${pre.capacity_mw} MW`} />}
            {pre.export_mbpd != null && <InfoRow label="Exports" value={`${pre.export_mbpd} Mbpd`} />}
            {pre.global_share_pct != null && <InfoRow label="Global share" value={`${pre.global_share_pct}%`} />}
            {pre.storage_mbbls != null && <InfoRow label="Storage" value={`${pre.storage_mbbls}M barrels`} />}
            {pre.domestic_share_pct != null && <InfoRow label="Domestic share" value={`${pre.domestic_share_pct}%`} />}
            {pre.products.length > 0 && <InfoRow label="Products" value={pre.products.join(', ')} />}
          </div>

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />

          {/* POST-CRISIS */}
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              fontWeight: 600,
              color: 'var(--amber-primary)',
              letterSpacing: '0.1em',
              marginBottom: 6,
            }}
          >
            POST-CRISIS
          </div>

          {/* Damage bar */}
          <div style={{ marginBottom: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-secondary)' }}>
                Damage
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: damageColor,
                  textTransform: 'capitalize',
                }}
              >
                {post.damage_level}
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: 'rgba(100,130,180,0.1)', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${damagePct}%`,
                  borderRadius: 3,
                  background: damageColor,
                  transition: 'width 400ms ease',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
            <InfoRow label="Remaining" value={`${post.remaining_capacity_pct}%`} />
            {post.supply_loss_mbpd != null && (
              <InfoRow label="Supply loss" value={`-${post.supply_loss_mbpd} Mbpd`} highlight />
            )}
            {post.supply_loss_mtpa != null && (
              <InfoRow label="Supply loss" value={`-${post.supply_loss_mtpa} MTPA`} highlight />
            )}
            {post.supply_loss_mcm_day != null && (
              <InfoRow label="Supply loss" value={`-${post.supply_loss_mcm_day} mcm/day`} highlight />
            )}
            <InfoRow label="Repair est." value={`~${post.estimated_repair_months} months`} />
          </div>

          {post.notes && (
            <div
              style={{
                fontSize: 11,
                fontFamily: "'IBM Plex Sans', sans-serif",
                color: 'var(--text-secondary)',
                fontStyle: 'italic',
                marginBottom: 8,
                lineHeight: 1.4,
              }}
            >
              {post.notes}
            </div>
          )}

          {/* Sub-facilities */}
          {facility.sub_facilities && facility.sub_facilities.length > 0 && (
            <>
              <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '8px 0' }} />
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  fontWeight: 600,
                  color: 'var(--text-secondary)',
                  letterSpacing: '0.1em',
                  marginBottom: 6,
                }}
              >
                SUB-FACILITIES
              </div>
              {facility.sub_facilities.map((sf) => (
                <div
                  key={sf.name}
                  style={{
                    padding: '4px 0',
                    borderBottom: '1px solid rgba(100,130,180,0.07)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 11, fontFamily: "'IBM Plex Sans', sans-serif", color: 'var(--text-primary)' }}>
                      {sf.name}
                    </span>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: "'JetBrains Mono', monospace",
                        fontWeight: 600,
                        color: STATUS_COLORS[sf.status],
                        textTransform: 'uppercase',
                      }}
                    >
                      {sf.status}
                    </span>
                  </div>
                  {sf.supply_loss && (
                    <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--amber-primary)' }}>
                      Loss: {sf.supply_loss}
                    </div>
                  )}
                </div>
              ))}
            </>
          )}

          {/* Fly to button */}
          <button
            type="button"
            onClick={() => flyTo(facility.coordinates.lon, facility.coordinates.lat, 50_000)}
            style={{
              width: '100%',
              marginTop: 10,
              padding: '8px 0',
              background: 'var(--cyan-glow)',
              border: '1px solid var(--cyan-dim)',
              borderRadius: 6,
              color: 'var(--cyan-primary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              letterSpacing: '0.05em',
            }}
          >
            FLY TO FACILITY
          </button>
        </div>
      </GlassPanel>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-secondary)' }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: 600,
          color: highlight ? 'var(--amber-primary)' : 'var(--text-primary)',
        }}
      >
        {value}
      </span>
    </div>
  );
}
