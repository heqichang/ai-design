import { useCanvasStore } from '@/store/canvasStore';
import { useFileStore } from '@/store/fileStore';

export default function StatusBar() {
  const { canvasState, currentTool, selectedLayerIds } = useCanvasStore();
  const { currentFile } = useFileStore();

  return (
    <div className="flex items-center justify-between h-7 px-4 border-t border-dark-700 bg-dark-800 text-xs text-dark-400">
      <div className="flex items-center gap-4">
        <span>缩放: {Math.round(canvasState.zoom * 100)}%</span>
        {currentFile && (
          <span>
            画布: {currentFile.width} × {currentFile.height}px
          </span>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <span>工具: {currentTool}</span>
        {selectedLayerIds.length > 0 && (
          <span>已选中: {selectedLayerIds.length} 个图层</span>
        )}
      </div>
    </div>
  );
}
