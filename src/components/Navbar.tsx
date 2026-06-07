import { useState, useEffect, ReactNode } from "react"
import { Link, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "motion/react"
import { Menu } from "lucide-react"
import { useAuth } from "../lib/AuthContext"
import { YuktiCanvasLogo } from "../components/YuktiCanvasLogo"

interface NavLinkProps {
  to: string;
  children: ReactNode;
  scrolled: boolean;
}

function NavLink({ to, children, scrolled }: NavLinkProps) {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`relative py-1.5 text-sm font-semibold tracking-tight transition-all duration-300 ease-out select-none flex items-center justify-center ${
        scrolled 
          ? "text-[#FF3B30]/85 hover:text-[#FF3B30] hover:scale-105" 
          : "text-[#111111]/85 hover:text-[#FF3B30] hover:scale-105"
      }`}
    >
      <span className="relative z-10">{children}</span>
      {isActive && (
        <motion.div 
          layoutId="active-underline-global"
          className="absolute -bottom-1 inset-x-1.5 h-0.5 rounded-full z-0 bg-[#FF3B30]"
          transition={{ type: "spring", stiffness: 380, damping: 30 }}
        />
      )}
      {!isActive && (
        <span className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0.5 rounded-full transition-all duration-300 hover-trigger group-hover:w-4/5 ${
          scrolled ? "bg-[#FF3B30]/40" : "bg-[#FF3B30]/30"
        } origin-center`} />
      )}
    </Link>
  );
}

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  // Intelligent scroll capturing for both window scrolls & local container scrolls
  useEffect(() => {
    const handleScroll = (e: any) => {
      const scrollTop = e.target === document || e.target === window ? window.scrollY : (e.target?.scrollTop || 0);
      if (scrollTop > 15) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, []);

  const isInsideApp = location.pathname.startsWith('/app');
  const hasYellowBg = scrolled || isInsideApp;

  return (
    <header 
      className={`z-40 transition-all duration-300 ease-out select-none pointer-events-none w-full ${
        isInsideApp 
          ? "absolute top-0 left-0 right-0" 
          : "fixed top-0 left-0 right-0"
      }`}
    >
      <div 
        className={`w-full transition-all duration-300 ease-out pointer-events-auto border-b ${
          hasYellowBg
            ? "bg-[#FFD60A]/95 backdrop-blur-md border-[#FFD60A] shadow-[0_4px_30px_rgba(255,214,10,0.22)]" 
            : "bg-transparent border-transparent"
        }`}
      >
        <div 
          className={`mx-auto flex items-center justify-between transition-all duration-300 px-6 sm:px-8 ${
            hasYellowBg ? "py-3 min-h-[64px]" : "py-5 min-h-[80px]"
          } w-full max-w-full`}
        >
          {/* Brand Logo & Mobile Menu */}
          <div className="flex items-center gap-2">
            {isInsideApp && onMenuClick && (
              <button 
                onClick={onMenuClick}
                className="md:hidden p-1.5 rounded-full bg-white/70 border border-[#FFD60A] active:scale-95 transition-transform cursor-pointer"
                aria-label="Open mobile menu"
              >
                <Menu size={16} className="text-[#111111]" />
              </button>
            )}
            {!isInsideApp && (
              <Link 
                to="/" 
                className="flex items-center active:scale-95 transition-transform duration-300 shrink-0"
                style={{ transform: hasYellowBg ? "scale(0.9)" : "scale(1)" }}
              >
                <YuktiCanvasLogo height={hasYellowBg ? 26 : 30} />
              </Link>
            )}
          </div>
          
          {/* Main Navigation (Adapts contextually: marketing vs inside workspace) */}
          <nav className="hidden md:flex items-center gap-7">
            {isInsideApp ? (
              <>
                <NavLink to="/app" scrolled={hasYellowBg}>Dashboard</NavLink>
                <NavLink to="/app/recent" scrolled={hasYellowBg}>Boards</NavLink>
                <NavLink to="/app/templates" scrolled={hasYellowBg}>Templates</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/" scrolled={hasYellowBg}>Features</NavLink>
                <NavLink to="/pricing" scrolled={hasYellowBg}>Pricing</NavLink>
              </>
            )}
          </nav>

          {/* Floating Call to Action */}
          <div className="flex items-center gap-4 shrink-0">
            {user ? (
              <>
                <button 
                  onClick={() => signOut()} 
                  className={`text-xs font-semibold tracking-tight transition-all duration-300 active:scale-95 cursor-pointer ${
                    hasYellowBg 
                      ? "text-[#FF3B30]/80 hover:text-[#FF3B30]" 
                      : "text-[#111111]/80 hover:text-[#FF3B30]"
                  }`}
                >
                  Log out
                </button>
                
                {!isInsideApp && (
                  <Link to="/app" className="no-underline">
                    <motion.div
                      animate={scrolled ? { scale: 1.05 } : { scale: 1 }}
                      transition={{ type: "spring", stiffness: 450, damping: 25 }}
                      className={`inline-flex items-center justify-center font-bold text-xs tracking-tight rounded-full transition-all duration-300 ease-out active:scale-95 ${
                        scrolled 
                          ? "bg-[#FF3B30] text-white py-2 px-5 shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:bg-[#E52F25] hover:shadow-[0_6px_18px_rgba(255,59,48,0.4)]"
                          : "bg-[#111111] text-white py-2 px-4 hover:bg-neutral-800"
                      }`}
                    >
                      Go to App &rarr;
                    </motion.div>
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className={`text-xs font-bold tracking-tight transition-all duration-300 active:scale-95 ${
                    hasYellowBg 
                      ? "text-[#FF3B30] hover:text-[#FF3B30]/80" 
                      : "text-[#111111] hover:text-[#FF3B30]"
                  }`}
                >
                  Log in
                </Link>
                <Link to="/signup" className="no-underline">
                  <motion.div
                    animate={scrolled ? { scale: 1.05 } : { scale: 1 }}
                    transition={{ type: "spring", stiffness: 450, damping: 25 }}
                    className={`inline-flex items-center justify-center font-bold text-xs tracking-tight rounded-full transition-all duration-300 ease-out active:scale-95 ${
                      scrolled 
                        ? "bg-[#FF3B30] text-white py-2 px-5 shadow-[0_4px_12px_rgba(255,59,48,0.3)] hover:bg-[#E52F25] hover:shadow-[0_6px_18px_rgba(255,59,48,0.4)]"
                        : "bg-[#111111] text-white py-2 px-4 hover:bg-neutral-800"
                    }`}
                  >
                    Get Started &rarr;
                  </motion.div>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
