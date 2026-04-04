import type { Viewer } from 'cesium';
import type { ReactNode } from 'react';
import type { ILayer, LayerEvent } from '../../types/layer';

export abstract class BaseLayer implements ILayer {
  id: string;
  name: string;
  icon: string;
  enabled: boolean;
  locked: boolean;
  protected viewer: Viewer | null = null;

  constructor(id: string, name: string, icon: string, options?: { enabled?: boolean; locked?: boolean }) {
    this.id = id;
    this.name = name;
    this.icon = icon;
    this.enabled = options?.enabled ?? false;
    this.locked = options?.locked ?? false;
  }

  onAdd(viewer: Viewer): void {
    this.viewer = viewer;
  }

  onRemove(): void {
    this.viewer = null;
  }

  onToggle(enabled: boolean): void {
    this.enabled = enabled;
  }

  renderPanel(): ReactNode | null {
    return null;
  }

  onEvent?(_event: LayerEvent): void;
}
