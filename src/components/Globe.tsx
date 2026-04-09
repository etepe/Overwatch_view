import { useEffect, useRef } from 'react';
import {
  Viewer,
  Ion,
  Terrain,
  Color,
  Cartesian3,
  Math as CesiumMath,
  ScreenSpaceEventHandler,
  ScreenSpaceEventType,
  defined,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useViewStore } from '../stores/viewStore';
import { useDataStore } from '../stores/dataStore';
import { useLayerStore } from '../stores/layerStore';
import { useSelectionStore } from '../stores/selectionStore';
import { FacilitiesLayer } from '../layers/facilities/FacilitiesLayer';
import { InfrastructureLayer } from '../layers/infrastructure/InfrastructureLayer';

const MAX_RESOLUTION_SCALE = 1.0;

interface GlobeProps {
  onFacilityClick: (id: string) => void;
}

export function Globe({ onFacilityClick }: GlobeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const facilitiesLayerRef = useRef<FacilitiesLayer | null>(null);
  const infraLayerRef = useRef<InfrastructureLayer | null>(null);
  const setViewer = useViewStore((s) => s.setViewer);
  const facilities = useDataStore((s) => s.facilities);
  const pipelines = useDataStore((s) => s.pipelines);
  const chokepoints = useDataStore((s) => s.chokepoints);
  const loaded = useDataStore((s) => s.loaded);
  const facilitiesEnabled = useLayerStore((s) => s.layers.facilities?.enabled ?? true);
  const infraEnabled = useLayerStore((s) => s.layers.infrastructure?.enabled ?? true);

  const onFacilityClickRef = useRef(onFacilityClick);
  onFacilityClickRef.current = onFacilityClick;

  // Initialize viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const token = import.meta.env.VITE_CESIUM_ION_TOKEN as string;
    if (token) {
      Ion.defaultAccessToken = token;
    }

    const viewer = new Viewer(containerRef.current, {
      animation: false,
      timeline: false,
      baseLayerPicker: false,
      geocoder: false,
      homeButton: false,
      navigationHelpButton: false,
      sceneModePicker: false,
      fullscreenButton: false,
      selectionIndicator: false,
      infoBox: false,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
      targetFrameRate: 30,
      useBrowserRecommendedResolution: true,
    });

    viewer.scene.backgroundColor = Color.fromCssColorString('#0a0e17');
    // Performance tuning — skip lighting, fog, and high-quality terrain LOD
    viewer.scene.globe.enableLighting = false;
    viewer.scene.fog.enabled = false;
    if (viewer.scene.skyAtmosphere) viewer.scene.skyAtmosphere.show = false;
    viewer.scene.globe.showGroundAtmosphere = false;
    viewer.scene.globe.maximumScreenSpaceError = 4; // default 2 — higher = lower quality, less CPU
    viewer.scene.globe.tileCacheSize = 50;
    viewer.resolutionScale = Math.min(window.devicePixelRatio || 1, MAX_RESOLUTION_SCALE);
    viewer.cesiumWidget.creditContainer.setAttribute('style', 'display: none !important');
    viewer.scene.setTerrain(Terrain.fromWorldTerrain());

    // Initial camera — Strait of Hormuz
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(53.0, 27.0, 2_000_000),
      orientation: {
        pitch: CesiumMath.toRadians(-60),
        heading: 0,
        roll: 0,
      },
    });

    // Click handler for entities
    const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((event: { position: import('cesium').Cartesian2 }) => {
      const picked = viewer.scene.pick(event.position);
      if (defined(picked) && picked.id?.properties) {
        const type = picked.id.properties.type?.getValue();
        if (type === 'facility') {
          const facilityId = picked.id.properties.facilityId?.getValue();
          if (facilityId) {
            useSelectionStore.getState().toggleFacility(facilityId);
            viewer.scene.requestRender();
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_CLICK);

    handler.setInputAction((event: { position: import('cesium').Cartesian2 }) => {
      const picked = viewer.scene.pick(event.position);
      if (defined(picked) && picked.id?.properties) {
        const type = picked.id.properties.type?.getValue();
        if (type === 'facility') {
          const facilityId = picked.id.properties.facilityId?.getValue();
          if (facilityId) {
            onFacilityClickRef.current(facilityId);
          }
        }
      }
    }, ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

    viewerRef.current = viewer;
    setViewer(viewer);

    return () => {
      handler.destroy();
      facilitiesLayerRef.current?.remove();
      infraLayerRef.current?.remove();
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [setViewer]);

  // Add/remove facilities layer
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !loaded) return;

    if (facilitiesEnabled && facilities.length > 0) {
      if (!facilitiesLayerRef.current) {
        const layer = new FacilitiesLayer();
        layer.add(viewer, facilities);
        facilitiesLayerRef.current = layer;
        viewer.scene.requestRender();
      }
    } else {
      facilitiesLayerRef.current?.remove();
      facilitiesLayerRef.current = null;
      viewer.scene.requestRender();
    }
  }, [loaded, facilities, facilitiesEnabled]);

  // Add/remove infrastructure layer
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer || !loaded) return;

    if (infraEnabled && (pipelines.length > 0 || chokepoints.length > 0)) {
      if (!infraLayerRef.current) {
        const layer = new InfrastructureLayer();
        layer.add(viewer, pipelines, chokepoints);
        infraLayerRef.current = layer;
        viewer.scene.requestRender();
      }
    } else {
      infraLayerRef.current?.remove();
      infraLayerRef.current = null;
      viewer.scene.requestRender();
    }
  }, [loaded, pipelines, chokepoints, infraEnabled]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
      }}
    />
  );
}
