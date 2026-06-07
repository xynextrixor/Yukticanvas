import React from "react"
import { Link } from "react-router-dom"
import { Clock, Star, Clock3, Filter } from "lucide-react"

export default function RecentPage() {
  const recentBoards = [
    { id: 1, title: 'Q4 Product Roadmap', date: 'Updated 2m ago', color: 'bg-white', tag: 'Planning' },
    { id: 2, title: 'Authentication Flow', date: 'Updated 1h ago', color: 'bg-white', tag: 'UX Flow' },
    { id: 3, title: 'Marketing Campaign', date: 'Updated yesterday', color: 'bg-white', tag: 'Strategy' },
    { id: 4, title: 'System Architecture', date: 'Updated 2d ago', color: 'bg-white', tag: 'Engineering' },
    { id: 5, title: 'Sprint Retrospective', date: 'Updated 3d ago', color: 'bg-white', tag: 'Agile' },
    { id: 6, title: 'User Research Findings', date: 'Updated 4d ago', color: 'bg-white', tag: 'Research' },
    { id: 7, title: 'Landing Page Wireframe', date: 'Updated 1w ago', color: 'bg-white', tag: 'Design' },
    { id: 8, title: 'Database Schema', date: 'Updated 2w ago', color: 'bg-white', tag: 'Backend' },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1200px] mx-auto space-y-8 bg-[#FAFAFA] min-h-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white text-gray-700 rounded-xl flex items-center justify-center border border-gray-200 flex-shrink-0 shadow-sm">
            <Clock3 size={24} />
          </div>
          <div>
            <h1 className="font-semibold text-2xl text-[#111111] tracking-tight">Recent Boards</h1>
            <p className="text-gray-500 text-sm mt-1">Boards you've viewed or edited recently.</p>
          </div>
        </div>
        
        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-all bg-white text-[#111111] border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm h-9 px-4 py-2 gap-2">
          <Filter size={14} /> Filter
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {recentBoards.map(board => (
          <Link key={board.id} to={`/board/${board.id}`} className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-300 flex flex-col h-56">
            {/* Canvas Preview Area */}
            <div className={`flex-1 relative border-b border-gray-100 bg-[#FAFAFA] overflow-hidden`}>
                {/* Subtle grid background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle,#E2E2E2_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                
                {/* Mock Canvas Elements to make it feel alive */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full p-4 pointer-events-none opacity-60 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500">
                  {board.id % 4 === 1 && (
                      <div className="flex gap-2 items-center justify-center h-full">
                        <div className="w-12 h-8 bg-blue-100 border border-blue-200 rounded"></div>
                        <div className="w-8 h-[1px] bg-gray-300"></div>
                        <div className="w-12 h-8 bg-green-100 border border-green-200 rounded"></div>
                      </div>
                  )}
                  {board.id % 4 === 2 && (
                      <div className="flex flex-col gap-2 items-center justify-center h-full">
                        <div className="w-16 h-6 bg-[#FFD60A]/20 border border-[#FFD60A]/50 rounded-full"></div>
                        <div className="w-[1px] h-4 bg-gray-300"></div>
                        <div className="w-20 h-10 bg-white border border-gray-300 rounded shadow-sm"></div>
                      </div>
                  )}
                  {board.id % 4 === 3 && (
                      <div className="grid grid-cols-2 gap-2 h-full items-center justify-center">
                        <div className="w-10 h-10 bg-[#FF3B30]/10 border border-[#FF3B30]/30 rounded"></div>
                        <div className="w-10 h-10 bg-purple-100 border border-purple-200 rounded"></div>
                        <div className="w-10 h-10 bg-orange-100 border border-orange-200 rounded"></div>
                      </div>
                  )}
                  {board.id % 4 === 0 && (
                      <div className="flex items-center justify-center h-full relative">
                        <div className="w-24 h-16 border-2 border-dashed border-gray-300 rounded-lg"></div>
                        <div className="absolute w-8 h-8 bg-white border border-gray-300 rounded shadow-sm z-10"></div>
                      </div>
                  )}
                </div>

                {/* Top internal actions */}
                <div className="absolute top-3 right-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="w-6 h-6 bg-white border border-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:text-[#111111] shadow-sm"><Star size={12} /></button>
                </div>
            </div>
            
            {/* Card Info Footer */}
            <div className="p-4 bg-white flex flex-col justify-between h-[72px]">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold text-sm truncate text-[#111111]">{board.title}</h4>
                <span className="text-[10px] font-medium bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{board.tag}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-[11px] text-gray-500 flex items-center gap-1"><Clock size={10} /> {board.date}</p>
                <div className="flex -space-x-1.5">
                    <div className="w-4 h-4 rounded-full border border-white bg-blue-500 flex items-center justify-center text-[8px] text-white font-bold">A</div>
                    <div className="w-4 h-4 rounded-full border border-white bg-green-500 flex items-center justify-center text-[8px] text-white font-bold">S</div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
