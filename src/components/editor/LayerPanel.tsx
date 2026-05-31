import {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Trash2,
  ChevronUp,
  ChevronDown,
  Square,
  Circle,
  Type,
  Minus,
  Layers,
  Pentagon,
  Star,
  Pen,
} from 'lucide-react';
import { useCanvasContext } from '@/contexts/CanvasContext';

const layerIcons: Record<string, any> = {
  rect: Square,
  circle: Circle,
  ellipse: Circle,
  text: Type,
  textbox: Type,
  line: Minus,
  polygon: Pentagon,
  star: Star,
  path: Pen,
  group: Layers,
};

export default function LayerPanel() {
  const {
    layers,
    selectedLayerIds,
    selectLayer,
    toggleLayerVisibility,
    toggleLayerLock,
    deleteSelected,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
  } = useCanvasContext();

  const handleLayerClick = (id: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey) {
      selectLayer(id, true);
    } else {
      selectLayer(id, false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b border-dark-700">
        <span className="text-sm font-medium text-dark-200">图层 ({layers.length})</span>
        <div className="flex items-center gap-1">
          <button
            onClick={deleteSelected}
            disabled={selectedLayerIds.length === 0}
            className="p-1.5 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-200 disabled:opacity-50"
            title="删除选中图层"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Layers className="h-8 w-8 text-dark-500 mb-2" />
            <p className="text-sm text-dark-400">暂无图层</p>
            <p className="text-xs text-dark-500">在画布上绘制图形</p>
          </div>
        ) : (
          layers.map((layer) => {
            const Icon = layerIcons[layer.type] || Square;
            const isSelected = selectedLayerIds.includes(layer.id);

            return (
              <div
                key={layer.id}
                onClick={(e) => handleLayerClick(layer.id, e)}
                className={`group flex items-center gap-2 px-3 py-2 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-primary-600/20 text-primary-400'
                    : 'hover:bg-dark-700/50 text-dark-200'
                }`}
              >
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerVisibility(layer.id);
                    }}
                    className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-dark-200"
                    title={layer.visible ? '隐藏图层' : '显示图层'}
                  >
                    {layer.visible ? (
                      <Eye className="h-3.5 w-3.5" />
                    ) : (
                      <EyeOff className="h-3.5 w-3.5 text-dark-500" />
                    )}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLayerLock(layer.id);
                    }}
                    className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-dark-200"
                    title={layer.locked ? '解锁图层' : '锁定图层'}
                  >
                    {layer.locked ? (
                      <Lock className="h-3.5 w-3.5 text-yellow-500" />
                    ) : (
                      <Unlock className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>

                <Icon className="h-4 w-4 text-dark-400 flex-shrink-0" />
                <span className="flex-1 text-sm truncate">{layer.name}</span>

                <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      bringForward(layer.id);
                    }}
                    className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-dark-200"
                    title="上移一层"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      sendBackward(layer.id);
                    }}
                    className="p-1 rounded hover:bg-dark-600 text-dark-400 hover:text-dark-200"
                    title="下移一层"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
