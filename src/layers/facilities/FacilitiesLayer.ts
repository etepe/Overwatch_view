import {
  Viewer,
  Entity,
  Cartesian3,
  Color,
  VerticalOrigin,
  HorizontalOrigin,
  NearFarScalar,
  ConstantProperty,
  CallbackProperty,
} from 'cesium';
import type { Facility, FacilityStatus, FacilityType } from '../../types/facility';
import { useSelectionStore } from '../../stores/selectionStore';

const STATUS_COLORS: Record<FacilityStatus, Color> = {
  operational: Color.fromCssColorString('#00e676'),
  damaged: Color.fromCssColorString('#ff9100'),
  destroyed: Color.fromCssColorString('#ff1744'),
  offline: Color.fromCssColorString('#ff1744'),
  unknown: Color.fromCssColorString('#7a8ba8'),
};

const PIN_SIZES: Record<FacilityType, number> = {
  lng_terminal: 20,
  oil_terminal: 20,
  gas_processing: 16,
  refinery: 16,
  nuclear_plant: 14,
  nuclear_facility: 14,
  desalination: 14,
};

function createPinCanvas(size: number, color: Color, selected: boolean): HTMLCanvasElement {
  const scale = 2;
  const s = size * scale;
  const canvas = document.createElement('canvas');
  canvas.width = s + 8;
  canvas.height = s + 8;
  const ctx = canvas.getContext('2d')!;
  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // Glow for selected
  if (selected) {
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
  }

  // Outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
  if (selected) {
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // Fill
  const r = Math.round(color.red * 255);
  const g = Math.round(color.green * 255);
  const b = Math.round(color.blue * 255);
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, s / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${selected ? 1.0 : 0.7})`;
  ctx.fill();

  // Inner highlight
  ctx.beginPath();
  ctx.arc(cx, cy, s / 4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${selected ? 0.4 : 0.2})`;
  ctx.fill();

  return canvas;
}

export class FacilitiesLayer {
  private viewer: Viewer | null = null;
  private entities: Map<string, Entity> = new Map();
  private facilities: Facility[] = [];
  private unsubscribe: (() => void) | null = null;

  add(viewer: Viewer, facilities: Facility[]): void {
    this.viewer = viewer;
    this.facilities = facilities;

    this.createEntities();
    this.updateAppearances();

    // Subscribe to selection changes
    this.unsubscribe = useSelectionStore.subscribe(() => {
      this.updateAppearances();
    });
  }

  remove(): void {
    if (this.viewer) {
      for (const entity of this.entities.values()) {
        this.viewer.entities.remove(entity);
      }
    }
    this.entities.clear();
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private createEntities(): void {
    if (!this.viewer) return;

    for (const facility of this.facilities) {
      const color = STATUS_COLORS[facility.status] ?? STATUS_COLORS.unknown;
      const pinSize = PIN_SIZES[facility.type] ?? 14;

      const entity = this.viewer.entities.add({
        id: `facility-${facility.id}`,
        position: Cartesian3.fromDegrees(facility.coordinates.lon, facility.coordinates.lat),
        billboard: {
          image: new CallbackProperty(() => {
            const selected = useSelectionStore.getState().selectedFacilityIds.has(facility.id);
            return createPinCanvas(pinSize, color, selected);
          }, false) as unknown as ConstantProperty,
          width: pinSize + 4,
          height: pinSize + 4,
          verticalOrigin: VerticalOrigin.CENTER,
          horizontalOrigin: HorizontalOrigin.CENTER,
          scaleByDistance: new NearFarScalar(500_000, 1.2, 5_000_000, 0.5),
        },
        label: {
          text: facility.name.length > 20 ? facility.name.substring(0, 18) + '...' : facility.name,
          font: "11px 'JetBrains Mono', monospace",
          fillColor: Color.fromCssColorString('#e8edf5'),
          outlineColor: Color.fromCssColorString('#0a0e17'),
          outlineWidth: 3,
          style: 2, // FILL_AND_OUTLINE
          verticalOrigin: VerticalOrigin.TOP,
          pixelOffset: new Cartesian3(0, 14, 0) as unknown as import('cesium').Cartesian2,
          scaleByDistance: new NearFarScalar(300_000, 1.0, 2_000_000, 0.0),
        },
        properties: {
          facilityId: facility.id,
          type: 'facility',
        },
      });

      this.entities.set(facility.id, entity);
    }
  }

  private updateAppearances(): void {
    if (!this.viewer) return;
    // Trigger scene re-render for CallbackProperty
    this.viewer.scene.requestRender();
  }
}
