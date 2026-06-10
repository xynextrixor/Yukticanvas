import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Send, Bot, Sparkles, RefreshCcw, ArrowRight, Loader2, Plus, Terminal } from "lucide-react";
import { useAuth } from "../../lib/AuthContext";
import { createBoard, getUserBoards, Board } from "../../lib/boards";

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  shapes?: any[];
  isGenerating?: boolean;
}

// Inline Markdown and Formatting parser for light weights
function parseFormat(text: string) {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const matches = [...text.matchAll(boldRegex)];
  if (matches.length === 0) return text;

  const result: (string | React.ReactNode)[] = [];
  let lastIndex = 0;
  matches.forEach((match, idx) => {
    const startIndex = match.index !== undefined ? match.index : 0;
    if (startIndex > lastIndex) {
      result.push(text.substring(lastIndex, startIndex));
    }
    result.push(
      <strong key={idx} className="font-bold text-gray-900 border-b border-dashed border-gray-200">
        {match[1]}
      </strong>
    );
    lastIndex = startIndex + match[0].length;
  });
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }
  return <>{result}</>;
}

function ChatMessageText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1.5 text-sm md:text-base text-gray-700 leading-relaxed font-normal">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        // Skip empty lines or render brief vertical break
        if (trimmed === "") {
          return <div key={idx} className="h-1.5" />;
        }
        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const content = trimmed.substring(2);
          return (
            <ul key={idx} className="list-disc pl-5 my-0.5 space-y-0.5">
              <li className="text-gray-700">{parseFormat(content)}</li>
            </ul>
          );
        }
        // Numbered list
        const orderedMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
        if (orderedMatch) {
          return (
            <ol key={idx} className="list-decimal pl-5 my-0.5 space-y-0.5">
              <li className="text-gray-700">{parseFormat(orderedMatch[2])}</li>
            </ol>
          );
        }
        // Headings
        if (trimmed.startsWith("### ")) {
          return (
            <h4 key={idx} className="text-sm font-bold text-gray-900 mt-3 mb-1">
              {parseFormat(trimmed.substring(4))}
            </h4>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <h3 key={idx} className="text-base font-bold text-gray-900 mt-4 mb-1.5">
              {parseFormat(trimmed.substring(3))}
            </h3>
          );
        }
        if (trimmed.startsWith("# ")) {
          return (
            <h2 key={idx} className="text-lg font-bold text-gray-950 mt-4 mb-2">
              {parseFormat(trimmed.substring(2))}
            </h2>
          );
        }
        // Ordinary text line
        return (
          <p key={idx} className="mb-0.5">
            {parseFormat(line)}
          </p>
        );
      })}
    </div>
  );
}

