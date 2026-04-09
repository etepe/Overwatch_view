import {
  Viewer,
  Entity,
  Cartesian3,
  Color,
  ColorMaterialProperty,
  EllipseGraphics,
  NearFarScalar,
} from 'cesium';
import type { Pipeline, Chokepoint } from '../../types/infrastructure';

const PIPELINE_COLORS: Record<string, { color: Color; dashed: boolean }> = {
  'operational-bypass': { color: Color.fromCssColorString('#00e676'), dashed: true },
  operational: { color: Color.fromCssColorString('#00e5ff'), dashed: false },
  disrupted: { color: Color.fromCssColorString('#ff9100'), dashed: true },
  limited: { color: Color.fromCssColorString('#ffd600'), dashed: true },
  offline: { color: Color.fromCssColorString('#ff1744'), dashed: true },
};

function getPipelineStyle(pipeline: Pipeline) {
  const key = pipeline.status === 'operational' && pipeline.is_bypass ? 'operational-bypass' : pipeline.status;
  return PIPELINE_COLORS[key] ?? { color: Color.fromCssColorString('#00e5ff'), dashed: false };
}

export class InfrastructureLayer {
  private viewer: Viewer | null = null;
  private entities: Entity[] = [];

  add(viewer: Viewer, pipelines: Pipeline[], chokepoints: Chokepoint[]): void {
    this.viewer = viewer;
    this.addPipelines(pipelines);
    this.addChokepoints(chokepoints);
  }

  remove(): void {
    if (this.viewer) {
      for (const entity of this.entities) {
        this.viewer.entities.remove(entity);
      }
    }
    this.entities = [];
  }

  private addPipelines(pipelines: Pipeline[]): void {
    if (!this.viewer) return;

    for (const pipeline of pipelines) {
      const style = getPipelineStyle(pipeline);
      const positions = Cartesian3.fromDegreesArray(
        pipeline.coordinates.flatMap((c) => [c.lon, c.lat]),
      );

      // Use a static color material — dash/glow materials cause continuous re-rendering
      const material = new ColorMaterialProperty(
        style.dashed ? style.color.withAlpha(0.75) : style.color,
      );

      const entity = this.viewer.entities.add({
        id: `pipeline-${pipeline.id}`,
        polyline: {
          positions,
          width: pipeline.status === 'limited' ? 2 : 3.5,
          material,
          clampToGround: true,
        },
        properties: {
          pipelineId: pipeline.id,
          type: 'pipeline',
          name: pipeline.name,
          status: pipeline.status,
          capacity: pipeline.capacity_mbpd
            ? `${pipeline.capacity_mbpd} Mbpd`
            : pipeline.capacity_bcf_day
              ? `${pipeline.capacity_bcf_day} bcf/day`
              : 'N/A',
          description: pipeline.description,
          isBypass: pipeline.is_bypass,
        },
      });

      this.entities.push(entity);

      // Label at midpoint
      const midIdx = Math.floor(pipeline.coordinates.length / 2);
      const mid = pipeline.coordinates[midIdx]!;
      const shortName = pipeline.name.split('(')[0]?.trim() ?? pipeline.name;
      const labelText = pipeline.is_bypass ? `${shortName} [BYPASS]` : shortName;

      const labelEntity = this.viewer.entities.add({
        id: `pipeline-label-${pipeline.id}`,
        position: Cartesian3.fromDegrees(mid.lon, mid.lat),
        label: {
          text: labelText,
          font: "10px 'JetBrains Mono', monospace",
          fillColor: style.color.withAlpha(0.9),
          outlineColor: Color.fromCssColorString('#0a0e17'),
          outlineWidth: 3,
          style: 2,
          scale: 0.9,
          scaleByDistance: new NearFarScalar(500_000, 1.0, 3_000_000, 0.0),
        },
      });
      this.entities.push(labelEntity);
    }
  }

  private addChokepoints(chokepoints: Chokepoint[]): void {
    if (!this.viewer) return;

    for (const cp of chokepoints) {
      const entity = this.viewer.entities.add({
        id: `chokepoint-${cp.id}`,
        position: Cartesian3.fromDegrees(cp.coordinates.lon, cp.coordinates.lat),
        ellipse: new EllipseGraphics({
          semiMajorAxis: cp.zone_radius_km * 1000,
          semiMinorAxis: cp.zone_radius_km * 1000,
          material: Color.fromCssColorString('rgba(255, 23, 68, 0.12)'),
          outline: true,
          outlineColor: Color.fromCssColorString('#ff1744').withAlpha(0.6),
          outlineWidth: 2,
        }),
        label: {
          text: cp.name.toUpperCase(),
          font: "bold 12px 'JetBrains Mono', monospace",
          fillColor: Color.fromCssColorString('#ff1744'),
          outlineColor: Color.fromCssColorString('#0a0e17'),
          outlineWidth: 3,
          style: 2,
        },
        properties: {
          chokepointId: cp.id,
          type: 'chokepoint',
          name: cp.name,
          transitDrop: cp.transit_drop_pct,
          dailyOil: cp.daily_oil_transit_mbpd,
          globalOilShare: cp.global_oil_share_pct,
          globalLngShare: cp.global_lng_share_pct,
          description: cp.description,
        },
      });

      this.entities.push(entity);
    }
  }
}
