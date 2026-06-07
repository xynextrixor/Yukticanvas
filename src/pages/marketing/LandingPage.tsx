import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Infinity, PenTool, Users, Download } from "lucide-react"
import { useAuth } from "@/lib/AuthContext"

export default function LandingPage() {
  const { user } = useAuth();
  
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative pt-12 pb-24 overflow-hidden">
        <div className="absolute top-8 right-1/4 w-32 h-8 bg-accent rotate-3 rounded pointer-events-none z-0 hidden lg:block opacity-20" />
        <div className="absolute top-12 right-1/4 text-xl font-bold font-display transform rotate-6 pointer-events-none z-10 w-64 text-center text-text-muted opacity-40 hidden lg:block">
          INFINITE CANVAS. LIMITLESS IDEAS.
        </div>
        {/* Hand drawn arrows pointing down */}
        <svg className="absolute top-32 left-[45%] w-16 h-16 pointer-events-none z-10 hidden lg:block text-primary/30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
           <path d="M7 7l5 5 5-5" />
           <path d="M12 2v10" />
        </svg>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10 mt-8">
          <div>
            <h1 className="font-display font-black text-6xl md:text-8xl leading-[0.9] tracking-tighter mb-6 relative">
              <span className="block">TURN IDEAS</span>
              <span className="block text-primary">INTO <span className="relative text-[#ffd930]">VISUALS.<svg className="absolute -bottom-2 left-0 w-full h-4 text-text-main" viewBox="0 0 200 20" preserveAspectRatio="none"><path d="M0 10 Q 50 20 100 10 T 200 10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/></svg></span></span>
              
              {/* Crown doodle */}
              <svg className="absolute -top-12 right-0 w-16 h-16 text-primary rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17l5-10 4 6 4-6 5 10Z"/><path d="M2 17h18"/></svg>
            </h1>

            <p className="text-xl text-text-muted mb-8 max-w-lg leading-relaxed font-medium">
              YuktiCanvas is the all-in-one visual workspace for sketching, brainstorming and collaborating in real-time. Simple. Powerful. <span className="bg-accent px-1 font-bold text-text-main underline decoration-2">Yours.</span>
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 mb-8">
              {user ? (
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/20" asChild>
                  <Link to="/app">
                    Go to Workspace <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg shadow-xl shadow-primary/20" asChild>
                  <Link to="/signup">
                    Start Drawing — It's Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="secondary" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-2">
                <Play className="mr-2 w-5 h-5 fill-current" /> Live Demo
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {[1,2,3,4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-gray-200 overflow-hidden flex items-center justify-center text-xs font-bold bg-primary/10 text-primary">
                    U{i}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center font-bold text-xs z-10">
                  3K+
                </div>
              </div>
              <p className="text-sm font-medium">Loved by <span className="bg-accent px-1 font-bold">3,000+</span> creators and teams</p>
            </div>
          </div>

          <div className="relative mt-12 lg:mt-0">
             {/* Abstract dot pattern behind */}
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-[radial-gradient(circle,#111_2px,transparent_2px)] bg-[size:16px_16px] opacity-20 transform rotate-12 rounded-full pointer-events-none" />
             <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-[radial-gradient(circle,#111_2px,transparent_2px)] bg-[size:16px_16px] opacity-20 transform -rotate-12 rounded-full pointer-events-none" />
             <div className="absolute right-0 top-1/2 w-64 h-64 bg-primary rounded-full blur-3xl opacity-20 pointer-events-none" />

             {/* UI Mockup Card */}
             <div className="relative bg-white rounded-2xl border border-border shadow-2xl shadow-black/10 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-500">
                {/* Header */}
                <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-primary rounded shadow flex items-center justify-center text-white font-display font-bold text-[10px] leading-none pt-0.5">y</div>
                    <span className="font-display font-bold text-sm tracking-tight">YuktiCanvas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border border-white" />
                      <div className="w-6 h-6 rounded-full bg-green-500 border border-white" />
                      <div className="w-6 h-6 rounded-full bg-yellow-500 border border-white" />
                    </div>
                    <Button size="sm" className="h-7 text-xs bg-primary hover:bg-primary-hover px-3">Share</Button>
                  </div>
                </div>
                {/* Canvas Body simulated */}
                <div className="h-[400px] w-full canvas-bg relative p-8">
                   {/* Toolbar */}
                   <div className="absolute top-4 left-4 flex flex-col bg-white border border-border rounded-lg shadow-sm p-1 gap-1">
                     <div className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center rotate-45 border-black border-2"><ArrowRight size={16} /></div>
                     <div className="w-8 h-8 rounded hover:bg-gray-100 border border-gray-300" />
                     <div className="w-8 h-8 rounded hover:bg-gray-100 border border-gray-300 rounded-full" />
                     <div className="w-8 h-8 rounded hover:bg-gray-100 flex items-center justify-center font-display font-bold text-lg">T</div>
                   </div>
                   
                   {/* Diagram mock */}
                   <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-sm">
                      <div className="relative h-48 w-full">
                         <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full border-2 border-primary bg-white z-10 flex items-center justify-center shadow-lg">
                           <span className="font-display font-bold text-center leading-tight text-primary">BIG<br/>IDEA</span>
                         </div>
                         <div className="absolute top-0 left-0 w-24 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center">
                           <span className="font-bold text-xs underline decoration-accent decoration-4">Brainstorm</span>
                         </div>
                         <div className="absolute top-0 right-0 w-20 h-12 rounded-full border-2 border-black bg-white flex items-center justify-center">
                           <span className="font-bold text-xs">Plan</span>
                         </div>
                         <div className="absolute bottom-4 right-10 w-20 h-8 bg-accent border-2 border-black flex items-center justify-center skew-x-12">
                           <span className="font-bold text-xs -skew-x-12">Design</span>
                         </div>
                         <div className="absolute bottom-0 left-10 w-20 h-8 border-2 border-black bg-white flex items-center justify-center">
                           <span className="font-bold text-xs">Execute</span>
                         </div>
                         {/* Connecting lines mocked */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex: 0}}>
                            <path d="M 96 24 L 140 70" stroke="black" strokeWidth="2" fill="none" />
                            <path d="M 288 24 L 220 70" stroke="black" strokeWidth="2" fill="none" />
                            <path d="M 320 160 L 230 110" stroke="black" strokeWidth="2" fill="none" />
                            <path d="M 120 192 L 170 130" stroke="black" strokeWidth="2" fill="none" />
                         </svg>
                      </div>
                   </div>

                   {/* Floating Toolbar mock */}
                   <div className="absolute bottom-8 right-8 bg-[#2A2A2A] rounded-xl shadow-2xl p-3 flex flex-col gap-3 text-white w-64 border border-white/10 z-20">
                     <div className="flex gap-2">
                       <div className="w-6 h-6 rounded-full bg-primary ring-2 ring-white"></div>
                       <div className="w-6 h-6 rounded-full bg-accent"></div>
                       <div className="w-6 h-6 rounded-full bg-white"></div>
                       <div className="w-6 h-6 rounded-full bg-gray-400"></div>
                       <div className="w-6 h-6 rounded-full bg-black border border-white/20"></div>
                     </div>
                     <div className="flex items-center gap-2 px-1">
                       <div className="w-full h-1 bg-gray-600 rounded-full relative">
                         <div className="absolute left-1/4 w-3 h-3 bg-white rounded-full top-1/2 transform -translate-y-1/2"></div>
                       </div>
                     </div>
                   </div>
                </div>
             </div>

             {/* Bottom Note */}
             <div className="absolute -bottom-8 right-12 z-20 hidden md:block">
               <svg className="absolute -top-12 -left-12 w-16 h-16 text-accent transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                 <path d="M9 14l-4-4 4-4" />
                 <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
               </svg>
               <div className="bg-accent text-text-main font-bold p-3 border-2 border-black transform rotate-2 text-sm max-w-[200px] shadow-sm">
                 DRAW. PLAN. COLLABORATE.<br/>ALL IN ONE PLACE.
               </div>
             </div>

          </div>
        </div>
      </section>

      {/* Features Ribbon */}
      <section className="bg-white py-12 border-y border-border">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-gray-50 rounded-2xl p-8 border border-border grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard 
              icon={<Infinity className="w-8 h-8 text-primary" />}
              title="Infinite Canvas"
              text="Think big. Draw bigger. No limits."
            />
             <FeatureCard 
              icon={<PenTool className="w-8 h-8 text-primary" />}
              title="Smart Tools"
              text="Shapes, connectors, text and more."
            />
             <FeatureCard 
              icon={<Users className="w-8 h-8 text-primary" />}
              title="Real-time Collaboration"
              text="Invite anyone. Work together, instantly."
            />
             <FeatureCard 
              icon={<Download className="w-8 h-8 text-primary" />}
              title="Export Anywhere"
              text="PNG, SVG, PDF or share a link."
            />
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, text }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-1">{icon}</div>
      <div>
        <h3 className="font-bold font-display text-lg mb-1">{title}</h3>
        <p className="text-sm text-text-muted">{text}</p>
      </div>
    </div>
  )
}