export default function PlaceholderPage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [input, setInput] = useState("");
  const [recentBoards, setRecentBoards] = useState<Board[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [openingBoardId, setOpeningBoardId] = useState<string | null>(null);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  
  // Storage load-restore
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const stored = localStorage.getItem("yukti_chat_workspace");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        // Fallback
      }
    }
    return [
      {
        id: "intro-message",
        sender: "assistant",
        text: "Hello! I am **Yukti AI Co-Designer**, your expert system schematic and diagram assistant. How can I help you map database models, brainstorm priorities, outline roadmaps, or design architecture flows today?\n\nSelect a preset template model on the left panel or describe your concept clearly below to compile and layout a professional graphical board."
      }
    ];
  });

  // Save messages history
  useEffect(() => {
    localStorage.setItem("yukti_chat_workspace", JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load actual recent user boards
  const refreshRecentBoards = () => {
    if (user?.id) {
      getUserBoards(user.id).then(boards => {
        setRecentBoards(boards.slice(0, 5));
      }).catch(err => {
        console.error("Failed to load user recent boards in workspace:", err);
      });
    }
  };

  useEffect(() => {
    refreshRecentBoards();
  }, [user]);

  const handleSendPrompt = async (promptToUse?: string) => {
    const textToSend = (promptToUse || input).trim();
    if (!textToSend || isSending) return;

    if (!promptToUse) {
      setInput("");
    }

    setIsSending(true);

    try {
      // 1. Auto generate a headline/title based on user prompt
      let clean = textToSend.replace(/^(create|generate|make|build|draw|design|show|me|an|a|the|some|diagram|uml|flowchart|mindmap|mind map|workflow|architecture|roadmap|journey|map|process)\s+/gi, "").trim();
      clean = clean.replace(/\s+(diagram|uml|flowchart|mindmap|mind map|workflow|architecture|roadmap|journey|map|process|layout|schematic|view|sketch)$/gi, "").trim();
      
      let title = "AI Schematic";
      if (clean) {
        const words = clean.split(/\s+/).slice(0, 5);
        title = words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ") + " Diagram";
      }

      // 2. Classify/Detect preset diagram type
      const lower = textToSend.toLowerCase();
      let dt: 'flowchart' | 'mindmap' | 'architecture' | 'journey' | 'roadmap' = "flowchart";
      if (lower.includes("mindmap") || lower.includes("mind map") || lower.includes("brainstorm") || lower.includes("ideas")) {
        dt = "mindmap";
      } else if (lower.includes("architecture") || lower.includes("aws") || lower.includes("cloud") || lower.includes("backend") || lower.includes("database") || lower.includes("uml") || lower.includes("system") || lower.includes("server")) {
        dt = "architecture";
      } else if (lower.includes("journey") || lower.includes("customer") || lower.includes("ux") || lower.includes("cx") || lower.includes("user")) {
        dt = "journey";
      } else if (lower.includes("roadmap") || lower.includes("timeline") || lower.includes("milestone") || lower.includes("gantt") || lower.includes("plan")) {
        dt = "roadmap";
      }

      // 3. Instantly create the board with our auto headline
      const newBoard = await createBoard(
        user?.id || "anonymous-ai",
        title,
        { shapes: [], viewport: { x: 0, y: 0, zoom: 1 } }
      );

      // 4. Navigate directly to that whiteboard canvas with query inputs!
      nav(`/board/${newBoard.id}?aiPrompt=${encodeURIComponent(textToSend)}&aiType=${dt}`);
    } catch (err: any) {
      console.error("Failed to automatically initialize AI workspace canvas:", err);
      alert("Error starting AI board project: " + err.message);
    } finally {
      setIsSending(false);
    }
  };

  // Create real dashboard whiteboard project from AI structures
  const handleOpenShapesInCanvas = async (shapes: any[], messageText: string, msgId: string) => {
    if (!shapes || shapes.length === 0 || openingBoardId) return;

    setOpeningBoardId(msgId);
    try {
      // Form clean schematic title
      let title = "AI Sketchpad";
      const mainHeader = shapes.find(s => s.text && s.text.length < 40);
      if (mainHeader && mainHeader.text) {
        title = mainHeader.text;
      } else {
        const textWords = messageText.split(" ");
        if (textWords.length > 2) {
          title = textWords.slice(0, 3).join(" ").replace(/[^\w\s]/g, "") + " Schematic";
        }
      }

      const newBoardContent = {
        shapes: shapes.map((s, idx) => ({
          ...s,
          id: s.id || `ai-shape-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
          strokeWidth: s.strokeWidth || 4,
          layer: s.layer || 2
        })),
        viewport: { x: 0, y: 0, zoom: 1 }
      };

      const newBoard = await createBoard(
        user?.id || "anonymous-ai",
        title || "AI Co-Designed Board",
        newBoardContent
      );

      // Refresh local board logs and navigate to actual whiteboard
      refreshRecentBoards();
      nav(`/board/${newBoard.id}`);
    } catch (err: any) {
      console.error("Failed to generate board from layout:", err);
      alert("Error starting board projection: " + err.message);
    } finally {
      setOpeningBoardId(null);
    }
  };

  const handleClearWorkspaceMessages = () => {
    if (confirm("Clear your AI Assistant chats and reset workspace?")) {
      setMessages([
        {
          id: "intro-message",
          sender: "assistant",
          text: "Hello! I am **Yukti AI Co-Designer**, your expert system schematic and diagram assistant. How can I help you map database models, brainstorm priorities, outline roadmaps, or design architecture flows today?\n\nSelect a preset template model on the left panel or describe your concept clearly below to compile and layout a professional graphical board."
        }
      ]);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-white">
      {/* Sidebar Panel - Prompts & Real recent boards list */}
      <div className="hidden md:flex flex-col w-[300px] border-r border-gray-200 bg-gray-50 shrink-0">
        <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <button 
            onClick={handleClearWorkspaceMessages}
            className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white rounded-lg py-2 text-sm font-semibold hover:bg-neutral-800 transition-colors shadow-sm"
          >
            <Sparkles size={14} className="text-[#FFD60A]" /> New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Preset templates list */}
          <div>
            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Templates</h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleSendPrompt("Generate high-level secure authentication flow including oauth authentication, validation database checks, and two-factor step.")}
                disabled={isSending}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg text-xs font-medium cursor-pointer hover:border-[#FF3B30] hover:bg-neutral-50 hover:shadow-sm transition-all focus:outline-none"
              >
                🔒 Generate Authentication Flow
              </button>
              <button 
                onClick={() => handleSendPrompt("Build a marketing brainstorming priorities mind map detailing content marketing channels, paid analytics, influencer partnerships, and referral loyalty tiers.")}
                disabled={isSending}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg text-xs font-medium cursor-pointer hover:border-[#FF3B30] hover:bg-neutral-50 hover:shadow-sm transition-all focus:outline-none"
              >
                💡 Create Marketing Mind Map
              </button>
              <button 
                onClick={() => handleSendPrompt("Generate highly-available serverless cloud software architecture representing nextjs frontends, express backend microservices, caching layer, and databases.")}
                disabled={isSending}
                className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg text-xs font-medium cursor-pointer hover:border-[#FF3B30] hover:bg-neutral-50 hover:shadow-sm transition-all focus:outline-none"
              >
                ☁️ Generate Cloud Architecture
              </button>
            </div>
          </div>
          
          {/* User's actual board records */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Recent Boards</h3>
              <button onClick={refreshRecentBoards} title="Refresh lists" className="text-[10px] text-gray-500 hover:text-black">Refresh</button>
            </div>
            
            {recentBoards.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No boards made yet. Generate a design to populate projects.</p>
            ) : (
              <div className="space-y-1">
                {recentBoards.map(board => (
                  <Link
                    key={board.id}
                    to={`/board/${board.id}`}
                    className="flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-600 bg-white border border-gray-100 hover:bg-gray-100 hover:text-gray-900 rounded-md cursor-pointer transition-colors max-w-full truncate shadow-sm"
                  >
                    <span className="truncate">📋 {board.title}</span>
                    <span className="text-[9px] text-gray-400 font-mono shrink-0 px-1">{new Date(board.created_at).toLocaleDateString()}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white relative">
        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 md:space-y-8">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div key={msg.id} className="flex gap-4 max-w-3xl mx-auto items-start">
                {isUser ? (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-rose-400 flex shrink-0 items-center justify-center text-white font-bold text-xs shadow-sm shadow-rose-200">
                    U
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#FFD60A]/10 border border-[#FFD60A]/30 flex shrink-0 items-center justify-center text-yellow-700 font-bold text-xs shadow-sm shadow-yellow-100">
                    <Bot size={16} className="text-yellow-600" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  {/* Chat message content */}
                  {msg.isGenerating ? (
                    <div className="flex flex-col gap-1 py-1">
                      <div className="flex items-center gap-1.5 text-xs text-rose-500 font-semibold animate-pulse">
                        <Loader2 size={13} className="animate-spin" />
                        Yukti is designing...
                      </div>
                      <p className="text-xs text-gray-400 font-medium">
                        Compiling flowchart steps, estimating orbiting node angles, and projecting whiteboard elements...
                      </p>
                    </div>
                  ) : (
                    <ChatMessageText text={msg.text} />
                  )}

                  {/* Attachment Schematic representation block */}
                  {msg.shapes && msg.shapes.length > 0 && (
                    <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-4 md:p-6 mt-4 relative group hover:shadow-md transition-all duration-300">
                      <div className="flex items-center justify-center h-28 md:h-36 border-2 border-dashed border-gray-300 rounded-lg bg-white relative overflow-hidden">
                        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.7))] pointer-events-none"></div>
                        <span className="text-neutral-500 flex flex-col items-center gap-2 text-xs md:text-sm text-center px-4 font-semibold relative z-10">
                          <Sparkles size={22} className="text-[#FF3B30] animate-pulse" />
                          Generated dynamic sketch of {msg.shapes.filter(s => s.type !== "arrow" && s.type !== "connector").length} nodes & {msg.shapes.filter(s => s.type === "arrow" || s.type === "connector").length} connection routes.
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleOpenShapesInCanvas(msg.shapes!, msg.text, msg.id)}
                        disabled={openingBoardId === msg.id}
                        className="absolute bottom-6 right-6 bg-[#111111] text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-neutral-800 active:scale-95 transition-all flex items-center gap-1.5 shadow-md border border-neutral-700 min-h-[38px] cursor-pointer"
                      >
                        {openingBoardId === msg.id ? (
                          <>
                            <Loader2 size={12} className="animate-spin text-[#FFD60A]" /> Inserting Board...
                          </>
                        ) : (
                          <>
                            Open in Whiteboard <ArrowRight size={12} className="text-[#FFD60A]" />
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Dynamic chat input element at bottom */}
        <div className="p-4 bg-white border-t border-gray-200 pb-safe shrink-0">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSendPrompt();
            }}
            className="max-w-3xl mx-auto relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-[#FF3B30]/15 focus-within:border-[#FF3B30] shadow-sm transition-all"
          >
            <textarea 
              rows={1}
              placeholder="Ask Yukti AI to design something..."
              className="flex-1 bg-transparent border-none focus:outline-none resize-none py-2 px-3 text-sm md:text-base max-h-32 placeholder-gray-400 text-gray-950"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendPrompt();
                }
              }}
              disabled={isSending}
            />
            <button 
              type="submit"
              disabled={isSending || !input.trim()}
              className="p-2.5 bg-[#FF3B30] disabled:bg-gray-300 text-white rounded-xl hover:bg-[#E3261C] transition-colors shrink-0 shadow-sm flex items-center justify-center min-w-[44px] min-h-[44px]"
            >
              {isSending ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Send size={18} className="translate-x-[1px] translate-y-[1px]" />
              )}
            </button>
          </form>
          <div className="max-w-3xl mx-auto mt-2 text-center">
            <span className="text-[10px] text-gray-400 font-medium">Yukti AI Workspace is fully powered by Google Gemini and live connected to your infinite canvas whiteboard database.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
