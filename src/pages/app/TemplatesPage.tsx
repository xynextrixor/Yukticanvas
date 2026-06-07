import { LayoutTemplate } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { defaultTemplates } from "../../lib/templates"
import { useAuth } from "../../lib/AuthContext"
import { createBoard } from "../../lib/boards"

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleCreateBoard = async (templateId: string) => {
    if (!user) return;
    try {
      const template = defaultTemplates.find(t => t.id === templateId);
      let content = { shapes: [], viewport: { x: 0, y: 0, zoom: 1 } };
      if (template) {
        content.shapes = template.shapes as any;
      }
      const newBoard = await createBoard(user.id, template?.name || "Untitled Board", content);
      navigate(`/board/${newBoard.id}`);
    } catch (err: any) {
      console.error(err);
      alert("Error creating board: " + (err.message || JSON.stringify(err)));
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-6 sm:space-y-8 bg-[#FAFAFA] min-h-full">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4 sm:pb-6 mb-6 sm:mb-8">
        <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 flex-shrink-0">
          <LayoutTemplate size={24} />
        </div>
        <div>
          <h1 className="font-semibold text-xl sm:text-2xl text-[#111111] tracking-tight">Template Library</h1>
          <p className="text-gray-500 text-sm mt-1">Kickstart your board with a premium editable template.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {defaultTemplates.map((template) => (
          <div 
            key={template.id}
            onClick={() => handleCreateBoard(template.id)}
            className="bg-white border text-left border-gray-200 rounded-xl p-5 hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group flex flex-col h-full hover:-translate-y-1"
          >
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors">
              <LayoutTemplate size={24} />
            </div>
            <h3 className="font-bold text-gray-900 mb-2 truncate">{template.name}</h3>
            <p className="text-sm text-gray-500 leading-relaxed flex-1 line-clamp-3">{template.description}</p>
            <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-semibold text-blue-600">Use Template</span>
              <span className="text-blue-600">→</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
