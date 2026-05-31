import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  ZoomIn,
  ZoomOut,
  Ruler,
  Grid3X3,
  Save,
  Sparkles,
} from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useUIStore } from '@/store/uiStore';

export default function TopBar() {
  const navigate = useNavigate();
  const { currentFile, saveFile } = useFileStore();
  const { canvasState, setZoom, toggleRulers, toggleGrid } = useCanvasStore();
  const { setShowExportModal, addToast } = useUIStore();

  const handleSave = async () => {
    if (currentFile) {
      await saveFile(currentFile);
      addToast({ type: 'success', message: '文件已保存' });
    }
  };

  return (
    <div className="flex h-12 items-center justify-between border-b border-dark-700 bg-dark-800/90 backdrop-blur-sm px-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 rounded-lg p-2 text-dark-400 hover:bg-dark-700 hover:text-dark-100"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-primary-500 to-accent-500">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <span className="font-display font-medium">{currentFile?.name || '未命名'}</span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={handleSave}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-dark-300 hover:bg-dark-700 hover:text-dark-100"
        >
          <Save className="h-4 w-4" />
          保存
        </button>
        
        <div className="mx-2 h-5 w-px bg-dark-700" />
        
        <button
          onClick={() => setZoom(canvasState.zoom + 0.1)}
          className="rounded-lg p-2 text-dark-400 hover:bg-dark-700 hover:text-dark-100"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        
        <span className="w-16 text-center text-sm text-dark-300">
          {Math.round(canvasState.zoom * 100)}%
        </span>
        
        <button
          onClick={() => setZoom(canvasState.zoom - 0.1)}
          className="rounded-lg p-2 text-dark-400 hover:bg-dark-700 hover:text-dark-100"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        
        <div className="mx-2 h-5 w-px bg-dark-700" />
        
        <button
          onClick={toggleRulers}
          className={`rounded-lg p-2 transition-colors ${
            canvasState.showRulers ? 'text-primary-400' : 'text-dark-400 hover:bg-dark-700 hover:text-dark-100'
          }`}
        >
          <Ruler className="h-4 w-4" />
        </button>
        
        <button
          onClick={toggleGrid}
          className={`rounded-lg p-2 transition-colors ${
            canvasState.showGrid ? 'text-primary-400' : 'text-dark-400 hover:bg-dark-700 hover:text-dark-100'
          }`}
        >
          <Grid3X3 className="h-4 w-4" />
        </button>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowExportModal(true)}
          className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
        >
          <Download className="h-4 w-4" />
          导出
        </button>
      </div>
    </div>
  );
}
