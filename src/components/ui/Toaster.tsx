import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import type { Toast } from '@/store/uiStore';

const toastIcons: Record<Toast['type'], React.ComponentType<{ className?: string }>> = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

const toastColors: Record<Toast['type'], string> = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
};

export function Toaster() {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = toastIcons[toast.type];
        
        return (
          <div
            key={toast.id}
            className="flex items-center gap-3 min-w-[280px] px-4 py-3 rounded-lg border border-dark-700 bg-dark-800 shadow-lg animate-pulse"
          >
            <Icon className={`h-5 w-5 ${toastColors[toast.type]}`} />
            <span className="flex-1 text-sm text-dark-100">{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 rounded hover:bg-dark-700 text-dark-400 hover:text-dark-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
