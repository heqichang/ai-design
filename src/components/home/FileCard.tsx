import { useState } from 'react';
import { Star, Trash2, MoreVertical, Pencil } from 'lucide-react';
import type { DesignFile } from '@/types';

interface FileCardProps {
  file: DesignFile;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export default function FileCard({ file, onOpen, onDelete, onToggleFavorite }: FileCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="group relative">
      <div
        onClick={() => onOpen(file.id)}
        className="cursor-pointer overflow-hidden rounded-xl border border-dark-700 bg-dark-800 transition-all hover:border-primary-500/50 hover:shadow-lg hover:shadow-primary-500/10"
      >
        <div className="aspect-video overflow-hidden bg-dark-900">
          {file.thumbnail ? (
            <img
              src={file.thumbnail}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-dark-800 to-dark-900">
              <div
                className="rounded-md bg-white shadow-lg"
                style={{
                  width: Math.min(file.width, 120) * 0.5,
                  height: Math.min(file.height, 80) * 0.5,
                }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-dark-100">{file.name}</h3>
          <p className="text-xs text-dark-400">
            {file.width} × {file.height} • {formatDate(file.updatedAt)}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(file.id);
            }}
            className={`rounded p-1.5 transition-colors ${
              file.isFavorite ? 'text-yellow-400' : 'text-dark-500 hover:text-yellow-400'
            }`}
          >
            <Star className="h-4 w-4" fill={file.isFavorite ? 'currentColor' : 'none'} />
          </button>
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="rounded p-1.5 text-dark-500 hover:text-dark-200"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-32 rounded-lg bg-dark-800 border border-dark-700 py-1 shadow-xl z-10">
                <button
                  onClick={() => {
                    onOpen(file.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-dark-200 hover:bg-dark-700"
                >
                  <Pencil className="h-4 w-4" />
                  编辑
                </button>
                <button
                  onClick={() => {
                    onDelete(file.id);
                    setShowMenu(false);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-dark-700"
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
