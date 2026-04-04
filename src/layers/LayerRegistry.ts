import type { ILayer, LayerEvent } from '../types/layer';

class LayerRegistryClass {
  private layers = new Map<string, ILayer>();

  registerLayer(layer: ILayer): void {
    this.layers.set(layer.id, layer);
  }

  getLayer(id: string): ILayer | undefined {
    return this.layers.get(id);
  }

  getLayers(): ILayer[] {
    return Array.from(this.layers.values());
  }

  toggleLayer(id: string): void {
    const layer = this.layers.get(id);
    if (layer && !layer.locked) {
      layer.enabled = !layer.enabled;
      layer.onToggle(layer.enabled);
    }
  }

  broadcastEvent(event: LayerEvent): void {
    for (const layer of this.layers.values()) {
      layer.onEvent?.(event);
    }
  }
}

export const LayerRegistry = new LayerRegistryClass();
