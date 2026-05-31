import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CanvasProvider } from '@/contexts/CanvasContext';
import { useFileStore } from '@/store/fileStore';
import { useCanvasStore } from '@/store/canvasStore';
import { useUIStore } from '@/store/uiStore';
import TopBar from '@/components/editor/TopBar';
import Toolbar from '@/components/editor/Toolbar';
import Canvas from '@/components/editor/Canvas';
import LayerPanel from '@/components/editor/LayerPanel';
import PropertyPanel from '@/components/editor/PropertyPanel';
import StatusBar from '@/components/editor/StatusBar';
import ExportModal from '@/components/editor/ExportModal';
function EditorContent() {
 const { id } = useParams<{
 id: string;
 }>();
 const navigate = useNavigate();
 const canvasRef = useRef<HTMLCanvasElement>(null);
 const { files, loadFiles, currentFile, setCurrentFile } = useFileStore();
 const { resetCanvas } = useCanvasStore();
 const { showExportModal, setShowExportModal, activePanel, setActivePanel } = useUIStore();
 useEffect(() => {
 loadFiles();
 }, [loadFiles]);
 useEffect(() => {
 if (id && files.length > 0) {
 const file = files.find((f) => f.id === id);
 if (file) {
 setCurrentFile(file);
 }
 else {
 navigate('/');
 }
 }
 }, [id, files, setCurrentFile, navigate]);
 useEffect(() => {
 return () => {
 resetCanvas();
 setCurrentFile(null);
 };
 }, [resetCanvas, setCurrentFile]);
 if (!currentFile) {
 return (<div className="flex h-screen items-center justify-center bg-dark-900">
 <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary-500 border-t-transparent"/>
 </div>);
 }
 return (<div className="flex h-screen flex-col bg-dark-900 text-dark-100">
 <TopBar />
 
 <div className="flex flex-1 overflow-hidden">
 <Toolbar />
 
 <div className="flex-1 overflow-hidden">
 <Canvas canvasRef={canvasRef}/>
 </div>
 
 <div className="w-72 border-l border-dark-700 bg-dark-800 overflow-hidden flex flex-col">
 <div className="flex border-b border-dark-700">
 <button onClick={() => setActivePanel('layers')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activePanel === 'layers'
 ? 'text-primary-400 border-b-2 border-primary-500'
 : 'text-dark-400 hover:text-dark-200'}`}>
 图层
 </button>
 <button onClick={() => setActivePanel('properties')} className={`flex-1 py-2 text-sm font-medium transition-colors ${activePanel === 'properties'
 ? 'text-primary-400 border-b-2 border-primary-500'
 : 'text-dark-400 hover:text-dark-200'}`}>
 属性
 </button>
 </div>
 
 <div className="flex-1 overflow-y-auto">
 {activePanel === 'layers' ? (<LayerPanel />) : (<PropertyPanel />)}
 </div>
 </div>
 </div>
 
 <StatusBar />

 {showExportModal && (<ExportModal canvasRef={canvasRef} onClose={() => setShowExportModal(false)}/>)}
 </div>);
}
export default function Editor() {
 return (<CanvasProvider>
 <EditorContent />
 </CanvasProvider>);
}
