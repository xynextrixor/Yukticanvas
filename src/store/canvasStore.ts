import { create } from 'zustand'

export type ShapeType = 'rect' | 'roundRect' | 'circle' | 'ellipse' | 'triangle' | 'diamond' | 'pentagon' | 'hexagon' | 'octagon' | 'star' | 'line' | 'arrow' | 'doubleArrow' | 'curvedArrow' | 'pencil' | 'brush' | 'highlight' | 'text' | 'sticky' | 'comment' | 'image' | 'frame' | 'connector' | 'laser' | 'eraser';

export interface Shape {
  id: string;
  type: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string; // legacy support
  fillColor?: string;
  strokeColor?: string;
  text?: string;
  stroke?: 'solid' | 'dashed' | 'none';
  strokeWidth?: number;
  flipX?: boolean;
  flipY?: boolean;
  opacity?: number;
  layer?: number;
  fromId?: string;
  fromPosition?: 't' | 'r' | 'b' | 'l' | 'center';
  toId?: string;
  toPosition?: 't' | 'r' | 'b' | 'l' | 'center';
  points?: { x: number; y: number }[];
  useVariableStroke?: boolean;
  layerId?: string;
}

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
}

export interface Viewport {
  x: number;
  y: number;
  zoom: number;
}

interface CanvasState {
  shapes: Shape[];
  viewport: Viewport;
  selectedShapeIds: string[];
  activeTool: ShapeType | 'select' | 'hand';
  isDrawing: boolean;
  draftShape: Shape | null;
  
  // Actions
  setShapes: (shapes: Shape[] | ((prev: Shape[]) => Shape[])) => void;
  addShape: (shape: Shape) => void;
  updateShape: (id: string, updates: Partial<Shape>) => void;
  deleteShapes: (ids: string[]) => void;
  
  setViewport: (viewport: Viewport | ((prev: Viewport) => Viewport)) => void;
  pan: (dx: number, dy: number) => void;
  zoom: (delta: number, cx: number, cy: number) => void;
  zoomToFit: (containerWidth: number, containerHeight: number) => void;
  
  setSelection: (ids: string[]) => void;
  setActiveTool: (tool: ShapeType | 'select' | 'hand') => void;
  setIsDrawing: (isDrawing: boolean) => void;
  setDraftShape: (shape: Shape | null) => void;

  // Layers states & actions
  layers: Layer[];
  activeLayerId: string;
  addLayer: (name: string) => void;
  updateLayer: (id: string, updates: Partial<Layer>) => void;
  deleteLayer: (id: string) => void;
  setActiveLayerId: (id: string) => void;
  setLayers: (layers: Layer[]) => void;
}

