import {
  Viewer,
  Entity,
  Cartesian3,
  Cartesian2,
  Color,
  VerticalOrigin,
  HorizontalOrigin,
  NearFarScalar,
  ConstantProperty,
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

  if (selected) {
    ctx.shadowColor = '#00e5ff';
    ctx.shadowBlur = 12;
  }

  ctx.beginPath();
  ctx.arc(cx, cy, s / 2, 0, Math.PI * 2);
  if (selected) {
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  const r = Math.round(color.red * 255);
  const g = Math.round(color.green * 255);
  const b = Math.round(color.blue * 255);
  ctx.shadowBlur = 0;
  ctx.beginPath();
  ctx.arc(cx, cy, s / 2 - 2, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${selected ? 1.0 : 0.5})`;
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx, cy, s / 4, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 255, 255, ${selected ? 0.4 : 0.2})`;
  ctx.fill();

  return canvas;
}

interface PinImages {
  selected: HTMLCanvasElement;
  unselected: HTMLCanvasElement;
}

export class FacilitiesLayer {
  private viewer: Viewer | null = null;
  private entities: Map<string, Entity> = new Map();
  private pinImages: Map<string, PinImages> = new Map();
  private facilities: Facility[] = [];
  private unsubscribe: (() => void) | null = null;
  private lastSelectedIds: Set<string> = new Set();

  add(viewer: Viewer, facilities: Facility[]): void {
    this.viewer = viewer;
    this.facilities = facilities;

    this.createEntities();
    this.applySelection(useSelectionStore.getState().selectedFacilityIds);

    // Subscribe: only update entities whose selection state actually flipped
    this.unsubscribe = useSelectionStore.subscribe((state) => {
      this.applySelection(state.selectedFacilityIds);
    });
  }

  remove(): void {
    if (this.viewer) {
      for (const entity of this.entities.values()) {
        this.viewer.entities.remove(entity);
      }
    }
    this.entities.clear();
    this.pinImages.clear();
    this.lastSelectedIds = new Set();
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  private createEntities(): void {
    if (!this.viewer) return;

    for (const facility of this.facilities) {
      const color = STATUS_COLORS[facility.status] ?? STATUS_COLORS.unknown;
      const pinSize = PIN_SIZES[facility.type] ?? 14;

      // Pre-create and cache both canvases once
      const images: PinImages = {
        unselected: createPinCanvas(pinSize, color, false),
        selected: createPinCanvas(pinSize, color, true),
      };
      this.pinImages.set(facility.id, images);

      const entity = this.viewer.entities.add({
        id: `facility-${facility.id}`,
        position: Cartesian3.fromDegrees(facility.coordinates.lon, facility.coordinates.lat),
        billboard: {
          image: new ConstantProperty(images.unselected),
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
          pixelOffset: new Cartesian2(0, 14),
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

  private applySelection(selectedIds: Set<string>): void {
    if (!this.viewer) return;

    let changed = false;
    for (const [id, entity] of this.entities) {
      const wasSelected = this.lastSelectedIds.has(id);
      const isSelected = selectedIds.has(id);
      if (wasSelected === isSelected) continue;

      const images = this.pinImages.get(id);
      if (images && entity.billboard) {
        entity.billboard.image = new ConstantProperty(isSelected ? images.selected : images.unselected);
        changed = true;
      }
    }

    this.lastSelectedIds = new Set(selectedIds);
    if (changed) {
      this.viewer.scene.requestRender();
    }
  }
}
