import { create } from 'zustand';
import type { ToolType, CanvasState, Layer, HistoryState } from '@/types';

interface CanvasStore {
  currentTool: ToolType;
  selectedLayerIds: string[];
  canvasState: CanvasState;
  history: HistoryState;
  isDrawing: boolean;
  isPanning: boolean;
  isDragging: boolean;
  setCurrentTool: (tool: ToolType) => void;
  setSelectedLayerIds: (ids: string[]) => void;
  addSelectedLayerId: (id: string) => void;
  removeSelectedLayerId: (id: string) => void;
  clearSelection: () => void;
  setZoom: (zoom: number) => void;
  setPan: (x: number, y: number) => void;
  toggleRulers: () => void;
  toggleGrid: () => void;
  toggleSmartGuides: () => void;
  setIsDrawing: (value: boolean) => void;
  setIsPanning: (value: boolean) => void;
  setIsDragging: (value: boolean) => void;
  saveHistory: (layers: Layer[]) => void;
  undo: () => Layer[] | null;
  redo: () => Layer[] | null;
  resetCanvas: () => void;
}

const initialCanvasState: CanvasState = {
  zoom: 1,
  panX: 0,
  panY: 0,
  showRulers: true,
  showGrid: false,
  snapToGrid: false,
  smartGuides: true,
};

const initialHistory: HistoryState = {
  past: [],
  present: JSON.stringify([]),
  future: [],
  maxHistory: 50,
};

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  currentTool: 'select',
  selectedLayerIds: [],
  canvasState: initialCanvasState,
  history: initialHistory,
  isDrawing: false,
  isPanning: false,
  isDragging: false,

  setCurrentTool: (tool) => set({ currentTool: tool }),

  setSelectedLayerIds: (ids) => set({ selectedLayerIds: ids }),

  addSelectedLayerId: (id) =>
    set((state) => ({
      selectedLayerIds: state.selectedLayerIds.includes(id)
        ? state.selectedLayerIds
        : [...state.selectedLayerIds, id],
    })),

  removeSelectedLayerId: (id) =>
    set((state) => ({
      selectedLayerIds: state.selectedLayerIds.filter((i) => i !== id),
    })),

  clearSelection: () => set({ selectedLayerIds: [] }),

  setZoom: (zoom) =>
    set((state) => ({
      canvasState: { ...state.canvasState, zoom: Math.min(Math.max(zoom, 0.1), 5) },
    })),

  setPan: (x, y) =>
    set((state) => ({
      canvasState: { ...state.canvasState, panX: x, panY: y },
    })),

  toggleRulers: () =>
    set((state) => ({
      canvasState: { ...state.canvasState, showRulers: !state.canvasState.showRulers },
    })),

  toggleGrid: () =>
    set((state) => ({
      canvasState: { ...state.canvasState, showGrid: !state.canvasState.showGrid },
    })),

  toggleSmartGuides: () =>
    set((state) => ({
      canvasState: { ...state.canvasState, smartGuides: !state.canvasState.smartGuides },
    })),

  setIsDrawing: (value) => set({ isDrawing: value }),
  setIsPanning: (value) => set({ isPanning: value }),
  setIsDragging: (value) => set({ isDragging: value }),

  saveHistory: (layers) => {
    const { history } = get();
    const present = JSON.stringify(layers);
    const newPast = [...history.past, history.present].slice(-history.maxHistory);
    
    set({
      history: {
        ...history,
        past: newPast,
        present,
        future: [],
      },
    });
  },

  undo: () => {
    const { history } = get();
    if (history.past.length === 0) return null;
    
    const newPast = [...history.past];
    const previous = newPast.pop()!;
    const newFuture = [history.present, ...history.future];
    
    set({
      history: {
        ...history,
        past: newPast,
        present: previous,
        future: newFuture,
      },
    });
    
    return JSON.parse(previous);
  },

  redo: () => {
    const { history } = get();
    if (history.future.length === 0) return null;
    
    const newFuture = [...history.future];
    const next = newFuture.shift()!;
    const newPast = [...history.past, history.present];
    
    set({
      history: {
        ...history,
        past: newPast,
        present: next,
        future: newFuture,
      },
    });
    
    return JSON.parse(next);
  },

  resetCanvas: () =>
    set({
      canvasState: initialCanvasState,
      selectedLayerIds: [],
      currentTool: 'select',
    }),
}));
