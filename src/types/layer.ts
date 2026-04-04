import type { Viewer } from 'cesium';
import type { ReactNode } from 'react';

export interface LayerEvent {
  type: string;
  payload: unknown;
  source: string;
}

export interface ILayer {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  locked: boolean;

  onAdd(viewer: Viewer): void;
  onRemove(): void;
  onToggle(enabled: boolean): void;
  renderPanel(): ReactNode | null;
  onEvent?(event: LayerEvent): void;
}
