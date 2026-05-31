import { createContext, useContext, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import type { Layer } from '@/types';

interface CanvasContextType {
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  layers: Layer[];
  refreshLayers: () => void;
  selectedObjects: fabric.Object[];
  selectedLayerIds: string[];
  updateObjectProperty: (property: string, value: any) => void;
  updateFillColor: (color: string) => void;
  updateStrokeColor: (color: string) => void;
  updateStrokeWidth: (width: number) => void;
  updateOpacity: (opacity: number) => void;
  updateCornerRadius: (radius: number) => void;
  updateObjectPosition: (left: number, top: number) => void;
  updateObjectSize: (width: number, height: number) => void;
  deleteSelected: () => void;
  bringForward: (layerId: string) => void;
  sendBackward: (layerId: string) => void;
  bringToFront: (layerId: string) => void;
  sendToBack: (layerId: string) => void;
  toggleLayerVisibility: (layerId: string) => void;
  toggleLayerLock: (layerId: string) => void;
  selectLayer: (layerId: string, addToSelection?: boolean) => void;
  saveCanvasToJSON: () => string;
  loadCanvasFromJSON: (json: string) => Promise<void>;
}

const CanvasContext = createContext<CanvasContextType | null>(null);

function findObjectByLayerId(canvas: fabric.Canvas, layerId: string): fabric.Object | null {
  let found: fabric.Object | null = null;
  canvas.forEachObject((obj) => {
    if ((obj as any).layerId === layerId) {
      found = obj;
    }
  });
  return found;
}

export function CanvasProvider({ children }: { children: React.ReactNode }) {
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const [canvasInstance, setCanvasInstance] = useState<fabric.Canvas | null>(null);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedObjects, setSelectedObjects] = useState<fabric.Object[]>([]);
  const [selectedLayerIds, setSelectedLayerIds] = useState<string[]>([]);

  const setCanvas = useCallback((canvas: fabric.Canvas | null) => {
    canvasRef.current = canvas;
    setCanvasInstance(canvas);

    if (canvas) {
      canvas.on('selection:created', (e) => {
        const objs = e.selected || [];
        setSelectedObjects(objs);
        setSelectedLayerIds(objs.map((obj) => (obj as any).layerId || '').filter(Boolean));
      });

      canvas.on('selection:updated', (e) => {
        const objs = e.selected || [];
        setSelectedObjects(objs);
        setSelectedLayerIds(objs.map((obj) => (obj as any).layerId || '').filter(Boolean));
      });

      canvas.on('selection:cleared', () => {
        setSelectedObjects([]);
        setSelectedLayerIds([]);
      });
    }
  }, []);

  const refreshLayers = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const newLayers: Layer[] = [];
    const objects = canvas.getObjects();

    for (let i = objects.length - 1; i >= 0; i--) {
      const obj = objects[i];
      if ((obj as any).name === 'artboard') continue;

      newLayers.push({
        id: (obj as any).layerId || '',
        type: (obj as any).layerType || obj.type || 'rect',
        name: (obj as any).layerName || `${obj.type}`,
        visible: obj.visible ?? true,
        locked: !obj.selectable,
        x: obj.left || 0,
        y: obj.top || 0,
        width: obj.width || 0,
        height: obj.height || 0,
        rotation: obj.angle || 0,
        opacity: (obj.opacity ?? 1) * 100,
        blendMode: 'normal',
        fill: { type: 'solid', color: (obj.fill as string) || '#6366f1' },
        stroke: {
          enabled: !!obj.stroke,
          color: (obj.stroke as string) || '#ffffff',
          width: obj.strokeWidth || 0,
          lineCap: 'round',
          lineJoin: 'round',
        },
        shadow: {
          enabled: false,
          type: 'drop',
          color: '#000000',
          offsetX: 0,
          offsetY: 0,
          blur: 0,
          spread: 0,
        },
        radius: 0,
      } as Layer);
    }

    setLayers(newLayers);
  }, []);

  const updateObjectProperty = useCallback((property: string, value: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length === 0) return;

    activeObjects.forEach((obj) => {
      obj.set(property as any, value);
      obj.setCoords();
    });

    canvas.requestRenderAll();
    refreshLayers();
  }, [refreshLayers]);

  const updateFillColor = useCallback((color: string) => {
    updateObjectProperty('fill', color);
  }, [updateObjectProperty]);

  const updateStrokeColor = useCallback((color: string) => {
    updateObjectProperty('stroke', color);
  }, [updateObjectProperty]);

  const updateStrokeWidth = useCallback((width: number) => {
    updateObjectProperty('strokeWidth', width);
  }, [updateObjectProperty]);

  const updateOpacity = useCallback((opacity: number) => {
    updateObjectProperty('opacity', opacity / 100);
  }, [updateObjectProperty]);

  const updateCornerRadius = useCallback((radius: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj) => {
      if (obj.type === 'rect') {
        (obj as fabric.Rect).set({ rx: radius, ry: radius });
        obj.setCoords();
      }
    });

    canvas.requestRenderAll();
    refreshLayers();
  }, [refreshLayers]);

  const updateObjectPosition = useCallback((left: number, top: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ left, top });
      activeObject.setCoords();
      canvas.requestRenderAll();
      refreshLayers();
    }
  }, [refreshLayers]);

  const updateObjectSize = useCallback((width: number, height: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObject = canvas.getActiveObject();
    if (activeObject) {
      activeObject.set({ width, height });
      activeObject.setCoords();
      canvas.requestRenderAll();
      refreshLayers();
    }
  }, [refreshLayers]);

  const deleteSelected = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const activeObjects = canvas.getActiveObjects();
    activeObjects.forEach((obj) => {
      if ((obj as any).name !== 'artboard') {
        canvas.remove(obj);
      }
    });
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    refreshLayers();
  }, [refreshLayers]);

  const bringForward = useCallback((layerId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obj = findObjectByLayerId(canvas, layerId);
    if (!obj) return;

    const objects = canvas.getObjects();
    const currentIndex = objects.indexOf(obj);
    const artboardIndex = objects.findIndex((o) => (o as any).name === 'artboard');

    if (currentIndex < objects.length - 1) {
      if (typeof canvas.moveObjectForward === 'function') {
        canvas.moveObjectForward(obj, false);
      } else if (typeof canvas.bringObjectForward === 'function') {
        canvas.bringObjectForward(obj, false);
      } else {
        canvas.moveTo(obj, currentIndex + 1);
      }
      canvas.requestRenderAll();
      refreshLayers();
    }
  }, [refreshLayers]);

  const sendBackward = useCallback((layerId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obj = findObjectByLayerId(canvas, layerId);
    if (!obj) return;

    const objects = canvas.getObjects();
    const currentIndex = objects.indexOf(obj);
    const artboardIndex = objects.findIndex((o) => (o as any).name === 'artboard');

    if (currentIndex > artboardIndex + 1) {
      if (typeof canvas.sendObjectBackwards === 'function') {
        canvas.sendObjectBackwards(obj, false);
      } else {
        canvas.moveTo(obj, currentIndex - 1);
      }
      canvas.requestRenderAll();
      refreshLayers();
    }
  }, [refreshLayers]);

  const bringToFront = useCallback((layerId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obj = findObjectByLayerId(canvas, layerId);
    if (obj) {
      if (typeof canvas.bringObjectToFront === 'function') {
        canvas.bringObjectToFront(obj);
      } else {
        const objects = canvas.getObjects();
        canvas.moveTo(obj, objects.length - 1);
      }
      canvas.requestRenderAll();
      refreshLayers();
    }
  }, [refreshLayers]);

  const sendToBack = useCallback((layerId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obj = findObjectByLayerId(canvas, layerId);
    if (!obj) return;

    const objects = canvas.getObjects();
    const artboard = objects.find((o) => (o as any).name === 'artboard');
    const artboardIndex = objects.indexOf(artboard);
    
    canvas.moveTo(obj, artboardIndex + 1);
    canvas.requestRenderAll();
    refreshLayers();
  }, [refreshLayers]);

  const toggleLayerVisibility = useCallback((layerId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obj = findObjectByLayerId(canvas, layerId);
    if (obj) {
      obj.set('visible', !obj.visible);
      canvas.requestRenderAll();
      refreshLayers();
    }
  }, [refreshLayers]);

  const toggleLayerLock = useCallback((layerId: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obj = findObjectByLayerId(canvas, layerId);
    if (obj) {
      const isCurrentlyLocked = !obj.selectable;
      obj.set('selectable', isCurrentlyLocked);
      obj.set('evented', isCurrentlyLocked);
      canvas.requestRenderAll();
      refreshLayers();
    }
  }, [refreshLayers]);

  const selectLayer = useCallback((layerId: string, addToSelection = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const obj = findObjectByLayerId(canvas, layerId);
    if (!obj) return;

    if (addToSelection) {
      const current = canvas.getActiveObjects();
      const alreadySelected = current.some((o) => (o as any).layerId === layerId);
      if (alreadySelected) return;
      const newSelection = [...current, obj];
      canvas.setActiveObject(new fabric.ActiveSelection(newSelection, { canvas }));
    } else {
      canvas.setActiveObject(obj);
    }
    canvas.requestRenderAll();
  }, []);

  const saveCanvasToJSON = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return '{}';
    return JSON.stringify(canvas.toJSON(['layerId', 'layerType', 'layerName', 'name']));
  }, []);

  const loadCanvasFromJSON = useCallback(async (json: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    return new Promise<void>((resolve) => {
      canvas.loadFromJSON(json, () => {
        canvas.requestRenderAll();
        refreshLayers();
        resolve();
      });
    });
  }, [refreshLayers]);

  return (
    <CanvasContext.Provider
      value={{
        canvas: canvasInstance,
        setCanvas,
        layers,
        refreshLayers,
        selectedObjects,
        selectedLayerIds,
        updateObjectProperty,
        updateFillColor,
        updateStrokeColor,
        updateStrokeWidth,
        updateOpacity,
        updateCornerRadius,
        updateObjectPosition,
        updateObjectSize,
        deleteSelected,
        bringForward,
        sendBackward,
        bringToFront,
        sendToBack,
        toggleLayerVisibility,
        toggleLayerLock,
        selectLayer,
        saveCanvasToJSON,
        loadCanvasFromJSON,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
}

export function useCanvasContext() {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvasContext must be used within CanvasProvider');
  }
  return context;
}
