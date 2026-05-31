import { useState } from 'react';
import { X, Download, Image, FileText } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';

interface ExportModalProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  onClose: () => void;
}

const exportFormats = [
  { id: 'png', name: 'PNG', icon: Image, description: '无损压缩，支持透明背景' },
  { id: 'jpg', name: 'JPG', icon: Image, description: '有损压缩，文件较小' },
  { id: 'svg', name: 'SVG', icon: FileText, description: '矢量格式，可无限缩放' },
];

const scales = [
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
  { value: 3, label: '3x' },
];

export default function ExportModal({ canvasRef, onClose }: ExportModalProps) {
  const [selectedFormat, setSelectedFormat] = useState('png');
  const [selectedScale, setSelectedScale] = useState(1);
  const [quality, setQuality] = useState(90);
  const [isExporting, setIsExporting] = useState(false);
  const { addToast } = useUIStore();

  const handleExport = async () => {
    if (!canvasRef.current) return;

    setIsExporting(true);
    
    try {
      const canvas = canvasRef.current;
      const link = document.createElement('a');
      
      if (selectedFormat === 'svg') {
        addToast({ type: 'info', message: 'SVG 导出功能开发中...' });
        setIsExporting(false);
        return;
      }

      const mimeType = selectedFormat === 'png' ? 'image/png' : 'image/jpeg';
      const qualityValue = selectedFormat === 'jpg' ? quality / 100 : undefined;

      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width * selectedScale;
      tempCanvas.height = canvas.height * selectedScale;
      const ctx = tempCanvas.getContext('2d');
      
      if (ctx) {
        ctx.scale(selectedScale, selectedScale);
        ctx.drawImage(canvas, 0, 0);
      }

      link.download = `design.${selectedFormat}`;
      link.href = tempCanvas.toDataURL(mimeType, qualityValue);
      link.click();

      addToast({ type: 'success', message: '导出成功！' });
    } catch (error) {
      addToast({ type: 'error', message: '导出失败，请重试' });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl border border-dark-700 bg-dark-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-dark-700 px-6 py-4">
          <h2 className="font-display text-lg font-semibold">导出图像</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-dark-400 hover:bg-dark-800 hover:text-dark-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="mb-3 block text-sm font-medium text-dark-200">导出格式</label>
            <div className="space-y-2">
              {exportFormats.map((format) => {
                const Icon = format.icon;
                return (
                  <button
                    key={format.id}
                    onClick={() => setSelectedFormat(format.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all ${selectedFormat === format.id
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'}
                    `}
                  >
                    <Icon className={`h-5 w-5 ${selectedFormat === format.id ? 'text-primary-400' : 'text-dark-400'}`} />
                    <div className="text-left">
                      <div className="text-sm font-medium text-dark-100">{format.name}</div>
                      <div className="text-xs text-dark-400">{format.description}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-dark-200">缩放比例</label>
            <div className="flex gap-2">
              {scales.map((scale) => (
                <button
                  key={scale.value}
                  onClick={() => setSelectedScale(scale.value)}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${selectedScale === scale.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}
                  `}
                >
                  {scale.label}
                </button>
              ))}
            </div>
          </div>

          {selectedFormat === 'jpg' && (
            <div>
              <label className="mb-2 block text-sm font-medium text-dark-200">
                图片质量: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-dark-700 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-dark-300 hover:bg-dark-800"
          >
            取消
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            {isExporting ? '导出中...' : '导出'}
          </button>
        </div>
      </div>
    </div>
  );
}
