import React, { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { 
  Plus, MoreHorizontal, Clock, Users, Star, Sparkles, 
  MessageSquare, LayoutTemplate, ArrowRight, Zap, FileUp, Network, FolderKanban,
  Search, Wand2, Frame, ArrowUpRight, Layers, Trash2, Pencil
} from "lucide-react"
import { useAuth } from "../../lib/AuthContext"
import { getUserBoards, Board, createBoard, deleteBoard, updateBoard } from "../../lib/boards"

export default function DashboardPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadBoards();
    }
  }, [user]);

  const loadBoards = async () => {
    try {
      if (!user) return;
      const data = await getUserBoards(user.id);
      setBoards(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const [isCreating, setIsCreating] = useState(false);

  const handleNewBoard = async () => {
    console.log("New board button clicked. User:", user?.id);
    if (!user) {
      alert("No user connected.");
      return;
    }
    setIsCreating(true);
    try {
      console.log("creating board...");
      const newBoard = await createBoard(user.id, "Untitled Board");
      console.log("created -> navigating", newBoard);
      nav(`/board/${newBoard.id}`);
    } catch (err: any) {
      console.error("Failed to create board:", err);
      alert("Error creating board: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteBoard = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this board?")) {
      try {
        await deleteBoard(id);
        setBoards(boards.filter(b => b.id !== id));
      } catch (err: any) {
        console.error("Failed to delete board:", err);
        alert("Failed to delete board: " + (err.message || JSON.stringify(err)));
      }
    }
  };

  const handleRenameBoard = async (e: React.MouseEvent, id: string, currentTitle: string) => {
    e.preventDefault();
    e.stopPropagation();
    const newTitle = prompt("Enter new title for this board:", currentTitle);
    if (newTitle !== null) {
      const trimmed = newTitle.trim();
      if (!trimmed) {
        alert("Board title cannot be empty!");
        return;
      }
      try {
        await updateBoard(id, { title: trimmed });
        setBoards(boards.map(b => b.id === id ? { ...b, title: trimmed } : b));
      } catch (err) {
        console.error("Failed to rename board:", err);
        alert("Failed to rename board");
      }
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8 lg:space-y-10 bg-[#FAFAFA] min-h-full">
      
      {/* 1. Dashboard Hero - Elegant Look */}
      <section className="relative overflow-hidden rounded-3xl bg-[#ffd60a] p-6 sm:p-10 border border-gray-200 shadow-sm sm:mb-6 lg:mb-8">
         <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#FF3B30]/5 blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-[#FFD60A]/10 blur-3xl" />
         </div>
         
         <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-semibold tracking-wide text-gray-600 mb-6 shadow-sm">
              <Sparkles size={12} className="text-[#FF3B30]" />
              <span>Welcome back, {user?.email?.split('@')[0] || 'User'}</span>
            </div>
            <h1 className="font-display font-bold text-4xl sm:text-5xl mb-3 tracking-tight text-[#111111] bg-[#ff3b30]">
              Ready to draw <br className="hidden sm:block" />some ideas?
            </h1>
            <p className="text-gray-500 font-medium text-sm sm:text-base max-w-md mb-8">You have {boards.length} boards. Dive back in or start a new brainstorm session today.</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button onClick={() => alert("File import coming soon!")} className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-sm h-11 px-6 py-2">
              <FileUp className="mr-2 w-4 h-4" /> Import File
            </button>
            <button disabled={isCreating} onClick={(e) => { e.preventDefault(); handleNewBoard(); }} className="inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold transition-all bg-[#111111] text-white hover:bg-gray-900 shadow-md h-11 px-6 py-2 disabled:opacity-75">
              <Plus className="mr-2 w-4 h-4" /> {isCreating ? "Creating..." : "New Board"}
            </button>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
           {[
             { label: "Total Boards", value: boards.length.toString(), icon: <Layers size={18} className="text-gray-400" /> },
             { label: "Team Members", value: "1", icon: <Users size={18} className="text-blue-500" />, avatars: false },
             { label: "AI Generations", value: "0", icon: <Sparkles size={18} className="text-[#FFD60A]" /> },
             { label: "Active Sessions", value: "1", icon: <Zap size={18} className="text-green-500" /> },
           ].map((stat, i) => (
             <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col justify-between shadow-[0_2px_8px_-4px_rgba(0,0,0,0.05)] hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.08)] transition-all">
                <div className="flex items-center justify-between mb-4">
                   <h3 className="text-xs font-semibold text-gray-500">{stat.label}</h3>
                   {stat.icon}
                </div>
                <div className="flex items-end justify-between">
                   <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                </div>
             </div>
           ))}
        </div>
      {/* 2. Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Left Column (Wider) */}
        <div className="lg:col-span-2 space-y-10">
          
          {/* Recent Boards */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-[#111111] flex items-center gap-2">Recent Boards</h2>
              <button className="text-xs font-medium text-gray-500 hover:text-[#111111] flex items-center gap-1 transition-colors">
                 View all <ArrowRight size={12} />
              </button>
            </div>
            {loading ? (
              <div className="text-center py-10 text-gray-500">Loading boards...</div>
            ) : boards.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl bg-gray-50">
                <Layers className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                <h3 className="text-sm font-semibold text-gray-900">No boards yet</h3>
                <p className="mt-1 text-xs text-gray-500">Get started by creating a new board.</p>
                <div className="mt-4">
                  <button disabled={isCreating} onClick={(e) => { e.preventDefault(); handleNewBoard(); }} className="inline-flex items-center rounded-md bg-[#111111] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:opacity-75">
                    <Plus className="-ml-0.5 mr-1.5 h-4 w-4" />
                    {isCreating ? "Creating..." : "New Board"}
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
                {boards.map(board => (
                  <div key={board.id} className="group relative bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col h-48">
                    {/* Visual contents of the card wrapped inside a single block Link */}
                    <Link to={`/board/${board.id}`} className="flex-1 flex flex-col min-h-0">
                      {/* Canvas Preview Area */}
                      <div className="flex-1 relative border-b border-gray-100 bg-[#FAFAFA] overflow-hidden">
                         {/* Subtle grid background */}
                         <div className="absolute inset-0 bg-[radial-gradient(circle,#E2E2E2_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                         
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full p-4 pointer-events-none opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                             <div className="flex items-center justify-center h-full relative">
                               <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg bg-white/50"></div>
                             </div>
                         </div>
                      </div>
                      
                      {/* Card Info Footer */}
                      <div className="p-3 bg-white flex flex-col justify-between h-16">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-sm truncate text-[#111111]">{board.title}</h4>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-[11px] text-gray-500 flex items-center gap-1">
                            <Clock size={10} /> 
                            {new Date(board.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </Link>

                    {/* Action buttons sitting absolutely on top, safely outside the Link container */}
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                       <button onClick={(e) => handleRenameBoard(e, board.id, board.title)} className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-blue-600 hover:bg-gray-50 shadow-sm transition-colors cursor-pointer" title="Rename Board"><Pencil size={12} /></button>
                       <button onClick={(e) => handleDeleteBoard(e, board.id)} className="w-7 h-7 bg-white border border-gray-200 rounded-lg flex items-center justify-center text-gray-500 hover:text-[#FF3B30] hover:bg-gray-50 shadow-sm transition-colors cursor-pointer" title="Delete Board"><Trash2 size={12} /></button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* AI Workspace Entry Area */}
          <section>
             <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-sm overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-b from-gray-100 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
                   <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-gray-700">
                           <Wand2 size={14} />
                        </div>
                        <h3 className="font-semibold text-[#111111]">Generate with Yukti AI</h3>
                      </div>
                      <p className="text-sm text-gray-500 mb-4">Describe what you want to build. Our AI will generate wireframes, flowcharts, or mind maps instantly.</p>
                      
                      <div className="relative">
                         <input 
                           type="text" 
                           placeholder="e.g. A user registration flow for a fintech app..." 
                           className="w-full bg-white border border-gray-200 rounded-lg py-2.5 pl-3 pr-24 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 shadow-sm transition-all"
                         />
                         <button onClick={() => alert("AI Generation is currently disabled in this demo.")} className="absolute right-1.5 top-1.5 bottom-1.5 bg-[#111111] text-white px-3 rounded-md text-xs font-semibold hover:bg-gray-800 transition-colors flex items-center gap-1">
                            Generate <Sparkles size={12} className="text-gray-300" />
                         </button>
                      </div>
                      
                      <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
                         <button onClick={() => alert("Prompt suggested!")} className="shrink-0 text-[11px] font-medium border border-gray-200 rounded-full py-1 px-3 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300">User Flow</button>
                         <button onClick={() => alert("Prompt suggested!")} className="shrink-0 text-[11px] font-medium border border-gray-200 rounded-full py-1 px-3 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300">Architecture Diagram</button>
                         <button onClick={() => alert("Prompt suggested!")} className="shrink-0 text-[11px] font-medium border border-gray-200 rounded-full py-1 px-3 bg-white text-gray-600 hover:bg-gray-50 hover:border-gray-300">Mind Map</button>
                      </div>
                   </div>
                   
                   <div className="hidden md:flex w-32 h-32 bg-white border border-gray-200 rounded-xl shadow-sm items-center justify-center relative transform group-hover:-translate-y-1 transition-transform">
                      <div className="w-20 h-2 border-t-2 border-dashed border-gray-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
                      <div className="w-8 h-6 bg-gray-100 border border-gray-200 rounded absolute left-4"></div>
                      <div className="w-8 h-6 bg-gray-100 border border-gray-200 rounded absolute right-4"></div>
                      <Sparkles className="absolute -top-2 -right-2 text-gray-300 w-6 h-6" />
                   </div>
                </div>
             </div>
          </section>

          {/* Templates Gallery */}
          <section>
             <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-sm text-[#111111] flex items-center gap-2">Templates</h2>
              <Link to="/app/templates" className="text-xs font-medium text-gray-500 hover:text-[#111111] flex items-center gap-1 transition-colors">
                 Browse Gallery <ArrowRight size={12} />
              </Link>
            </div>
             <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
               {[
                 { title: 'System Architecture', id: 't19', icon: <Frame size={16} />, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
                 { title: 'User Flow', id: 't14', icon: <Network size={16} />, color: 'bg-orange-50 text-orange-600 border-orange-100' },
                 { title: 'Sprint Board', id: 't8', icon: <FolderKanban size={16} />, color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
                 { title: 'Product Roadmap', id: 't2', icon: <LayoutTemplate size={16} />, color: 'bg-blue-50 text-blue-600 border-blue-100' },
                 { title: 'Mind Map', id: 't1', icon: <Sparkles size={16} />, color: 'bg-[#FFD60A]/10 text-yellow-700 border-[#FFD60A]/30' },
               ].map((temp, i) => (
                 <button key={i} onClick={async () => {
                   if (!user) return;
                   try {
                     const TemplateLib = await import('../../lib/templates');
                     const template = TemplateLib.defaultTemplates.find(t => t.id === temp.id);
                     let content = { shapes: [], viewport: { x: 0, y: 0, zoom: 1 } };
                     if (template) {
                       content.shapes = template.shapes as any;
                     }
                     const newBoard = await createBoard(user.id, temp.title, content);
                     nav(`/board/${newBoard.id}`);
                   } catch (err: any) {
                     console.error(err);
                     alert("Error creating board: " + (err.message || JSON.stringify(err)));
                   }
                 }} className={`shrink-0 w-40 p-4 border rounded-xl flex flex-col gap-3 hover:shadow-md transition-all group text-left ${temp.color}`}>
                   <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      {temp.icon}
                   </div>
                   <div className="mt-auto">
                     <h4 className="font-semibold text-sm">{temp.title}</h4>
                   </div>
                 </button>
               ))}
            </div>
          </section>

        </div>

        {/* Right Column (Sidebar) */}
        <div className="space-y-6">
          
          {/* Live Activity Timeline */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-50 to-white">
               <h2 className="font-semibold text-sm text-[#111111]">Activity</h2>
               <div className="flex items-center gap-1">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Live</span>
               </div>
            </div>
            
            <div className="p-5">
              <div className="relative border-l border-gray-100 ml-3 space-y-6">
                {[
                  { name: 'Sarah J.', initial: 'S', color: 'bg-green-500', action: 'added a comment to', target: 'Q4 Product Roadmap', time: 'Just now', icon: <MessageSquare size={10} /> },
                  { name: 'Mike T.', initial: 'M', color: 'bg-blue-500', action: 'shared', target: 'Auth Flow', time: '1h ago', icon: <Users size={10} /> },
                  { name: 'Elena R.', initial: 'E', color: 'bg-purple-500', action: 'created', target: 'System Architecture', time: '3h ago', icon: <Plus size={10} /> },
                  { name: 'Alex M.', initial: 'A', color: 'bg-indigo-500', action: 'resolved a comment in', target: 'Marketing Campaign', time: 'Yesterday', icon: <Star size={10} /> },
                ].map((act, i) => (
                  <div key={i} className="relative pl-6">
                    <div className="absolute -left-3 top-0 w-6 h-6 rounded-full border border-white flex items-center justify-center shadow-sm z-10 overflow-hidden">
                       <div className={`w-full h-full ${act.color} flex items-center justify-center text-white text-[10px] font-bold`}>{act.initial}</div>
                       <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full flex items-center justify-center text-gray-500">{act.icon}</div>
                    </div>
                    <div>
                      <p className="text-[13px] text-gray-600 leading-snug">
                        <span className="font-semibold text-[#111111]">{act.name}</span> {act.action} <Link to="#" className="font-medium text-[#111111] hover:underline decoration-gray-300">{act.target}</Link>
                      </p>
                      <span className="text-[11px] text-gray-400 mt-0.5 block">{act.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-6 py-2 text-xs font-semibold text-gray-500 hover:text-[#111111] bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-100 border-dashed">
                 View all activity
              </button>
            </div>
          </div>

          {/* Upgrade Banner */}
          <div className="bg-[#111111] rounded-xl p-5 text-white shadow-xl relative overflow-hidden group">
             {/* Decorative background */}
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF3B30] rounded-full blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
             
             <div className="relative z-10">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center mb-4">
                   <ArrowUpRight size={16} className="text-[#FFD60A]" />
                </div>
                <h3 className="font-semibold text-sm mb-1">Upgrade to Pro</h3>
                <p className="text-xs text-gray-400 mb-4 max-w-[180px]">Get unlimited boards, custom templates, and advanced AI features.</p>
                <button className="w-full bg-[#FF3B30] text-white py-2 rounded-lg text-xs font-bold hover:bg-[#E3261C] transition-colors">
                   View Plans
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  )
}
