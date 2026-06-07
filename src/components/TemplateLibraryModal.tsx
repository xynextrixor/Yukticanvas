import React from 'react';
import { X, LayoutTemplate } from 'lucide-react';
import { defaultTemplates } from '../lib/templates';
import { useCanvasStore } from '../store/canvasStore';

export function TemplateLibraryModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { setShapes } = useCanvasStore();

  if (!isOpen) return null;

  const handleSelectTemplate = (template: typeof defaultTemplates[0]) => {
    // In a real app we might want to append or ask to overwrite
    setShapes(template.shapes);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col relative animate-in slide-in-from-bottom-8 sm:slide-in-from-bottom-0 sm:zoom-in-95">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <LayoutTemplate size={20} />
            </div>
            <div>
              <h2 className="font-bold text-xl text-gray-900 tracking-tight">Template Library</h2>
              <p className="text-sm text-gray-500">Kickstart your board with a premium editable template.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-900 p-2 transition-colors rounded-full hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 mt-2 lg:grid-cols-3 gap-4 bg-gray-50/50">
          {defaultTemplates.map((template) => (
            <div 
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              className="bg-white border text-left border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <LayoutTemplate size={20} />
              </div>
              <h3 className="font-bold text-gray-900 mb-1.5">{template.name}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
