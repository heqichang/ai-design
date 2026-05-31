import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Search,
  Clock,
  Folder,
  Star,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useFileStore } from '@/store/fileStore';
import { useUIStore } from '@/store/uiStore';
import FileCard from '@/components/home/FileCard';
import CreateModal from '@/components/home/CreateModal';

export default function Home() {
  const navigate = useNavigate();
  const { files, isLoading, loadFiles, createFile, deleteFile, toggleFavorite } = useFileStore();
  const { showCreateModal, setShowCreateModal, searchQuery, setSearchQuery, fileFilter, setFileFilter, addToast } = useUIStore();

  const activeFilters = [
    { key: 'all' as const, label: '全部文件', icon: Folder },
    { key: 'recent' as const, label: '最近打开', icon: Clock },
    { key: 'favorites' as const, label: '收藏', icon: Star },
  ];

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  const filteredFiles = files.filter((file) => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      fileFilter === 'all' ||
      (fileFilter === 'recent' && Date.now() - file.updatedAt < 7 * 24 * 60 * 60 * 1000) ||
      (fileFilter === 'favorites' && file.isFavorite);
    return matchesSearch && matchesFilter;
  });

  const handleCreateFile = async (name: string, width: number, height: number) => {
    const newFile = await createFile(name, width, height);
    setShowCreateModal(false);
    addToast({ type: 'success', message: '文件创建成功！' });
    navigate(`/editor/${newFile.id}`);
  };

  const handleOpenFile = (id: string) => {
    navigate(`/editor/${id}`);
  };

  const handleDeleteFile = async (id: string) => {
    await deleteFile(id);
    addToast({ type: 'success', message: '文件已删除' });
  };

  const handleToggleFavorite = async (id: string) => {
    await toggleFavorite(id);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-dark-100">
      <header className="sticky top-0 z-40 border-b border-dark-700 bg-dark-900/80 backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-accent-500">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight">Design Studio</h1>
              <p className="text-xs text-dark-400">在线设计工具</p>
            </div>
          </div>

          <div className="flex-1 mx-8 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-400" />
              <input
                type="text"
                placeholder="搜索文件..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg bg-dark-800 border border-dark-700 py-2 pl-10 pr-4 text-sm text-dark-100 placeholder-dark-500 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-primary-600/30 hover:bg-primary-500 transition-all hover:shadow-xl hover:shadow-primary-500/40"
          >
            <Plus className="h-4 w-4" />
            创建设计
          </button>
        </div>
      </header>

      <main className="p-6">
        <div className="mb-6 flex gap-2">
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={() => setFileFilter(filter.key)}
              className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${fileFilter === filter.key ? 'bg-primary-600/20 text-primary-400' : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'}`}
            >
              <filter.icon className="h-4 w-4" />
              {filter.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video rounded-xl bg-dark-800" />
                <div className="mt-3 h-4 w-3/4 rounded bg-dark-800" />
              </div>
            ))}
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-dark-800 p-6">
              <FileText className="h-12 w-12 text-dark-500" />
            </div>
            <h3 className="mb-2 text-lg font-medium">没有找到文件</h3>
            <p className="mb-6 text-sm text-dark-400">
              {searchQuery ? '尝试调整搜索关键词' : '创建你的第一个设计文件开始吧'}
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-500 transition-colors"
            >
              <Plus className="h-4 w-4" />
              创建文件
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {filteredFiles.map((file) => (
              <FileCard
                key={file.id}
                file={file}
                onOpen={handleOpenFile}
                onDelete={handleDeleteFile}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}

            <button
              onClick={() => setShowCreateModal(true)}
              className="group flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-dark-700 bg-dark-800/50 p-8 transition-all hover:border-primary-500/50 hover:bg-primary-500/10"
            >
              <div className="mb-3 rounded-full bg-dark-700 p-3 transition-all group-hover:bg-primary-600">
                <Plus className="h-6 w-6 text-dark-300 group-hover:text-white" />
              </div>
              <span className="text-sm font-medium text-dark-300 group-hover:text-primary-400">创建新文件</span>
            </button>
          </div>
        )}
      </main>

      {showCreateModal && (
        <CreateModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateFile}
        />
      )}
    </div>
  );
}
