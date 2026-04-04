import { useEffect, useRef } from 'react';
import {
  Viewer,
  Ion,
  Terrain,
  Color,
  Cartesian3,
  Math as CesiumMath,
} from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useViewStore } from '../stores/viewStore';

export function Globe() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);
  const setViewer = useViewStore((s) => s.setViewer);

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
    });

    viewer.scene.backgroundColor = Color.fromCssColorString('#0a0e17');
    viewer.scene.globe.enableLighting = true;

    // Remove default credit display styling clutter
    viewer.cesiumWidget.creditContainer.setAttribute('style', 'display: none !important');

    // Set terrain
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

    viewerRef.current = viewer;
    setViewer(viewer);

    return () => {
      if (!viewer.isDestroyed()) {
        viewer.destroy();
      }
      viewerRef.current = null;
    };
  }, [setViewer]);

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
