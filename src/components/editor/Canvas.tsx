import { useEffect, useRef, useState, useCallback } from 'react';
import { fabric } from 'fabric';
import { useFileStore } from '@/store/fileStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useUIStore } from '@/store/uiStore';
import { useCanvasContext } from '@/contexts/CanvasContext';

interface CanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

function createRegularPolygonPoints(radius: number, sides: number): { x: number; y: number }[] {
  const points: { x: number; y: number }[] = [];
  for (let i = 0; i < sides; i++) {
    const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
    points.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  }
  return points;
}

function createStarPoints(outerRadius: number, innerRadius: number, numPoints: number): { x: number; y: number }[] {
  const result: { x: number; y: number }[] = [];
  const total = numPoints * 2;
  for (let i = 0; i < total; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = (Math.PI * i) / numPoints - Math.PI / 2;
    result.push({
      x: radius * Math.cos(angle),
      y: radius * Math.sin(angle),
    });
  }
  return result;
}

export default function Canvas({ canvasRef }: CanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentFile, saveFile } = useFileStore();
  const { currentTool, canvasState, setZoom, setPan, setIsDrawing, setIsPanning, setCurrentTool } = useCanvasStore();
  const { addToast } = useUIStore();
  const { setCanvas, refreshLayers, saveCanvasToJSON, loadCanvasFromJSON } = useCanvasContext();
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const lastMousePosRef = useRef({ x: 0, y: 0 });
  const drawingObjectRef = useRef<fabric.Object | null>(null);
  const isDrawingRef = useRef(false);
  const canvasInitializedRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isPanningRef = useRef(false);

  const penStateRef = useRef<{
    isActive: boolean;
    points: { x: number; y: number }[];
    path: fabric.Path | null;
    layerId: string;
    layerName: string;
  }>({
    isActive: false,
    points: [],
    path: null,
    layerId: '',
    layerName: '',
  });

  const pencilStateRef = useRef<{
    isActive: boolean;
    points: { x: number; y: number }[];
    path: fabric.Path | null;
    layerId: string;
  }>({
    isActive: false,
    points: [],
    path: null,
    layerId: '',
  });

  const getCanvas = useCallback((): fabric.Canvas | undefined => {
    return (canvasRef.current as any)?.fabric;
  }, [canvasRef]);

  const saveWithDebounce = useCallback(() => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    saveTimeoutRef.current = setTimeout(async () => {
      if (currentFile && canvasInitializedRef.current) {
        const canvasData = saveCanvasToJSON();
        const updatedFile = {
          ...currentFile,
          artboards: currentFile.artboards.map((ab, i) =>
            i === 0 ? { ...ab, canvasData } : ab
          ),
        };
        await saveFile(updatedFile);
      }
    }, 1000);
  }, [currentFile, saveCanvasToJSON, saveFile]);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !currentFile) return;
    if (canvasInitializedRef.current) return;

    const canvas = new fabric.Canvas(canvasRef.current, {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
      backgroundColor: 'transparent',
      selection: true,
      preserveObjectStacking: true,
    });

    (canvasRef.current as any).fabric = canvas;
    setCanvas(canvas);
    canvasInitializedRef.current = true;

    const artboard = currentFile.artboards[0];
    if (artboard) {
      const rect = new fabric.Rect({
        left: artboard.x,
        top: artboard.y,
        width: artboard.width,
        height: artboard.height,
        fill: artboard.backgroundColor,
        selectable: false,
        evented: false,
        name: 'artboard',
      });
      canvas.add(rect);
      canvas.sendObjectToBack(rect);

      if ((artboard as any).canvasData) {
        loadCanvasFromJSON((artboard as any).canvasData).then(() => {
          canvas.sendObjectToBack(rect);
          canvas.forEachObject((obj) => {
            if ((obj as any).name === 'artboard') return;
            obj.set('selectable', currentTool === 'select');
            obj.set('evented', currentTool === 'select');
          });
          refreshLayers();
        });
      }
    }

    canvas.on('object:modified', () => {
      refreshLayers();
      saveWithDebounce();
    });

    canvas.on('object:added', () => {
      refreshLayers();
      saveWithDebounce();
    });

    canvas.on('object:removed', () => {
      refreshLayers();
      saveWithDebounce();
    });

    const handleResize = () => {
      if (containerRef.current) {
        canvas.setWidth(containerRef.current.clientWidth);
        canvas.setHeight(containerRef.current.clientHeight);
        canvas.requestRenderAll();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvasInitializedRef.current = false;
      setCanvas(null);
    };
  }, [currentFile?.id]);

  const updateObjectSelectable = useCallback((selectable: boolean) => {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.forEachObject((obj) => {
      if ((obj as any).name === 'artboard') return;
      obj.set('selectable', selectable);
      obj.set('evented', selectable);
    });
    canvas.requestRenderAll();
  }, [getCanvas]);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    if (currentTool === 'select') {
      canvas.defaultCursor = 'default';
      canvas.selection = true;
      updateObjectSelectable(true);
    } else if (currentTool === 'hand' || isSpacePressed) {
      canvas.defaultCursor = 'grab';
      canvas.selection = false;
      updateObjectSelectable(false);
    } else if (currentTool === 'pen' || currentTool === 'pencil') {
      canvas.defaultCursor = 'crosshair';
      canvas.selection = false;
      canvas.discardActiveObject();
      updateObjectSelectable(false);
    } else {
      canvas.defaultCursor = 'crosshair';
      canvas.selection = false;
      canvas.discardActiveObject();
      updateObjectSelectable(false);
    }
  }, [currentTool, isSpacePressed, getCanvas, updateObjectSelectable]);

  useEffect(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    canvas.setZoom(canvasState.zoom);
    canvas.setViewportTransform([
      canvasState.zoom,
      0,
      0,
      canvasState.zoom,
      canvasState.panX,
      canvasState.panY,
    ]);
    canvas.requestRenderAll();
  }, [canvasState.zoom, canvasState.panX, canvasState.panY, getCanvas]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || (activeEl as any).isContentEditable)) {
        return;
      }

      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setIsSpacePressed(true);
        setIsPanning(true);
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        const canvas = getCanvas();
        if (canvas) {
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length > 0) {
            activeObjects.forEach((obj) => {
              if ((obj as any).name !== 'artboard') {
                canvas.remove(obj);
              }
            });
            canvas.discardActiveObject();
            canvas.requestRenderAll();
          }
        }
      }

      if (e.key === 'Escape') {
        if (penStateRef.current.isActive) {
          finishPenPath(false);
        }
      }

      if (!e.ctrlKey && !e.metaKey && !e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'v':
            if (penStateRef.current.isActive) {
              finishPenPath(false);
            }
            setCurrentTool('select');
            break;
          case 'r':
            if (penStateRef.current.isActive) {
              finishPenPath(false);
            }
            setCurrentTool('rect');
            break;
          case 'o':
            if (penStateRef.current.isActive) {
              finishPenPath(false);
            }
            setCurrentTool('circle');
            break;
          case 't':
            if (penStateRef.current.isActive) {
              finishPenPath(false);
            }
            setCurrentTool('text');
            break;
          case 'h':
            if (penStateRef.current.isActive) {
              finishPenPath(false);
            }
            setCurrentTool('hand');
            break;
          case 'p':
            setCurrentTool('pen');
            break;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (penStateRef.current.isActive) {
        e.preventDefault();
        finishPenPath(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [getCanvas, setCurrentTool]);

  const finishPenPath = useCallback((keepPath: boolean) => {
    const canvas = getCanvas();
    if (!canvas) return;

    const state = penStateRef.current;
    if (state.path) {
      if (keepPath && state.points.length >= 2) {
        state.path.setCoords();
        canvas.setActiveObject(state.path);
      } else if (!keepPath) {
        canvas.remove(state.path);
      }
    }
    penStateRef.current = { isActive: false, points: [], path: null, layerId: '', layerName: '' };
    setCurrentTool('select');
  }, [getCanvas, setCurrentTool]);

  const finishPencilPath = useCallback(() => {
    const canvas = getCanvas();
    if (!canvas) return;

    const state = pencilStateRef.current;
    if (state.path && state.points.length >= 2) {
      state.path.setCoords();
      canvas.setActiveObject(state.path);
    } else if (state.path) {
      canvas.remove(state.path);
    }
    pencilStateRef.current = { isActive: false, points: [], path: null, layerId: '' };
    setCurrentTool('select');
  }, [getCanvas, setCurrentTool]);

  const rebuildPath = useCallback((points: { x: number; y: number }[]): string => {
    if (points.length === 0) return '';
    if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      d += ` L ${points[i].x} ${points[i].y}`;
    }
    return d;
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = getCanvas();
    if (!canvas) return;

    const evt = e.nativeEvent;
    lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };

    if (currentTool === 'hand' || isSpacePressed) {
      canvas.defaultCursor = 'grabbing';
      isPanningRef.current = true;
      return;
    }

    if (currentTool === 'select') {
      return;
    }

    const pointer = canvas.getPointer(evt);
    const layerId = generateId();

    if (currentTool === 'pen') {
      const state = penStateRef.current;
      if (!state.isActive) {
        penStateRef.current = {
          isActive: true,
          points: [{ x: pointer.x, y: pointer.y }],
          path: null,
          layerId,
          layerName: `路径 ${Math.floor(Math.random() * 100)}`,
        };

        const pathData = `M ${pointer.x} ${pointer.y}`;
        const path = new fabric.Path(pathData, {
          stroke: '#f1f5f9',
          strokeWidth: 2,
          fill: null,
          opacity: 1,
        });
        (path as any).layerId = layerId;
        (path as any).layerType = 'path';
        (path as any).layerName = penStateRef.current.layerName;
        penStateRef.current.path = path;
        canvas.add(path);
      } else {
        const dist = Math.sqrt(
          Math.pow(pointer.x - state.points[0].x, 2) +
          Math.pow(pointer.y - state.points[0].y, 2)
        );

        if (dist < 10 && state.points.length >= 2) {
          finishPenPath(true);
          return;
        }

        state.points.push({ x: pointer.x, y: pointer.y });

        const pathData = rebuildPath(state.points);
        if (state.path) {
          canvas.remove(state.path);
        }
        const newPath = new fabric.Path(pathData, {
          stroke: '#f1f5f9',
          strokeWidth: 2,
          fill: null,
          opacity: 1,
        });
        (newPath as any).layerId = state.layerId;
        (newPath as any).layerType = 'path';
        (newPath as any).layerName = state.layerName;
        state.path = newPath;
        canvas.add(newPath);
      }
      return;
    }

    if (currentTool === 'pencil') {
      pencilStateRef.current = {
        isActive: true,
        points: [{ x: pointer.x, y: pointer.y }],
        path: null,
        layerId,
      };

      const pathData = `M ${pointer.x} ${pointer.y}`;
      const path = new fabric.Path(pathData, {
        stroke: '#f1f5f9',
        strokeWidth: 2,
        fill: null,
        opacity: 1,
      });
      (path as any).layerId = layerId;
      (path as any).layerType = 'path';
      (path as any).layerName = `铅笔 ${Math.floor(Math.random() * 100)}`;
      pencilStateRef.current.path = path;
      drawingObjectRef.current = path;
      canvas.add(path);
      isDrawingRef.current = true;
      setIsDrawing(true);
      return;
    }

    isDrawingRef.current = true;
    setIsDrawing(true);

    let fabricObject: fabric.Object | null = null;

    switch (currentTool) {
      case 'rect': {
        const rect = new fabric.Rect({
          left: pointer.x,
          top: pointer.y,
          width: 1,
          height: 1,
          fill: '#6366f1',
          stroke: null,
          strokeWidth: 0,
          opacity: 1,
        });
        (rect as any).layerId = layerId;
        (rect as any).layerType = 'rect';
        (rect as any).layerName = `矩形 ${Math.floor(Math.random() * 100)}`;
        (rect as any).startX = pointer.x;
        (rect as any).startY = pointer.y;
        fabricObject = rect;
        break;
      }
      case 'circle': {
        const circle = new fabric.Circle({
          left: pointer.x,
          top: pointer.y,
          radius: 1,
          fill: '#06b6d4',
          stroke: null,
          strokeWidth: 0,
          opacity: 1,
        });
        (circle as any).layerId = layerId;
        (circle as any).layerType = 'circle';
        (circle as any).layerName = `圆形 ${Math.floor(Math.random() * 100)}`;
        (circle as any).startX = pointer.x;
        (circle as any).startY = pointer.y;
        fabricObject = circle;
        break;
      }
      case 'polygon': {
        const initialRadius = 50;
        const sides = 6;
        const points = createRegularPolygonPoints(initialRadius, sides);
        const polygon = new fabric.Polygon(points, {
          left: pointer.x - initialRadius,
          top: pointer.y - initialRadius,
          fill: '#f59e0b',
          stroke: null,
          strokeWidth: 0,
          opacity: 1,
        });
        (polygon as any).layerId = layerId;
        (polygon as any).layerType = 'polygon';
        (polygon as any).layerName = `多边形 ${Math.floor(Math.random() * 100)}`;
        (polygon as any).startX = pointer.x;
        (polygon as any).startY = pointer.y;
        (polygon as any).startRadius = initialRadius;
        (polygon as any).sides = sides;
        fabricObject = polygon;
        break;
      }
      case 'star': {
        const initialOuter = 50;
        const initialInner = 25;
        const numPoints = 5;
        const points = createStarPoints(initialOuter, initialInner, numPoints);
        const star = new fabric.Polygon(points, {
          left: pointer.x - initialOuter,
          top: pointer.y - initialOuter,
          fill: '#ec4899',
          stroke: null,
          strokeWidth: 0,
          opacity: 1,
        });
        (star as any).layerId = layerId;
        (star as any).layerType = 'star';
        (star as any).layerName = `星形 ${Math.floor(Math.random() * 100)}`;
        (star as any).startX = pointer.x;
        (star as any).startY = pointer.y;
        (star as any).outerRadius = initialOuter;
        (star as any).innerRadius = initialInner;
        (star as any).numPoints = numPoints;
        fabricObject = star;
        break;
      }
      case 'text': {
        const textbox = new fabric.Textbox('双击编辑文本', {
          left: pointer.x,
          top: pointer.y,
          width: 200,
          fontSize: 16,
          fontFamily: 'Inter',
          fill: '#f1f5f9',
          opacity: 1,
        });
        (textbox as any).layerId = layerId;
        (textbox as any).layerType = 'text';
        (textbox as any).layerName = `文本 ${Math.floor(Math.random() * 100)}`;
        canvas.add(textbox);
        canvas.setActiveObject(textbox);
        textbox.enterEditing();
        textbox.selectAll();
        isDrawingRef.current = false;
        setIsDrawing(false);
        setCurrentTool('select');
        return;
      }
      case 'line': {
        const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#f1f5f9',
          strokeWidth: 2,
          opacity: 1,
        });
        (line as any).layerId = layerId;
        (line as any).layerType = 'line';
        (line as any).layerName = `直线 ${Math.floor(Math.random() * 100)}`;
        (line as any).startX = pointer.x;
        (line as any).startY = pointer.y;
        fabricObject = line;
        break;
      }
      case 'arrow': {
        const line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
          stroke: '#f1f5f9',
          strokeWidth: 2,
          opacity: 1,
        });
        (line as any).layerId = layerId;
        (line as any).layerType = 'arrow';
        (line as any).layerName = `箭头 ${Math.floor(Math.random() * 100)}`;
        (line as any).startX = pointer.x;
        (line as any).startY = pointer.y;
        fabricObject = line;
        break;
      }
      default:
        isDrawingRef.current = false;
        setIsDrawing(false);
        return;
    }

    if (fabricObject) {
      drawingObjectRef.current = fabricObject;
      canvas.add(fabricObject);
      canvas.setActiveObject(fabricObject);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = getCanvas();
    if (!canvas) return;

    const evt = e.nativeEvent;

    if (currentTool === 'hand' || isSpacePressed) {
      if (isPanningRef.current) {
        const dx = evt.clientX - lastMousePosRef.current.x;
        const dy = evt.clientY - lastMousePosRef.current.y;
        setPan(canvasState.panX + dx, canvasState.panY + dy);
      }
      lastMousePosRef.current = { x: evt.clientX, y: evt.clientY };
      return;
    }

    if (currentTool === 'pen' && penStateRef.current.isActive && penStateRef.current.path) {
      const state = penStateRef.current;
      const pointer = canvas.getPointer(evt);
      const previewPoints = [...state.points, { x: pointer.x, y: pointer.y }];
      const pathData = rebuildPath(previewPoints);

      canvas.remove(state.path);
      const newPath = new fabric.Path(pathData, {
        stroke: '#f1f5f9',
        strokeWidth: 2,
        fill: null,
        opacity: 1,
      });
      (newPath as any).layerId = state.layerId;
      (newPath as any).layerType = 'path';
      (newPath as any).layerName = state.layerName;
      state.path = newPath;
      canvas.add(newPath);
      canvas.requestRenderAll();
      return;
    }

    if (currentTool === 'pencil' && pencilStateRef.current.isActive && pencilStateRef.current.path) {
      const state = pencilStateRef.current;
      const pointer = canvas.getPointer(evt);
      state.points.push({ x: pointer.x, y: pointer.y });

      const pathData = rebuildPath(state.points);
      canvas.remove(state.path);
      const newPath = new fabric.Path(pathData, {
        stroke: '#f1f5f9',
        strokeWidth: 2,
        fill: null,
        opacity: 1,
      });
      (newPath as any).layerId = state.layerId;
      (newPath as any).layerType = 'path';
      (newPath as any).layerName = (state.path as any)?.layerName || `铅笔`;
      state.path = newPath;
      canvas.add(newPath);
      canvas.requestRenderAll();
      return;
    }

    if (!isDrawingRef.current || !drawingObjectRef.current) return;

    const pointer = canvas.getPointer(evt);
    const obj = drawingObjectRef.current;
    const startX = (obj as any).startX || 0;
    const startY = (obj as any).startY || 0;

    if (obj.type === 'rect') {
      const rect = obj as fabric.Rect;
      const width = Math.abs(pointer.x - startX);
      const height = Math.abs(pointer.y - startY);
      rect.set({
        left: Math.min(startX, pointer.x),
        top: Math.min(startY, pointer.y),
        width: Math.max(width, 1),
        height: Math.max(height, 1),
      });
      rect.setCoords();
    } else if (obj.type === 'circle') {
      const circle = obj as fabric.Circle;
      const dx = pointer.x - startX;
      const dy = pointer.y - startY;
      const radius = Math.sqrt(dx * dx + dy * dy) / 2;
      circle.set({
        left: startX - radius + dx / 2,
        top: startY - radius + dy / 2,
        radius: Math.max(radius, 1),
      });
      circle.setCoords();
    } else if (obj.type === 'line') {
      const line = obj as fabric.Line;
      line.set({ x2: pointer.x, y2: pointer.y });
      line.setCoords();
    } else if (obj.type === 'polygon') {
      const layerType = (obj as any).layerType;
      const dx = pointer.x - startX;
      const dy = pointer.y - startY;
      const newRadius = Math.max(Math.sqrt(dx * dx + dy * dy) / 2, 10);

      if (layerType === 'star') {
        const outerRadius = newRadius;
        const innerRadius = newRadius * 0.5;
        const numPoints = (obj as any).numPoints || 5;
        const points = createStarPoints(outerRadius, innerRadius, numPoints);
        (obj as fabric.Polygon).set({
          left: startX - outerRadius,
          top: startY - outerRadius,
          points,
        });
      } else {
        const sides = (obj as any).sides || 6;
        const points = createRegularPolygonPoints(newRadius, sides);
        (obj as fabric.Polygon).set({
          left: startX - newRadius,
          top: startY - newRadius,
          points,
        });
      }
      obj.setCoords();
    }

    canvas.requestRenderAll();
  };

  const handleMouseUp = () => {
    const canvas = getCanvas();
    if (!canvas) return;

    isPanningRef.current = false;

    if (isDrawingRef.current && currentTool !== 'pen') {
      isDrawingRef.current = false;
      setIsDrawing(false);
      drawingObjectRef.current = null;

      if (currentTool === 'pencil') {
        finishPencilPath();
      } else if (currentTool !== 'select') {
        setCurrentTool('select');
      }
    }

    if ((currentTool === 'hand' || isSpacePressed) && !isPanningRef.current) {
      canvas.defaultCursor = 'grab';
    }
  };

  const handleMouseLeave = () => {
    isPanningRef.current = false;
    handleMouseUp();
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (currentTool === 'pen' && penStateRef.current.isActive) {
      e.preventDefault();
      e.stopPropagation();
      if (penStateRef.current.points.length >= 2) {
        finishPenPath(true);
      } else {
        finishPenPath(false);
      }
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newZoom = Math.min(Math.max(canvasState.zoom + delta, 0.1), 5);
    setZoom(newZoom);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full checkerboard overflow-hidden"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />

      {canvasState.showRulers && currentFile && (
        <>
          <div className="absolute top-0 left-12 right-0 h-5 bg-dark-800 border-b border-dark-600 flex items-end text-[10px] text-dark-400 overflow-hidden pointer-events-none">
            {Array.from({ length: Math.ceil(currentFile.width / 50) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute bottom-0 border-l border-dark-600 pl-1"
                style={{ left: `${currentFile.artboards[0].x + i * 50 * canvasState.zoom + canvasState.panX}px` }}
              >
                {i * 50}
              </div>
            ))}
          </div>
          <div className="absolute top-5 left-0 w-12 bottom-0 bg-dark-800 border-r border-dark-600 flex flex-col items-end text-[10px] text-dark-400 overflow-hidden pointer-events-none">
            {Array.from({ length: Math.ceil(currentFile.height / 50) + 1 }).map((_, i) => (
              <div
                key={i}
                className="absolute right-0 border-t border-dark-600 pr-1"
                style={{ top: `${currentFile.artboards[0].y + i * 50 * canvasState.zoom + canvasState.panY}px` }}
              >
                {i * 50}
              </div>
            ))}
          </div>
        </>
      )}

      {currentTool === 'pen' && penStateRef.current.isActive && (
        <div className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-dark-800 border border-dark-600 rounded-lg px-3 py-1.5 text-xs text-dark-300 pointer-events-none">
          点击添加锚点 • 双击/Esc/右键 结束 • 点击起点闭合路径
        </div>
      )}
    </div>
  );
}
