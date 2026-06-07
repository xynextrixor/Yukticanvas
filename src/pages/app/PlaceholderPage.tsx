import { useState } from "react";
import { Send, Bot, Sparkles, User, RefreshCcw, ArrowRight } from "lucide-react";

export default function PlaceholderPage() {
  const [input, setInput] = useState("");
  const isAIWorkspace = location.pathname.includes("ai");

  if (!isAIWorkspace) {
    return (
      <div className="p-8 max-w-7xl mx-auto flex items-center justify-center h-full min-h-[500px]">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Coming Soon</h1>
          <p className="text-gray-500">This section is currently under construction.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Sidebar - Prompts & History (Hidden on mobile by default, but typically shown in split layout mode) */}
      <div className="hidden md:flex flex-col w-[300px] border-r border-gray-200 bg-gray-50 shrink-0">
         <div className="p-4 border-b border-gray-200 bg-white">
           <button className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white rounded-lg py-2 text-sm font-semibold hover:bg-gray-800 transition-colors">
              <Sparkles size={14} className="text-[#FFD60A]" /> New Chat
           </button>
         </div>
         <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Templates</h3>
              <div className="space-y-2">
                 <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer hover:border-[#FF3B30] transition-colors">Generate Authentication Flow</div>
                 <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm cursor-pointer hover:border-[#FF3B30] transition-colors">Create Marketing Mind Map</div>
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Recent</h3>
              <div className="space-y-1">
                 <div className="px-3 py-2 text-sm text-gray-600 hover:bg-white rounded-md cursor-pointer truncate">E-commerce checkout architecture</div>
                 <div className="px-3 py-2 text-sm text-gray-600 hover:bg-white rounded-md cursor-pointer truncate">Data model for SaaS</div>
              </div>
            </div>
         </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
           <div className="flex gap-4 max-w-3xl mx-auto items-start">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 flex shrink-0 items-center justify-center text-white font-bold text-xs mt-1">U</div>
             <div className="flex-1">
               <p className="text-sm md:text-base text-gray-800 leading-relaxed font-medium">Can you generate a user registration flow for a fintech application?</p>
             </div>
           </div>
           
           <div className="flex gap-4 max-w-3xl mx-auto items-start">
             <div className="w-8 h-8 rounded-lg bg-[#FFD60A]/20 flex shrink-0 items-center justify-center text-yellow-700 mt-1">
               <Bot size={18} />
             </div>
             <div className="flex-1">
               <p className="text-sm md:text-base text-gray-600 leading-relaxed mb-4">
                 Certainly! Here is a recommended user registration flow for a fintech app, focusing on security and smooth onboarding:
               </p>
               <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 md:p-6 mb-4 relative group">
                  <div className="flex items-center justify-center h-32 md:h-48 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                     <span className="text-gray-400 flex flex-col items-center gap-2">
                        <Sparkles size={24} className="text-[#FF3B30] opacity-50" />
                        A beautiful flowchart has been generated on the canvas
                     </span>
                  </div>
                  <button className="absolute bottom-6 right-6 md:bottom-8 md:right-8 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 shadow-lg hover:scale-105">
                     Open in Canvas <ArrowRight size={14} />
                  </button>
               </div>
               <div className="flex items-center gap-2 mt-4">
                  <button className="p-1.5 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100" title="Regenerate">
                     <RefreshCcw size={14} />
                  </button>
               </div>
             </div>
           </div>
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100 pb-safe shrink-0">
          <div className="max-w-3xl mx-auto relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-1 focus-within:ring-[#FF3B30] focus-within:border-[#FF3B30] shadow-sm transition-all">
            <textarea 
              rows={1}
              placeholder="Ask Yukti AI to design something..."
              className="flex-1 bg-transparent border-none focus:outline-none resize-none py-2 px-3 text-sm md:text-base max-h-32 placeholder-gray-400"
              value={input}
              onChange={e => setInput(e.target.value)}
            />
            <button className="p-2.5 bg-[#FF3B30] text-white rounded-xl hover:bg-[#E3261C] transition-colors shrink-0 shadow-sm flex items-center justify-center min-w-[44px] min-h-[44px]">
               <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
            </button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 text-center">
             <span className="text-[10px] text-gray-400 font-medium">Yukti AI can make mistakes. Consider verifying critical flows.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

