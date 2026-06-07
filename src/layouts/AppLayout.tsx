import { useState, useEffect } from "react"
import { Outlet, Link, useLocation, Navigate } from "react-router-dom"
import { Home, Layers, LayoutTemplate, Users, Star, Bell, Settings, Sparkles, ChevronDown, Search, Plus, LogOut, Menu, X, PanelLeftClose, PanelLeft, Database } from "lucide-react"
import { useAuth } from "../lib/AuthContext"
import { YuktiCanvasLogo } from "../components/YuktiCanvasLogo"
import Navbar from "../components/Navbar"

import NotificationCenter from "../components/NotificationCenter"

export default function AppLayout() {
  const location = useLocation();
  const { user, loading, signOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userInitial = user.email ? user.email.charAt(0).toUpperCase() : "U";

  const SidebarContent = () => (
    <>
      {!isCollapsed && (
        <div className="px-4 py-3 shrink-0">
          <div className="relative group">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF3B30] transition-colors" />
            <input 
              type="text" 
              placeholder="Search boards..." 
              className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-8 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF3B30] focus:border-[#FF3B30] transition-all"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400 border border-gray-200 rounded px-1 bg-white">⌘K</div>
          </div>
        </div>
      )}
      {isCollapsed && (
        <div className="px-4 py-3 shrink-0 flex justify-center">
            <button className="p-2 text-gray-400 hover:text-[#FF3B30] bg-gray-50 rounded-md border border-gray-200"><Search size={14} /></button>
        </div>
      )}

      <div className="px-3 space-y-6 flex-1 overflow-y-auto pb-4 mt-2">
        <div>
          <nav className="space-y-0.5">
            <NavItem to="/app" icon={<Home size={16} />} label="Home" active={location.pathname === '/app'} isCollapsed={isCollapsed} />
            <NavItem to="/app/recent" icon={<Layers size={16} />} label="Boards" isCollapsed={isCollapsed} />
            <NavItem to="/app/templates" icon={<LayoutTemplate size={16} />} label="Templates" isCollapsed={isCollapsed} />
            <NavItem to="/app/ai" icon={<Sparkles size={16} />} label="AI Workspace" badge="New" badgeColor="bg-[#FFD60A] text-yellow-900" isCollapsed={isCollapsed} />
          </nav>
        </div>

        <div>
          {!isCollapsed ? (
            <div className="px-3 flex items-center justify-between mb-1">
              <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap overflow-hidden text-ellipsis">Workspace</h4>
              <button className="text-gray-400 hover:text-[#111111] transition-colors shrink-0"><Plus size={14} /></button>
            </div>
          ) : (
            <div className="px-3 flex justify-center mb-1">
              <div className="h-px bg-gray-200 w-full my-2"></div>
            </div>
          )}
          <nav className="space-y-0.5">
            <NavItem to="/app/shared" icon={<Users size={16} />} label="Shared with me" isCollapsed={isCollapsed} />
            <NavItem to="/app/favorites" icon={<Star size={16} />} label="Favorites" isCollapsed={isCollapsed} />
          </nav>
        </div>
      </div>

      <div className="p-3 border-t border-gray-100 shrink-0">
        <nav className="space-y-0.5 mb-2">
          {!isCollapsed ? (
            <div className="flex items-center justify-between px-3 py-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-600">
               <div className="flex items-center gap-3 text-[13px] font-medium"><Bell size={16} /> Notifications</div>
               <NotificationCenter />
            </div>
          ) : (
             <div className="flex justify-center py-2">
                <NotificationCenter />
             </div>
          )}
          <NavItem to="/app/settings" icon={<Settings size={16} />} label="Settings" isCollapsed={isCollapsed} />
        </nav>
        <Link to="/app/settings" className={`mt-2 flex ${isCollapsed ? 'justify-center' : 'items-center justify-between'} p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group relative`}>
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-2 max-w-[calc(100%-24px)]'}`}>
            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-500 to-blue-400 flex shrink-0 items-center justify-center text-white font-bold text-[10px] shadow-sm">
              {userInitial}
            </div>
            {!isCollapsed && (
              <div className="overflow-hidden">
                <div className="text-xs font-semibold truncate" title={user.user_metadata?.full_name || user.email}>
                  {user.user_metadata?.full_name || user.email?.split('@')[0]}
                </div>
                <div className="text-[10px] text-gray-500 truncate">Pro Plan</div>
              </div>
            )}
          </div>
          {!isCollapsed ? (
             <button 
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 signOut();
               }} 
               className="text-gray-400 hover:text-[#FF3B30] p-1 flex items-center gap-1 group/btn shrink-0" 
               title="Sign out"
             >
               <span className="text-[10px] uppercase font-bold opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap">Sign out</span>
               <LogOut size={14} />
             </button>
          ) : (
             <button 
               onClick={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
                 signOut();
               }} 
               className="absolute right-0 top-0 bottom-0 px-2 opacity-0 group-hover:opacity-100 bg-white/90 text-[#FF3B30] flex items-center justify-center rounded-r-lg transition-opacity" 
               title="Sign out"
             >
               <LogOut size={14} />
             </button>
          )}
        </Link>
      </div>
    </>
  );

  return (
    <div className="h-screen w-full flex bg-[#FAFAFA] text-[#111111] font-sans overflow-hidden">
      
      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - Desktop & Tablet & Mobile */}
      <aside 
        className={`
          fixed md:relative z-50 h-full border-r border-gray-200 bg-white flex flex-col shrink-0 transition-all duration-300 ease-in-out pt-4
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${isCollapsed ? 'w-[72px]' : 'w-[260px]'}
        `}
      >
        <SidebarContent />
        
        {/* Collapse Toggle for Desktop/Tablet */}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-[#111111] shadow-sm z-10"
        >
          {isCollapsed ? <PanelLeft size={14} /> : <PanelLeftClose size={14} />}
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-[#FAFAFA] relative">
        <Navbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <div className="flex-1 overflow-x-hidden overflow-y-auto pt-24 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function NavItem({ to, icon, label, active, badge, badgeColor, isCollapsed }: any) {
  const location = useLocation();
  const isActive = active !== undefined ? active : location.pathname === to;
  return (
    <Link
      to={to}
      className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'justify-between px-3'} py-2 md:py-1.5 rounded-lg md:rounded-md text-[14px] md:text-[13px] font-medium transition-all duration-200 ${
        isActive 
          ? "bg-red-50 text-[#FF3B30]" 
          : "text-gray-600 hover:bg-gray-100/80 hover:text-[#111111]"
      }`}
      title={isCollapsed ? label : undefined}
    >
      <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : 'gap-3 md:gap-2.5 max-w-full'}`}>
        <span className={`${isActive ? "text-[#FF3B30]" : "text-gray-400"} flex shrink-0 items-center`}>{icon}</span>
        {!isCollapsed && <span className="truncate">{label}</span>}
      </div>
      {!isCollapsed && badge && (
        <span className={`${badgeColor || 'bg-[#FF3B30] text-white'} shrink-0 text-[10px] md:text-[9px] font-bold px-1.5 py-0.5 rounded-sm md:rounded-sm leading-none`}>
          {badge}
        </span>
      )}
      {isCollapsed && badge && (
         <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#FF3B30]" />
      )}
    </Link>
  )
}
