import { useState } from 'react';
import { X, Smartphone, Tablet, Monitor, Image } from 'lucide-react';
import { PRESET_SIZES } from '@/types';

interface CreateModalProps {
  onClose: () => void;
  onCreate: (name: string, width: number, height: number) => void;
}

const categoryIcons = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  social: Image,
};

export default function CreateModal({ onClose, onCreate }: CreateModalProps) {
  const [name, setName] = useState('未命名设计');
  const [customWidth, setCustomWidth] = useState('1080');
  const [customHeight, setCustomHeight] = useState('1920');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCreate = () => {
    if (!name.trim()) return;
    
    const width = selectedPreset
      ? PRESET_SIZES.find((p) => p.name === selectedPreset)?.width || parseInt(customWidth)
      : parseInt(customWidth);
    const height = selectedPreset
      ? PRESET_SIZES.find((p) => p.name === selectedPreset)?.height || parseInt(customHeight)
      : parseInt(customHeight);

    if (width > 0 && height > 0) {
      onCreate(name, width, height);
    }
  };

  const categories = [...new Set(PRESET_SIZES.map((p) => p.category))];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-950/80 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-2xl border border-dark-700 bg-dark-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-dark-700 px-6 py-4">
          <h2 className="font-display text-lg font-semibold">创建设计文件</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-dark-400 hover:bg-dark-800 hover:text-dark-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-6">
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-dark-300">文件名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg bg-dark-800 border border-dark-700 px-4 py-2.5 text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              placeholder="输入文件名称"
            />
          </div>

          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-dark-300">尺寸预设</h3>
            
            <div className="mb-3 flex flex-wrap gap-2">
              {categories.map((category) => {
                const Icon = categoryIcons[category as keyof typeof categoryIcons];
                return (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-all ${selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-dark-800 text-dark-300 hover:bg-dark-700'}
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    {category === 'mobile' && '手机'}
                    {category === 'tablet' && '平板'}
                    {category === 'desktop' && '桌面'}
                    {category === 'social' && '社交'}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {PRESET_SIZES.filter(
                (preset) => !selectedCategory || preset.category === selectedCategory
              ).map((preset) => {
                const Icon = categoryIcons[preset.category as keyof typeof categoryIcons];
                return (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setSelectedPreset(preset.name);
                      setCustomWidth(preset.width.toString());
                      setCustomHeight(preset.height.toString());
                    }}
                    className={`rounded-lg border p-3 text-left transition-all ${selectedPreset === preset.name
                      ? 'border-primary-500 bg-primary-500/10'
                      : 'border-dark-700 bg-dark-800/50 hover:border-dark-600'}
                    `}
                  >
                    <div className="mb-1 flex items-center gap-2">
                      <Icon className="h-4 w-4 text-dark-400" />
                      <span className="text-sm font-medium text-dark-100">{preset.name}</span>
                    </div>
                    <span className="text-xs text-dark-400">
                      {preset.width} × {preset.height}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-medium text-dark-300">自定义尺寸</h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="mb-1.5 block text-xs text-dark-400">宽度 (px)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => {
                    setCustomWidth(e.target.value);
                    setSelectedPreset(null);
                  }}
                  className="w-full rounded-lg bg-dark-800 border border-dark-700 px-4 py-2.5 text-dark-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                  max="10000"
                />
              </div>
              <div className="flex-1">
                <label className="mb-1.5 block text-xs text-dark-400">高度 (px)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => {
                    setCustomHeight(e.target.value);
                    setSelectedPreset(null);
                  }}
                  className="w-full rounded-lg bg-dark-800 border border-dark-700 px-4 py-2.5 text-dark-100 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  min="1"
                  max="10000"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-dark-700 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-medium text-dark-300 hover:bg-dark-800"
          >
            取消
          </button>
          <button
            onClick={handleCreate}
            disabled={!name.trim()}
            className="rounded-lg bg-primary-600 px-6 py-2 text-sm font-medium text-white hover:bg-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            创建
          </button>
        </div>
      </div>
    </div>
  );
}
