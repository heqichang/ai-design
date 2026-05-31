import { create } from 'zustand';
import localforage from 'localforage';
import type { DesignFile, Artboard, Layer } from '@/types';

interface FileStore {
  files: DesignFile[];
  currentFile: DesignFile | null;
  isLoading: boolean;
  loadFiles: () => Promise<void>;
  createFile: (name: string, width: number, height: number) => Promise<DesignFile>;
  saveFile: (file: DesignFile) => Promise<void>;
  deleteFile: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  setCurrentFile: (file: DesignFile | null) => void;
  updateCurrentFileThumbnail: (thumbnail: string) => Promise<void>;
}

localforage.config({
  name: 'DesignStudio',
  storeName: 'files',
});

const generateId = () => Math.random().toString(36).substr(2, 9);

export const useFileStore = create<FileStore>((set, get) => ({
  files: [],
  currentFile: null,
  isLoading: true,

  loadFiles: async () => {
    set({ isLoading: true });
    const keys = await localforage.keys();
    const files: DesignFile[] = [];
    
    for (const key of keys) {
      const file = await localforage.getItem<DesignFile>(key);
      if (file) files.push(file);
    }
    
    files.sort((a, b) => b.updatedAt - a.updatedAt);
    set({ files, isLoading: false });
  },

  createFile: async (name: string, width: number, height: number) => {
    const id = generateId();
    const now = Date.now();
    
    const defaultArtboard: Artboard = {
      id: generateId(),
      name: '画板 1',
      x: 0,
      y: 0,
      width,
      height,
      backgroundColor: '#ffffff',
      layers: [],
    };

    const newFile: DesignFile = {
      id,
      name,
      thumbnail: '',
      createdAt: now,
      updatedAt: now,
      isFavorite: false,
      artboards: [defaultArtboard],
      width,
      height,
    };

    await localforage.setItem(id, newFile);
    
    set((state) => ({
      files: [newFile, ...state.files],
      currentFile: newFile,
    }));

    return newFile;
  },

  saveFile: async (file: DesignFile) => {
    const updatedFile = { ...file, updatedAt: Date.now() };
    await localforage.setItem(file.id, updatedFile);
    
    set((state) => ({
      files: state.files.map((f) => (f.id === file.id ? updatedFile : f)),
      currentFile: state.currentFile?.id === file.id ? updatedFile : state.currentFile,
    }));
  },

  deleteFile: async (id: string) => {
    await localforage.removeItem(id);
    set((state) => ({
      files: state.files.filter((f) => f.id !== id),
      currentFile: state.currentFile?.id === id ? null : state.currentFile,
    }));
  },

  toggleFavorite: async (id: string) => {
    const file = get().files.find((f) => f.id === id);
    if (file) {
      const updatedFile = { ...file, isFavorite: !file.isFavorite };
      await localforage.setItem(id, updatedFile);
      set((state) => ({
        files: state.files.map((f) => (f.id === id ? updatedFile : f)),
      }));
    }
  },

  setCurrentFile: (file: DesignFile | null) => {
    set({ currentFile: file });
  },

  updateCurrentFileThumbnail: async (thumbnail: string) => {
    const { currentFile } = get();
    if (currentFile) {
      const updatedFile = { ...currentFile, thumbnail, updatedAt: Date.now() };
      await localforage.setItem(currentFile.id, updatedFile);
      set((state) => ({
        files: state.files.map((f) => (f.id === currentFile.id ? updatedFile : f)),
        currentFile: updatedFile,
      }));
    }
  },
}));