export const useCanvasStore = create<CanvasState>((set, get) => ({
  shapes: [
    { id: '1', type: 'rect', x: 400, y: 300, width: 200, height: 120, text: 'Brainstorming Session', color: '#f8f9fa', stroke: 'solid', layerId: 'default' },
    { id: '2', type: 'circle', x: 200, y: 300, width: 120, height: 120, color: '#FFD60A', stroke: 'solid', layerId: 'default' },
    { id: '3', type: 'sticky', x: 650, y: 250, width: 160, height: 160, text: 'Discuss Q3 goals here', color: '#ffec99', layerId: 'default' },
    { id: '4', type: 'arrow', x: 340, y: 360, width: 40, height: 1, color: '#111111', layerId: 'default' },
  ],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedShapeIds: [],
  activeTool: 'select',
  isDrawing: false,
  draftShape: null,

  setShapes: (shapes) => set((state) => ({
    shapes: typeof shapes === 'function' ? shapes(state.shapes) : shapes
  })),

  addShape: (shape) => set((state) => ({
    shapes: [...state.shapes, { ...shape, layerId: shape.layerId || state.activeLayerId }]
  })),

  updateShape: (id, updates) => set((state) => ({
    shapes: state.shapes.map(s => s.id === id ? { ...s, ...updates } : s)
  })),

  deleteShapes: (ids) => set((state) => ({
    shapes: state.shapes.filter(s => !ids.includes(s.id)),
    selectedShapeIds: state.selectedShapeIds.filter(id => !ids.includes(id))
  })),

  setViewport: (viewport) => set((state) => ({
    viewport: typeof viewport === 'function' ? viewport(state.viewport) : viewport
  })),

  pan: (dx, dy) => set((state) => ({
    viewport: {
      ...state.viewport,
      x: state.viewport.x + dx,
      y: state.viewport.y + dy
    }
  })),

  zoom: (delta, cx, cy) => set((state) => {
    const { x, y, zoom } = state.viewport;
    const newZoom = Math.max(0.01, Math.min(100, zoom * delta));
    
    // Calculate new translation to zoom towards (cx, cy)
    const scale = newZoom / zoom;
    const newX = cx - (cx - x) * scale;
    const newY = cy - (cy - y) * scale;

    return {
      viewport: { x: newX, y: newY, zoom: newZoom }
    };
  }),

  zoomToFit: (containerWidth: number, containerHeight: number) => set((state) => {
    const { shapes } = state;
    if (shapes.length === 0) return state;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    shapes.forEach(s => {
      minX = Math.min(minX, s.x);
      minY = Math.min(minY, s.y);
      maxX = Math.max(maxX, s.x + s.width);
      maxY = Math.max(maxY, s.y + s.height);
    });

    const contentWidth = maxX - minX;
    const contentHeight = maxY - minY;
    
    // Add 10% padding
    const paddingX = containerWidth * 0.1;
    const paddingY = containerHeight * 0.1;

    const availableWidth = containerWidth - paddingX * 2;
    const availableHeight = containerHeight - paddingY * 2;

    const scaleX = availableWidth / contentWidth;
    const scaleY = availableHeight / contentHeight;
    let zoom = Math.min(scaleX, scaleY);
    
    // Clamp zoom to reasonable values
    zoom = Math.max(0.1, Math.min(zoom, 2));

    const cx = minX + contentWidth / 2;
    const cy = minY + contentHeight / 2;

    const x = containerWidth / 2 - cx * zoom;
    const y = containerHeight / 2 - cy * zoom;

    return {
      viewport: { x, y, zoom }
    };
  }),

  setSelection: (ids) => set({ selectedShapeIds: ids }),
  setActiveTool: (tool) => set({ activeTool: tool }),
  setIsDrawing: (isDrawing) => set({ isDrawing }),
  setDraftShape: (shape) => set({ draftShape: shape }),

  // Layers Defaults
  layers: [
    { id: 'default', name: 'Background Layer', visible: true, locked: false }
  ],
  activeLayerId: 'default',

  addLayer: (name) => set((state) => {
    const newLayer: Layer = {
      id: Date.now().toString(),
      name,
      visible: true,
      locked: false
    };
    return {
      layers: [...state.layers, newLayer],
      activeLayerId: newLayer.id
    };
  }),

  updateLayer: (id, updates) => set((state) => ({
    layers: state.layers.map(l => l.id === id ? { ...l, ...updates } : l)
  })),

  deleteLayer: (id) => set((state) => {
    if (state.layers.length <= 1) return state; // Prevent deleting the last layer
    const filteredLayers = state.layers.filter(l => l.id !== id);
    const fallbackId = filteredLayers[0]?.id || 'default';
    const newActiveId = state.activeLayerId === id ? fallbackId : state.activeLayerId;

    const updatedShapes = state.shapes.map(s => 
      s.layerId === id ? { ...s, layerId: fallbackId } : s
    );

    return {
      layers: filteredLayers,
      activeLayerId: newActiveId,
      shapes: updatedShapes
    };
  }),

  setActiveLayerId: (id) => set({ activeLayerId: id }),
  setLayers: (layers) => set({ layers })
}));
