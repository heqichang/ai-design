import { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Droplets,
  Box,
  CircleDot,
  Layers,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { useCanvasContext } from '@/contexts/CanvasContext';

interface PanelSectionProps {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function PanelSection({ title, icon: Icon, children, defaultOpen = true }: PanelSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-dark-700">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 w-full px-3 py-2.5 text-sm font-medium text-dark-200 hover:bg-dark-700/50"
      >
        <Icon className="h-4 w-4 text-dark-400" />
        <span>{title}</span>
        <div className="flex-1" />
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-dark-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-dark-400" />
        )}
      </button>
      {isOpen && <div className="px-3 pb-3">{children}</div>}
    </div>
  );
}

export default function PropertyPanel() {
  const {
    selectedObjects,
    updateFillColor,
    updateStrokeColor,
    updateStrokeWidth,
    updateOpacity,
    updateCornerRadius,
    updateObjectPosition,
    updateObjectSize,
    updateObjectProperty,
  } = useCanvasContext();

  const [fillColor, setFillColor] = useState('#6366f1');
  const [strokeColor, setStrokeColor] = useState('#ffffff');
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [opacity, setOpacity] = useState(100);
  const [cornerRadius, setCornerRadius] = useState(0);
  const [positionX, setPositionX] = useState(0);
  const [positionY, setPositionY] = useState(0);
  const [objectWidth, setObjectWidth] = useState(0);
  const [objectHeight, setObjectHeight] = useState(0);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    if (selectedObjects.length > 0) {
      const obj = selectedObjects[0];
      setFillColor((obj.fill as string) || '#6366f1');
      setStrokeColor((obj.stroke as string) || '#ffffff');
      setStrokeWidth(obj.strokeWidth || 0);
      setOpacity(Math.round((obj.opacity || 1) * 100));
      setPositionX(Math.round(obj.left || 0));
      setPositionY(Math.round(obj.top || 0));
      setObjectWidth(Math.round(obj.width || 0));
      setObjectHeight(Math.round(obj.height || 0));
      setRotation(Math.round(obj.angle || 0));
      
      if (obj.type === 'rect') {
        setCornerRadius((obj as any).rx || 0);
      }
    }
  }, [selectedObjects]);

  const handleFillColorChange = (color: string) => {
    setFillColor(color);
    updateFillColor(color);
  };

  const handleStrokeColorChange = (color: string) => {
    setStrokeColor(color);
    updateStrokeColor(color);
  };

  const handleStrokeWidthChange = (width: number) => {
    setStrokeWidth(width);
    updateStrokeWidth(width);
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    updateOpacity(value);
  };

  const handleCornerRadiusChange = (value: number) => {
    setCornerRadius(value);
    updateCornerRadius(value);
  };

  const handlePositionXChange = (value: number) => {
    setPositionX(value);
    updateObjectPosition(value, positionY);
  };

  const handlePositionYChange = (value: number) => {
    setPositionY(value);
    updateObjectPosition(positionX, value);
  };

  const handleWidthChange = (value: number) => {
    setObjectWidth(value);
    updateObjectSize(value, objectHeight);
  };

  const handleHeightChange = (value: number) => {
    setObjectHeight(value);
    updateObjectSize(objectWidth, value);
  };

  const handleRotationChange = (value: number) => {
    setRotation(value);
    updateObjectProperty('angle', value);
  };

  if (selectedObjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <div className="mb-3 rounded-full bg-dark-700 p-4">
          <Layers className="h-8 w-8 text-dark-500" />
        </div>
        <p className="text-sm text-dark-400">选择一个图层以编辑属性</p>
      </div>
    );
  }

  const isRectangle = selectedObjects[0]?.type === 'rect';

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-dark-700">
        <div className="text-sm font-medium text-dark-200">
          {selectedObjects.length > 1 
            ? `已选择 ${selectedObjects.length} 个对象`
            : `${selectedObjects[0]?.type || '对象'} 属性`
          }
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <PanelSection title="位置与大小" icon={Box}>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs text-dark-400 mb-1">X</label>
              <input
                type="number"
                value={positionX}
                onChange={(e) => handlePositionXChange(Number(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">Y</label>
              <input
                type="number"
                value={positionY}
                onChange={(e) => handlePositionYChange(Number(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">宽度</label>
              <input
                type="number"
                value={objectWidth}
                onChange={(e) => handleWidthChange(Number(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">高度</label>
              <input
                type="number"
                value={objectHeight}
                onChange={(e) => handleHeightChange(Number(e.target.value))}
                className="w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-dark-400 mb-1">旋转角度</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={rotation}
                  onChange={(e) => handleRotationChange(Number(e.target.value))}
                  className="flex-1 bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:border-primary-500 focus:outline-none"
                />
                <RotateCw className="h-4 w-4 text-dark-500" />
              </div>
            </div>
          </div>
        </PanelSection>

        <PanelSection title="填充" icon={Droplets}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={fillColor}
                onChange={(e) => handleFillColorChange(e.target.value)}
                className="p-0 border-0"
              />
              <input
                type="text"
                value={fillColor}
                onChange={(e) => handleFillColorChange(e.target.value)}
                className="flex-1 bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <select 
              className="w-full bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100"
              defaultValue="solid"
            >
              <option value="solid">纯色填充</option>
              <option value="none">无填充</option>
            </select>
          </div>
        </PanelSection>

        <PanelSection title="描边" icon={CircleDot}>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={strokeColor}
                onChange={(e) => handleStrokeColorChange(e.target.value)}
                className="p-0 border-0"
              />
              <input
                type="text"
                value={strokeColor}
                onChange={(e) => handleStrokeColorChange(e.target.value)}
                className="flex-1 bg-dark-700 border border-dark-600 rounded px-2 py-1.5 text-sm text-dark-100 focus:border-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs text-dark-400 mb-1">描边宽度</label>
              <input
                type="range"
                min="0"
                max="20"
                value={strokeWidth}
                onChange={(e) => handleStrokeWidthChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-right text-xs text-dark-400">{strokeWidth}px</div>
            </div>
          </div>
        </PanelSection>

        {isRectangle && (
          <PanelSection title="圆角" icon={Sparkles}>
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="100"
                value={cornerRadius}
                onChange={(e) => handleCornerRadiusChange(Number(e.target.value))}
                className="w-full"
              />
              <div className="text-right text-xs text-dark-400">{cornerRadius}px</div>
            </div>
          </PanelSection>
        )}

        <PanelSection title="不透明度" icon={Droplets}>
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={opacity}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              className="w-full"
            />
            <div className="text-right text-xs text-dark-400">{opacity}%</div>
          </div>
        </PanelSection>
      </div>
    </div>
  );
}
