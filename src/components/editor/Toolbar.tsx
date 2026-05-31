import {
  MousePointer2,
  Square,
  Circle,
  Minus,
  Type,
  PenTool,
  Pencil,
  Hand,
  Pentagon,
  Star,
  MoveRight,
} from 'lucide-react';
import { useCanvasStore } from '@/store/canvasStore';
import type { ToolType } from '@/types';

const tools: { type: ToolType; icon: typeof MousePointer2; label: string }[] = [
  { type: 'select', icon: MousePointer2, label: '选择 (V)' },
  { type: 'hand', icon: Hand, label: '手型 (H)' },
  { type: 'rect', icon: Square, label: '矩形 (R)' },
  { type: 'circle', icon: Circle, label: '圆形 (O)' },
  { type: 'line', icon: Minus, label: '直线' },
  { type: 'arrow', icon: MoveRight, label: '箭头' },
  { type: 'polygon', icon: Pentagon, label: '多边形' },
  { type: 'star', icon: Star, label: '星形' },
  { type: 'text', icon: Type, label: '文本 (T)' },
  { type: 'pen', icon: PenTool, label: '钢笔 (P)' },
  { type: 'pencil', icon: Pencil, label: '铅笔' },
];

export default function Toolbar() {
  const { currentTool, setCurrentTool } = useCanvasStore();

  return (
    <div className="flex w-14 flex-col items-center gap-1 border-r border-dark-700 bg-dark-800 py-2">
      {tools.map((tool) => {
        const Icon = tool.icon;
        const isActive = currentTool === tool.type;
        
        return (
          <button
            key={tool.type}
            onClick={() => setCurrentTool(tool.type)}
            className={`group relative flex h-10 w-10 items-center justify-center rounded-lg transition-all ${isActive
              ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
              : 'text-dark-400 hover:bg-dark-700 hover:text-dark-100'
            }`}
          >
            <Icon className="h-5 w-5" />
            
            <div className="absolute left-full ml-2 z-50 hidden rounded-lg bg-dark-700 px-2 py-1 text-xs text-dark-100 whitespace-nowrap group-hover:block">
              {tool.label}
            </div>
          </button>
        );
      })}
    </div>
  );
}
