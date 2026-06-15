import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { 
  MousePointer2, Square, Circle, Triangle, Minus, ArrowRight,
  Pencil, Highlighter, Type, StickyNote, Image as ImageIcon,
  MoreHorizontal, Users, Share, Settings, ChevronLeft, Search, ZoomIn, ZoomOut, Sparkles,
  Hand, Hexagon, Octagon, Star, MessageSquare, Frame, Eraser, Link2, Wand2, Paintbrush,
  Undo2, Redo2, Copy, ClipboardPaste, CopyPlus, Group, Ungroup, MoveUp, MoveDown, Lock, Unlock, Download, Share2, AlignCenter, AlignLeft, AlignRight, CornerUpRight, ArrowRightLeft, AlignVerticalJustifyCenter, AlignVerticalJustifyStart, AlignVerticalJustifyEnd, AlignHorizontalJustifyCenter, AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  Box, Maximize, MousePointerClick, Bot, Network, Map as MapIcon, Library, Trash2, AlertTriangle, X, Sun, Moon,
  Layers, Eye, EyeOff, ChevronUp, ChevronDown, Plus
} from "lucide-react"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { TemplateLibraryModal } from "../../components/TemplateLibraryModal"
import ShareModal from "../../components/ShareModal"
import { useAuth } from "../../lib/AuthContext"
import { useCanvasStore, Shape, ShapeType } from "../../store/canvasStore"
import { YuktiCanvasLogo } from "../../components/YuktiCanvasLogo"
import { getBoard, updateBoard, deleteBoard, Board } from "../../lib/boards"

const ShapeRenderer = ({ shape, isSelected, updateShape, activeTool }: { shape: Shape, isSelected: boolean, updateShape: any, activeTool: string }) => {
  const shapes = useCanvasStore(state => state.shapes);
  const w = Math.max(1, shape.width);
  const h = Math.max(1, shape.height);
  
  const strokeColorFallback = shape.color === '#111111' ? '#000' : (shape.color || '#111111');
  const strokeColor = shape.stroke === 'none' ? 'transparent' : (shape.strokeColor || strokeColorFallback);
  
  const fillColorFallback = (shape.type === 'line' || shape.type === 'arrow' || shape.type === 'doubleArrow' || shape.type === 'pencil' || shape.type === 'text') ? 'none' : (shape.color || '#FFFFFF');
  const fillColor = shape.fillColor || fillColorFallback;
  
  const strokeWidth = shape.type === 'text' ? 0 : (shape.strokeWidth || 2);
  const strokeDasharray = shape.stroke === 'dashed' ? '8,8' : 'none';

  // Compute absolute line-like coords on the canvas
  let x1 = shape.flipX ? shape.x + shape.width : shape.x;
  let y1 = shape.flipY ? shape.y + shape.height : shape.y;
  let x2 = shape.flipX ? shape.x : shape.x + shape.width;
  let y2 = shape.flipY ? shape.y : shape.y + shape.height;

  if (shape.fromId) {
    const parent = shapes.find(s => s.id === shape.fromId);
    if (parent) {
      const pos = shape.fromPosition || 'center';
      if (pos === 't') {
        x1 = parent.x + parent.width / 2;
        y1 = parent.y;
      } else if (pos === 'r') {
        x1 = parent.x + parent.width;
        y1 = parent.y + parent.height / 2;
      } else if (pos === 'b') {
        x1 = parent.x + parent.width / 2;
        y1 = parent.y + parent.height;
      } else if (pos === 'l') {
        x1 = parent.x;
        y1 = parent.y + parent.height / 2;
      } else if (pos === 'center') {
        x1 = parent.x + parent.width / 2;
        y1 = parent.y + parent.height / 2;
      }
    }
  }

  if (shape.toId) {
    const parent = shapes.find(s => s.id === shape.toId);
    if (parent) {
      const pos = shape.toPosition || 'center';
      if (pos === 't') {
        x2 = parent.x + parent.width / 2;
        y2 = parent.y;
      } else if (pos === 'r') {
        x2 = parent.x + parent.width;
        y2 = parent.y + parent.height / 2;
      } else if (pos === 'b') {
        x2 = parent.x + parent.width / 2;
        y2 = parent.y + parent.height;
      } else if (pos === 'l') {
        x2 = parent.x;
        y2 = parent.y + parent.height / 2;
      } else if (pos === 'center') {
        x2 = parent.x + parent.width / 2;
        y2 = parent.y + parent.height / 2;
      }
    }
  }

  // Since lines, arrows, curved arrows, and connectors are drawn inside a group translated to translate(0, 0),
  // they must be rendered using absolute canvas coordinates (x1, y1, x2, y2) instead of offsets.
  const renderContent = () => {
    switch (shape.type) {
      case 'pencil':
      case 'brush':
      case 'highlight':
      case 'laser': {
        if (!shape.points || shape.points.length === 0) return null;
        
        const filterId = shape.type === 'laser' ? `url(#laser-glow)` : undefined;
        const sWidth = shape.strokeWidth || (shape.type === 'pencil' ? 2 : shape.type === 'brush' ? 6 : shape.type === 'highlight' ? 14 : 3);
        const strokeOp = shape.opacity !== undefined ? shape.opacity : (shape.type === 'highlight' ? 0.45 : 1);
        const sColor = shape.type === 'laser' ? '#FF2D55' : (shape.strokeColor || '#000000');
        const total = shape.points.length;

        // Custom variable stroke calligraphy profile
        if (shape.useVariableStroke && total >= 2) {
          const getWidth = (idx: number) => {
            const base = sWidth;
            if (total < 4) return base;
            const percent = idx / (total - 1);
            const taperZone = 0.25; // 25% taper on ends
            
            if (percent < taperZone) {
              const factor = percent / taperZone;
              return base * (0.15 + 0.85 * Math.sin(factor * Math.PI / 2));
            } else if (percent > 1 - taperZone) {
              const factor = (1 - percent) / taperZone;
              return base * (0.15 + 0.85 * Math.sin(factor * Math.PI / 2));
            }
            return base;
          };

          return (
            <g opacity={strokeOp} style={{ filter: filterId }}>
              {shape.points.map((pt, idx) => {
                if (idx === 0) return null;
                const prev = shape.points![idx - 1];
                const sw = getWidth(idx);
                return (
                  <line
                    key={idx}
                    x1={prev.x}
                    y1={prev.y}
                    x2={pt.x}
                    y2={pt.y}
                    stroke={sColor}
                    strokeWidth={sw}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                );
              })}
            </g>
          );
        }

        // Default or smoothed quadratic Bezier curve
        let d = `M ${shape.points[0].x} ${shape.points[0].y}`;
        if (total < 3) {
          for (let i = 1; i < total; i++) {
            d += ` L ${shape.points[i].x} ${shape.points[i].y}`;
          }
        } else {
          let i;
          for (i = 1; i < total - 2; i++) {
            const xc = (shape.points[i].x + shape.points[i+1].x) / 2;
            const yc = (shape.points[i].y + shape.points[i+1].y) / 2;
            d += ` Q ${shape.points[i].x} ${shape.points[i].y}, ${xc} ${yc}`;
          }
          d += ` Q ${shape.points[i].x} ${shape.points[i].y}, ${shape.points[i+1].x} ${shape.points[i+1].y}`;
        }

        return (
          <path
            d={d}
            fill="none"
            stroke={sColor}
            strokeWidth={sWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={strokeOp}
            style={{ filter: filterId }}
          />
        );
      }
      case 'rect':
        return <rect width={w} height={h} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
      case 'roundRect':
        return <rect width={w} height={h} rx={8} ry={8} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
      case 'circle':
      case 'ellipse':
        return <ellipse cx={w/2} cy={h/2} rx={w/2} ry={h/2} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} />;
      case 'triangle':
        return <polygon points={`${w/2},0 ${w},${h} 0,${h}`} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
      case 'diamond':
        return <polygon points={`${w/2},0 ${w},${h/2} ${w/2},${h} 0,${h/2}`} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
      case 'hexagon':
        return <polygon points={`${w*0.25},0 ${w*0.75},0 ${w},${h/2} ${w*0.75},${h} ${w*0.25},${h} 0,${h/2}`} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
      case 'octagon':
        return <polygon points={`${w*0.3},0 ${w*0.7},0 ${w},${h*0.3} ${w},${h*0.3} ${w*0.7},${h} ${w*0.3},${h} 0,${h*0.7} 0,${h*0.3}`} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
      case 'star': {
        const cx = w/2, cy = h/2, outerRadius = Math.min(w,h)/2, innerRadius = outerRadius/2.5;
        let points = "";
        for(let i=0; i<10; i++) {
          const r = i%2===0 ? outerRadius : innerRadius;
          const angle = Math.PI/2 - (i*Math.PI/5);
          points += `${cx + Math.cos(angle)*r},${cy - Math.sin(angle)*r} `;
        }
        return <polygon points={points.trim()} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
      }
      case 'line':
      case 'arrow':
      case 'doubleArrow':
        return (
          <line 
            x1={x1} 
            y1={y1} 
            x2={x2} 
            y2={y2} 
            stroke={strokeColor} 
            strokeWidth={4} 
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd={(shape.type === 'arrow' || shape.type === 'doubleArrow') ? `url(#arrowhead-${shape.id})` : ''}
            markerStart={shape.type === 'doubleArrow' ? `url(#arrowhead-start-${shape.id})` : ''}
          />
        );
      case 'curvedArrow': {
        const cx = x1 + (x2 - x1) / 2;
        const cy = y1;
        return (
          <path 
            d={`M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth={4} 
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd={`url(#arrowhead-${shape.id})`}
          />
        );
      }
      case 'connector': {
        const midX = (x1 + x2) / 2;
        let d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
        if (shape.fromPosition && shape.toPosition) {
          const fromPos = shape.fromPosition;
          const toPos = shape.toPosition;
          if ((fromPos === 'r' || fromPos === 'l') && (toPos === 'r' || toPos === 'l')) {
            d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
          } else if ((fromPos === 't' || fromPos === 'b') && (toPos === 't' || toPos === 'b')) {
            const midY = (y1 + y2) / 2;
            d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
          } else if ((fromPos === 'r' || fromPos === 'l') && (toPos === 't' || toPos === 'b')) {
            d = `M ${x1} ${y1} L ${x2} ${y1} L ${x2} ${y2}`;
          } else if ((fromPos === 't' || fromPos === 'b') && (toPos === 'r' || toPos === 'l')) {
            d = `M ${x1} ${y1} L ${x1} ${y2} L ${x2} ${y2}`;
          }
        }
        return (
          <path 
            d={d} 
            fill="none" 
            stroke={strokeColor} 
            strokeWidth={4} 
            strokeDasharray={strokeDasharray}
            strokeLinejoin="round"
            strokeLinecap="round"
            markerEnd={`url(#arrowhead-${shape.id})`}
          />
        );
      }
      case 'sticky':
      case 'text':
      default:
        return (
          <foreignObject x={0} y={0} width={w} height={Math.max(h, 40)}>
            <div style={{
              width: '100%', 
              height: '100%', 
              backgroundColor: shape.type === 'sticky' ? fillColor : 'transparent',
              border: shape.type === 'sticky' ? 'none' : (shape.stroke !== 'none' && shape.type !== 'text' ? `${strokeWidth}px ${shape.stroke === 'dashed' ? 'dashed' : 'solid'} ${strokeColor}` : 'none'),
              boxShadow: shape.type === 'sticky' ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none',
              borderRadius: shape.type === 'sticky' ? '2px' : '0'
            }}>
               {shape.text !== undefined && (
                 <textarea
                   value={shape.text || ''}
                   onChange={(e) => updateShape(shape.id, { text: e.target.value })}
                   className={`outline-none w-full h-full bg-transparent resize-none overflow-hidden ${shape.type === 'sticky' ? 'p-3 text-sm text-left font-medium' : 'p-1 text-center font-bold'} ${shape.color === '#111111' && shape.type !== 'text' ? 'text-white' : 'text-black'}`}
                   onPointerDown={(e) => {
                     if(activeTool === 'select' && isSelected) {
                       e.stopPropagation();
                     }
                   }} 
                 />
               )}
            </div>
          </foreignObject>
        );
    }
  };

  return (
    <>
      {renderContent()}
      {shape.text !== undefined && shape.type !== 'sticky' && shape.type !== 'text' && (
        <foreignObject x={0} y={0} width={w} height={h} style={{ pointerEvents: 'none' }}>
           <div className="w-full h-full flex items-center justify-center p-1">
             <textarea
               value={shape.text || ''}
               onChange={(e) => updateShape(shape.id, { text: e.target.value })}
               className={`outline-none bg-transparent resize-none overflow-hidden text-center font-bold w-full h-full pointer-events-auto ${shape.color === '#111111' ? 'text-white' : 'text-black'}`}
               style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
               onPointerDown={(e) => {
                 if(activeTool === 'select' && isSelected) {
                   e.stopPropagation();
                 }
               }} 
             />
           </div>
        </foreignObject>
      )}
    </>
  );
};

export default function CanvasPage() {
  const { boardId } = useParams()
  const nav = useNavigate()
  const { user } = useAuth()
  
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isMobilePropertiesOpen, setIsMobilePropertiesOpen] = useState(false)
  
  const {
    shapes,
    viewport,
    selectedShapeIds,
    activeTool,
    isDrawing,
    draftShape,
    setShapes,
    addShape,
    updateShape,
    deleteShapes,
    setViewport,
    pan,
    zoom,
    setSelection,
    setActiveTool,
    setIsDrawing,
    setDraftShape,
    layers,
    activeLayerId,
    addLayer,
    updateLayer,
    deleteLayer,
    setActiveLayerId,
    setLayers
  } = useCanvasStore();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const templateId = searchParams.get('templateId');

  const [clipboard, setClipboard] = useState<Shape[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const selectedShapeId = selectedShapeIds[0] || null;

  const [dbBoard, setDbBoard] = useState<Board | null>(null);
  const [showCanvasRenameModal, setShowCanvasRenameModal] = useState(false);
  const [showCanvasDeleteModal, setShowCanvasDeleteModal] = useState(false);
  const [tempCanvasTitle, setTempCanvasTitle] = useState("");
  const [isHeaderDeletingActive, setIsHeaderDeletingActive] = useState(false);
  const [isHeaderRenamingActive, setIsHeaderRenamingActive] = useState(false);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // AI-Powered Diagram & Layout Generation States
  const [isAiMenuOpen, setIsAiMenuOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratingMessage, setAiGeneratingMessage] = useState("");
  const [aiError, setAiError] = useState<string | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<'flowchart' | 'mindmap' | 'architecture' | 'journey' | 'roadmap' | null>(null);
  const [lastAttemptedPrompt, setLastAttemptedPrompt] = useState("");
  const [lastAttemptedType, setLastAttemptedType] = useState<'flowchart' | 'mindmap' | 'architecture' | 'journey' | 'roadmap' | null>(null);
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null);
  const [aiLoadPercent, setAiLoadPercent] = useState(0);
  const [aiLoadStepText, setAiLoadStepText] = useState("");
  const [aiTotalElements, setAiTotalElements] = useState(0);
  const [aiDrawnElements, setAiDrawnElements] = useState(0);

  const handleGenerateAIDiagram = async (presetType: 'flowchart' | 'mindmap' | 'architecture' | 'journey' | 'roadmap', customPromptText?: string) => {
    const finalPrompt = (customPromptText || aiPrompt || "").trim();
    
    if (!finalPrompt) {
      setAiError("Please supply a concept or topic description.");
      return;
    }

    setIsGeneratingAI(true);
    setAiError(null);
    setLastAttemptedPrompt(finalPrompt);
    setLastAttemptedType(presetType);
    setAiGeneratingMessage(`Designing your ${presetType.toUpperCase()} showing "${finalPrompt}"...`);
    
    // Set immediate loading stages
    setAiLoadPercent(5);
    setAiLoadStepText("Connecting to Yukti Co-Designer API servers...");
    setAiTotalElements(0);
    setAiDrawnElements(0);

    let progress = 5;
    const progressInterval = setInterval(() => {
      progress += Math.floor(Math.random() * 8) + 3;
      if (progress > 85) {
        progress = 85;
      }
      setAiLoadPercent(progress);
      
      if (progress < 25) {
        setAiLoadStepText("Structuring layout context vectors for Gemini...");
      } else if (progress < 45) {
        setAiLoadStepText("Calibrating shape coordinates & diagram bounds...");
      } else if (progress < 68) {
        setAiLoadStepText("Syncing dynamic connectors and routing alignment...");
      } else {
        setAiLoadStepText("Validating node canvas rendering boundaries...");
      }
    }, 280);
    
    try {
      const response = await fetch("/api/ai/generate-diagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: finalPrompt,
          type: presetType,
        }),
      });

      let resJson: any;
      const responseText = await response.text();
      try {
        resJson = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(`The server returned an invalid response (not JSON). Raw Response: ${responseText.substring(0, 300) || "Empty response"}`);
      }

      if (!response.ok) {
        throw new Error(resJson.error || `Server responded with status ${response.status}`);
      }
      if (!resJson.shapes || !Array.isArray(resJson.shapes)) {
        throw new Error("AI responded but returned an empty or invalid format.");
      }

      clearInterval(progressInterval);
      setAiLoadPercent(88);
      setAiLoadStepText("Specifications received! Initiating layout assembly...");

      if (resJson.isFallback) {
        setFallbackNotice(`Yukti Co-Designer (Offline Local Backup mode): Placed a high-quality visual blueprint template for "${finalPrompt}"`);
        setTimeout(() => {
          setFallbackNotice(null);
        }, 9000);
      }

      const nowTime = Date.now();
      const generatedWhiteboardShapes: Shape[] = resJson.shapes.map((s: any, idx: number) => {
        const shapeId = `ai-${presetType}-${nowTime}-${idx}-${Math.floor(Math.random() * 10000)}`;
        return {
          id: shapeId,
          type: s.type || 'rect',
          x: Number(s.x) || (300 + idx * 30),
          y: Number(s.y) || (200 + idx * 20),
          width: Number(s.width) || 160,
          height: Number(s.height) || 90,
          text: s.text,
          fillColor: s.fillColor || (s.type === 'sticky' ? '#FFF9DB' : '#FFFFFF'),
          strokeColor: s.strokeColor || '#FF3B30',
          stroke: s.stroke || 'solid',
          flipX: s.flipX || false,
          flipY: s.flipY || false,
          strokeWidth: 4,
          layer: 2
        };
      });

      const totalToDraw = generatedWhiteboardShapes.length;
      setAiTotalElements(totalToDraw);
      setAiDrawnElements(0);

      // Perform beautiful staggered real-time rendering sequentially
      let currentDrawn = 0;
      await new Promise<void>((resolve) => {
        const drawInterval = setInterval(() => {
          if (currentDrawn < totalToDraw) {
            const nextShape = generatedWhiteboardShapes[currentDrawn];
            setShapes((prev) => [...prev, nextShape]);
            currentDrawn++;
            setAiDrawnElements(currentDrawn);
            const drawPercent = 88 + Math.floor((currentDrawn / totalToDraw) * 12);
            setAiLoadPercent(Math.min(drawPercent, 100));
            setAiLoadStepText(`Drafting canvas node ${currentDrawn} of ${totalToDraw} [${nextShape.text ? nextShape.text.slice(0, 18) : nextShape.type}]...`);
          } else {
            clearInterval(drawInterval);
            setAiLoadPercent(100);
            setAiLoadStepText("Fully drawn! Autosaving updates securely to cloud storage...");
            
            // Set newly generated items as active selection inside whiteboard
            const addedIds = generatedWhiteboardShapes.map((ns) => ns.id);
            setSelection(addedIds);

            // Auto zoom-to-fit coordinates after short layout timeout
            setTimeout(() => {
              if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                useCanvasStore.getState().zoomToFit(rect.width, rect.height);
              }
              resolve();
            }, 300);
          }
        }, 120); // 120ms interval per shape renders in ~1.5s total & looks super interactive!
      });

      // Successfully finished
      setAiPrompt("");
      setIsAiMenuOpen(false);
    } catch (err: any) {
      clearInterval(progressInterval);
      console.error("AI Diagram Gen Error:", err);
      setAiError(err.message || "An unexpected error occurred during AI generation.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleDeleteBoardFromHeader = () => {
    setShowCanvasDeleteModal(true);
  };

  const confirmDeleteBoardFromHeader = async () => {
    if (boardId && boardId !== 'new') {
      setIsHeaderDeletingActive(true);
      try {
        await deleteBoard(boardId);
        setShowCanvasDeleteModal(false);
        nav('/app');
      } catch (err) {
        console.error("Failed to delete board from header:", err);
        alert("Failed to delete board");
      } finally {
        setIsHeaderDeletingActive(false);
      }
    }
  };

  const handleRenameBoardFromHeader = () => {
    if (dbBoard) {
      setTempCanvasTitle(dbBoard.title || "Untitled Board");
      setShowCanvasRenameModal(true);
    }
  };

  const confirmRenameBoardFromHeader = async () => {
    if (boardId && boardId !== 'new' && dbBoard) {
      const trimmed = tempCanvasTitle.trim();
      if (!trimmed) {
        alert("Board title cannot be empty!");
        return;
      }
      setIsHeaderRenamingActive(true);
      try {
        const updated = await updateBoard(boardId, { title: trimmed });
        setDbBoard(updated);
        setShowCanvasRenameModal(false);
      } catch (err) {
        console.error("Failed to rename board from header:", err);
        alert("Failed to rename board");
      } finally {
        setIsHeaderRenamingActive(false);
      }
    }
  };

  useEffect(() => {
    if (boardId && boardId !== 'new') {
      getBoard(boardId).then(board => {
        setDbBoard(board);
        if (board.content?.shapes) setShapes(board.content.shapes);
        if (board.content?.viewport) setViewport(board.content.viewport);
        isLoadedRef.current = true;
      }).catch(err => {
        console.error("Failed to load board:", err);
      });
    }
  }, [boardId, setShapes, setViewport]);

  // Trigger AI generation if query params are present on fresh empty boards
  useEffect(() => {
    const queryAiPrompt = searchParams.get('aiPrompt');
    const queryAiType = searchParams.get('aiType');

    if (queryAiPrompt && queryAiType && dbBoard && shapes.length === 0 && !isGeneratingAI) {
      // Clear query params from url so they don't re-trigger on refresh
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
      
      // Trigger diagram gen!
      handleGenerateAIDiagram(queryAiType as any, queryAiPrompt);
    }
  }, [dbBoard, shapes.length]);

  // Track cursor movement
  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    // Used to handle realtime cursor tracking here
  };

  useEffect(() => {
    // Used to handle realtime selection sync
  }, [selectedShapeIds]);

  useEffect(() => {
    if (boardId === 'new' && templateId) {
      import('../../lib/templates').then(({ defaultTemplates }) => {
        const template = defaultTemplates.find(t => t.id === templateId);
        if (template) {
          setShapes(template.shapes as any);
        }
      });
    }
  }, [boardId, templateId, setShapes]);

  // Auto-fading for temporary presentation laser lines
  useEffect(() => {
    const laserShapes = shapes.filter(s => s.type === 'laser');
    if (laserShapes.length === 0) return;

    const interval = setInterval(() => {
      const now = Date.now();
      let changed = false;
      const updatedShapes = shapes.map(s => {
        if (s.type === 'laser') {
          const age = now - parseInt(s.id);
          if (age > 2000) {
            changed = true;
            return null; // delete after 2 seconds
          } else if (age > 1000) {
            changed = true;
            // Fade opacity linearly between 1.0 and 0.0
            const opacity = Math.max(0, 1 - (age - 1000) / 1000);
            return { ...s, opacity };
          }
        }
        return s;
      }).filter(Boolean) as Shape[];

      if (changed) {
        setShapes(updatedShapes);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [shapes, setShapes]);

  // Auto-save
  useEffect(() => {
    if (!isLoadedRef.current || !boardId || boardId === 'new') return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateBoard(boardId, {
        content: { shapes, viewport }
      }).catch(err => console.error("Auto-save failed", err));
    }, 1000);

    return () => clearTimeout(saveTimeoutRef.current);
  }, [shapes, viewport, boardId]);

  useEffect(() => {
    if (selectedShapeId) {
       const shape = shapes.find(s => s.id === selectedShapeId);
       if (shape) {
          if (shape.fillColor) setSelectedColor(shape.fillColor);
          else if (shape.color) setSelectedColor(shape.color);
          
          if (shape.strokeColor) setSelectedStrokeColor(shape.strokeColor);
          if (shape.stroke) setSelectedStroke(shape.stroke);
       }
    }
  }, [selectedShapeId, shapes]);

  useKeyboardShortcuts({
    onToolSelect: (t: string) => setActiveTool(t as ShapeType | 'select' | 'hand'),
    onZoomIn: useCallback(() => {
      // Zoom relative to center
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        zoom(1.2, rect.width / 2, rect.height / 2);
      }
    }, [zoom]),
    onZoomOut: useCallback(() => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        zoom(1 / 1.2, rect.width / 2, rect.height / 2);
      }
    }, [zoom]),
    onDelete: useCallback(() => {
      if (selectedShapeIds.length > 0) {
        deleteShapes(selectedShapeIds);
      }
    }, [selectedShapeIds, deleteShapes]),
    onNudge: useCallback((dx: number, dy: number) => {
      if (selectedShapeIds.length > 0) {
        const updates = selectedShapeIds.map(id => {
          const shape = shapes.find(s => s.id === id);
          if (shape) {
            return { id, update: { x: shape.x + dx, y: shape.y + dy } };
          }
          return null;
        }).filter(Boolean) as {id: string, update: Partial<Shape>}[];
        updates.forEach(u => updateShape(u.id, u.update));
      }
    }, [selectedShapeIds, shapes, updateShape]),
    onCopy: useCallback(() => {
      if (selectedShapeIds.length > 0) {
        const copied = shapes.filter(s => selectedShapeIds.includes(s.id));
        setClipboard(copied);
      }
    }, [selectedShapeIds, shapes]),
    onPaste: useCallback(() => {
      if (clipboard.length > 0) {
        const newShapes = clipboard.map(s => ({
          ...s,
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          x: s.x + 20,
          y: s.y + 20
        }));
        
        const newIds = newShapes.map(s => s.id);
        
        // Use a store action to add multiple shapes if available, 
        // for now we'll have to add them one by one if a bulk add isn't available
        newShapes.forEach(s => addShape(s));
        setSelection(newIds);
      }
    }, [clipboard, addShape, setSelection])
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragInfo = useRef<{isDragging: boolean, shapeId: string | null, startX: number, startY: number, initialShapeX: number, initialShapeY: number, initialPositions?: {id: string, x: number, y: number}[]}>({ isDragging: false, shapeId: null, startX: 0, startY: 0, initialShapeX: 0, initialShapeY: 0 });
  const panInfo = useRef({ isPanning: false, startX: 0, startY: 0, initialViewportX: 0, initialViewportY: 0 });
  const selectionInfo = useRef({ isSelecting: false, startX: 0, startY: 0 });
  const resizeInfo = useRef<{isResizing: boolean, shapeId: string | null, handle: string | null, startX: number, startY: number, initialWidth: number, initialHeight: number, initialX: number, initialY: number}>({ 
    isResizing: false, shapeId: null, handle: null, startX: 0, startY: 0, initialWidth: 0, initialHeight: 0, initialX: 0, initialY: 0 
  });

  // Smart Connectors & Elastic Arrows States & Refs
  interface AnchorPoint {
    shapeId: string;
    position: 't' | 'r' | 'b' | 'l';
    x: number;
    y: number;
  }
  interface DragLineInfo {
    shapeId: string;
    isEnd: 'start' | 'end';
  }

  const [activeSnap, setActiveSnap] = useState<AnchorPoint | null>(null);
  const dragLineInfo = useRef<DragLineInfo | null>(null);

  const getShapeAnchors = (s: Shape): AnchorPoint[] => {
    if (['line', 'arrow', 'doubleArrow', 'curvedArrow', 'connector', 'pencil', 'brush', 'highlight', 'laser', 'eraser'].includes(s.type)) {
      return [];
    }
    return [
      { shapeId: s.id, position: 't', x: s.x + s.width / 2, y: s.y },
      { shapeId: s.id, position: 'r', x: s.x + s.width, y: s.y + s.height / 2 },
      { shapeId: s.id, position: 'b', x: s.x + s.width / 2, y: s.y + s.height },
      { shapeId: s.id, position: 'l', x: s.x, y: s.y + s.height / 2 },
    ];
  };

  const getAllAnchors = (shapesList: Shape[]): AnchorPoint[] => {
    const anchors: AnchorPoint[] = [];
    shapesList.forEach(s => {
      anchors.push(...getShapeAnchors(s));
    });
    return anchors;
  };

  const getLineCoords = (s: Shape, shapesList: Shape[]) => {
    let x1 = s.flipX ? s.x + s.width : s.x;
    let y1 = s.flipY ? s.y + s.height : s.y;
    let x2 = s.flipX ? s.x : s.x + s.width;
    let y2 = s.flipY ? s.y : s.y + s.height;

    if (s.fromId) {
      const parent = shapesList.find(parentShape => parentShape.id === s.fromId);
      if (parent) {
        const pos = s.fromPosition || 'center';
        if (pos === 't') {
          x1 = parent.x + parent.width / 2;
          y1 = parent.y;
        } else if (pos === 'r') {
          x1 = parent.x + parent.width;
          y1 = parent.y + parent.height / 2;
        } else if (pos === 'b') {
          x1 = parent.x + parent.width / 2;
          y1 = parent.y + parent.height;
        } else if (pos === 'l') {
          x1 = parent.x;
          y1 = parent.y + parent.height / 2;
        }
      }
    }

    if (s.toId) {
      const parent = shapesList.find(parentShape => parentShape.id === s.toId);
      if (parent) {
        const pos = s.toPosition || 'center';
        if (pos === 't') {
          x2 = parent.x + parent.width / 2;
          y2 = parent.y;
        } else if (pos === 'r') {
          x2 = parent.x + parent.width;
          y2 = parent.y + parent.height / 2;
        } else if (pos === 'b') {
          x2 = parent.x + parent.width / 2;
          y2 = parent.y + parent.height;
        } else if (pos === 'l') {
          x2 = parent.x;
          y2 = parent.y + parent.height / 2;
        }
      }
    }

    return { x1, y1, x2, y2 };
  };

  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedStrokeColor, setSelectedStrokeColor] = useState('#000000');
  const [selectedStroke, setSelectedStroke] = useState<'solid' | 'dashed' | 'none'>('solid');
  const [smoothing, setSmoothing] = useState(40);
  const [useVariableStroke, setUseVariableStroke] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem('canvas-dark-mode') === 'true');
  const [isLayersPanelOpen, setIsLayersPanelOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      setIsDarkMode(localStorage.getItem('canvas-dark-mode') === 'true');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('canvas-dark-mode', String(isDarkMode));
  }, [isDarkMode]);

  const getCanvasCoords = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
    return { x, y };
  };

  const isPointInShape = (px: number, py: number, s: Shape) => {
    if (['line', 'arrow', 'doubleArrow', 'curvedArrow', 'connector'].includes(s.type)) {
      const midX = s.x + s.width / 2;
      const midY = s.y + s.height / 2;
      const distToMid = Math.hypot(px - midX, py - midY);
      const distToStart = Math.hypot(px - s.x, py - s.y);
      const distToEnd = Math.hypot(px - (s.x + s.width), py - (s.y + s.height));
      return distToMid < 24 || distToStart < 24 || distToEnd < 24;
    }
    
    if (['pencil', 'brush', 'highlight', 'laser'].includes(s.type)) {
      if (!s.points || s.points.length === 0) {
        return px >= s.x - 10 && px <= s.x + s.width + 10 && py >= s.y - 10 && py <= s.y + s.height + 10;
      }
      return s.points.some(p => {
        const actualX = s.x + p.x;
        const actualY = s.y + p.y;
        return Math.hypot(px - actualX, py - actualY) < 15;
      });
    }

    return (
      px >= s.x && 
      px <= s.x + s.width && 
      py >= s.y && 
      py <= s.y + s.height
    );
  };

  const isErasingRef = useRef(false);

  const alignShapes = (alignment: 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom' | 'distribute-horizontal' | 'distribute-vertical') => {
    if (selectedShapeIds.length < 2) return;
    
    const selectedShapesArgs = shapes.filter(s => selectedShapeIds.includes(s.id));
    
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    selectedShapesArgs.forEach(s => {
       if (s.x < minX) minX = s.x;
       if (s.y < minY) minY = s.y;
       if (s.x + s.width > maxX) maxX = s.x + s.width;
       if (s.y + s.height > maxY) maxY = s.y + s.height;
    });

    const updates: {id: string, update: Partial<Shape>}[] = [];

    if (alignment === 'left') {
       selectedShapesArgs.forEach(s => updates.push({ id: s.id, update: { x: minX } }));
    } else if (alignment === 'right') {
       selectedShapesArgs.forEach(s => updates.push({ id: s.id, update: { x: maxX - s.width } }));
    } else if (alignment === 'center') {
       const centerX = (minX + maxX) / 2;
       selectedShapesArgs.forEach(s => updates.push({ id: s.id, update: { x: centerX - s.width / 2 } }));
    } else if (alignment === 'top') {
       selectedShapesArgs.forEach(s => updates.push({ id: s.id, update: { y: minY } }));
    } else if (alignment === 'bottom') {
       selectedShapesArgs.forEach(s => updates.push({ id: s.id, update: { y: maxY - s.height } }));
    } else if (alignment === 'middle') {
       const centerY = (minY + maxY) / 2;
       selectedShapesArgs.forEach(s => updates.push({ id: s.id, update: { y: centerY - s.height / 2 } }));
    } else if (alignment === 'distribute-horizontal') {
       if (selectedShapesArgs.length < 3) return;
       const sorted = [...selectedShapesArgs].sort((a, b) => a.x - b.x);
       const startX = sorted[0].x;
       const endX = sorted[sorted.length - 1].x;
       const totalSpacing = (endX - startX) / (sorted.length - 1);
       sorted.forEach((s, i) => {
          if (i !== 0 && i !== sorted.length - 1) {
             updates.push({ id: s.id, update: { x: startX + totalSpacing * i } });
          }
       });
    } else if (alignment === 'distribute-vertical') {
       if (selectedShapesArgs.length < 3) return;
       const sorted = [...selectedShapesArgs].sort((a, b) => a.y - b.y);
       const startY = sorted[0].y;
       const endY = sorted[sorted.length - 1].y;
       const totalSpacing = (endY - startY) / (sorted.length - 1);
       sorted.forEach((s, i) => {
          if (i !== 0 && i !== sorted.length - 1) {
             updates.push({ id: s.id, update: { y: startY + totalSpacing * i } });
          }
       });
    }
    
    updates.forEach(u => updateShape(u.id, u.update));
  };

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      zoom(delta, cx, cy);
    } else {
      pan(-e.deltaX, -e.deltaY);
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [viewport, zoom, pan]);

   const handlePointerDown = (e: React.PointerEvent) => {
     const isDrawingPathOverride = ['pencil', 'brush', 'highlight', 'laser'].includes(activeTool);
     const isEraserOverride = activeTool === 'eraser';
     if (isDrawingPathOverride || isEraserOverride) {
       const coords = getCanvasCoords(e);
       if (isEraserOverride) {
         isErasingRef.current = true;
         const collided = shapes.filter(s => isPointInShape(coords.x, coords.y, s)).map(s => s.id);
         if (collided.length > 0) {
           deleteShapes(collided);
         }
         (e.target as HTMLElement).setPointerCapture(e.pointerId);
         return;
       }
       if (isDrawingPathOverride) {
         setIsDrawing(true);
         setDraftShape({
           id: Date.now().toString(),
           type: activeTool as ShapeType,
           x: coords.x,
           y: coords.y,
           width: 1,
           height: 1,
           color: selectedColor,
           fillColor: 'none',
           strokeColor: selectedStrokeColor,
           stroke: 'solid',
           strokeWidth: activeTool === 'pencil' ? 2 : activeTool === 'brush' ? 6 : activeTool === 'highlight' ? 14 : 3,
           opacity: activeTool === 'highlight' ? 0.45 : activeTool === 'laser' ? 0.9 : 1.0,
           points: [{ x: 0, y: 0 }],
            useVariableStroke: ['pencil', 'brush'].includes(activeTool) ? useVariableStroke : false
         });
         (e.target as HTMLElement).setPointerCapture(e.pointerId);
         return;
       }
     }
    if (e.target === containerRef.current || (e.target as Element).tagName === 'svg' || ((e.target as Element).tagName === 'rect' && (e.target as Element).getAttribute('fill') === 'url(#canvas-grid)')) {
      if (activeTool === 'select' || activeTool === 'hand' || e.button === 1 || e.button === 2) {
        // Start pan
        if (activeTool === 'hand' || e.button === 1 || e.button === 2) {
           panInfo.current = {
             isPanning: true,
             startX: e.clientX,
             startY: e.clientY,
             initialViewportX: viewport.x,
             initialViewportY: viewport.y
           };
           (e.target as HTMLElement).setPointerCapture(e.pointerId);
           return;
        }

        // Start selection
        if (activeTool === 'select') {
          const coords = getCanvasCoords(e);
          selectionInfo.current = {
            isSelecting: true,
            startX: coords.x,
            startY: coords.y
          };
          setSelectionBox({ x: coords.x, y: coords.y, width: 0, height: 0 });
          if (!e.shiftKey) {
            setSelection([]);
          }
          (e.target as HTMLElement).setPointerCapture(e.pointerId);
          return;
        }
      }
      
      const coords = getCanvasCoords(e);
      let draftX = coords.x;
      let draftY = coords.y;
      let fromId: string | undefined = undefined;
      let fromPosition: 't' | 'r' | 'b' | 'l' | 'center' | undefined = undefined;

      const isLineLike = ['line', 'arrow', 'doubleArrow', 'curvedArrow', 'connector'].includes(activeTool);
      if (isLineLike) {
        const anchors = getAllAnchors(shapes);
        let closest: AnchorPoint | null = null;
        let minDist = 20; // snap threshold
        anchors.forEach(a => {
          const dist = Math.hypot(coords.x - a.x, coords.y - a.y);
          if (dist < minDist) {
            closest = a;
            minDist = dist;
          }
        });
        if (closest) {
          draftX = closest.x;
          draftY = closest.y;
          fromId = closest.shapeId;
          fromPosition = closest.position;
        }
      }

      setIsDrawing(true);
      setDraftShape({
        id: Date.now().toString(),
        type: activeTool as ShapeType,
        x: draftX,
        y: draftY,
        width: 0,
        height: 0,
        fromId,
        fromPosition,
        color: selectedColor, // legacy fallback if something breaks
        fillColor: selectedColor,
        strokeColor: selectedStrokeColor,
        stroke: selectedStroke
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isErasingRef.current) {
      const coords = getCanvasCoords(e);
      const collided = shapes.filter(s => isPointInShape(coords.x, coords.y, s)).map(s => s.id);
      if (collided.length > 0) {
        deleteShapes(collided);
      }
      return;
    }
    if (isDrawing && draftShape && ['pencil', 'brush', 'highlight', 'laser'].includes(draftShape.type)) {
      const coords = getCanvasCoords(e);
      const nextPoints = [...(draftShape.points || []), { x: coords.x - draftShape.x, y: coords.y - draftShape.y }];
      setDraftShape({
        ...draftShape,
        points: nextPoints
      });
      return;
    }
    handlePointerMoveCanvas(e);

    if (dragLineInfo.current) {
      const coords = getCanvasCoords(e);
      const targetLine = shapes.find(s => s.id === dragLineInfo.current!.shapeId);
      if (targetLine) {
        const anchors = getAllAnchors(shapes);
        let snap: AnchorPoint | null = null;
        let minDist = 20;
        anchors.forEach(a => {
          if (a.shapeId === targetLine.id) return;
          if (dragLineInfo.current!.isEnd === 'start' && targetLine.toId && a.shapeId === targetLine.toId) return;
          if (dragLineInfo.current!.isEnd === 'end' && targetLine.fromId && a.shapeId === targetLine.fromId) return;

          const dist = Math.hypot(coords.x - a.x, coords.y - a.y);
          if (dist < minDist) {
            snap = a;
            minDist = dist;
          }
        });

        const newX = snap ? snap.x : coords.x;
        const newY = snap ? snap.y : coords.y;

        const currentCoords = getLineCoords(targetLine, shapes);

        if (dragLineInfo.current.isEnd === 'start') {
          const x2 = currentCoords.x2;
          const y2 = currentCoords.y2;
          const width = x2 - newX;
          const height = y2 - newY;
          const flipX = width < 0;
          const flipY = height < 0;

          updateShape(targetLine.id, {
            x: flipX ? x2 : newX,
            y: flipY ? y2 : newY,
            width: Math.abs(width),
            height: Math.abs(height),
            flipX,
            flipY,
            fromId: snap ? snap.shapeId : undefined,
            fromPosition: snap ? snap.position : undefined,
          });
        } else {
          const x1 = currentCoords.x1;
          const y1 = currentCoords.y1;
          const width = newX - x1;
          const height = newY - y1;
          const flipX = width < 0;
          const flipY = height < 0;

          updateShape(targetLine.id, {
            x: flipX ? newX : x1,
            y: flipY ? newY : y1,
            width: Math.abs(width),
            height: Math.abs(height),
            flipX,
            flipY,
            toId: snap ? snap.shapeId : undefined,
            toPosition: snap ? snap.position : undefined,
          });
        }
        setActiveSnap(snap);
      }
      return;
    }

    if (panInfo.current.isPanning) {
      const dx = e.clientX - panInfo.current.startX;
      const dy = e.clientY - panInfo.current.startY;
      setViewport({
        ...viewport,
        x: panInfo.current.initialViewportX + dx,
        y: panInfo.current.initialViewportY + dy
      });
      return;
    }

    if (selectionInfo.current.isSelecting) {
       const coords = getCanvasCoords(e);
       const box = {
          x: Math.min(selectionInfo.current.startX, coords.x),
          y: Math.min(selectionInfo.current.startY, coords.y),
          width: Math.abs(coords.x - selectionInfo.current.startX),
          height: Math.abs(coords.y - selectionInfo.current.startY)
       };
       setSelectionBox(box);

       // Find overlapping shapes
       const boxMinX = box.x;
       const boxMaxX = box.x + box.width;
       const boxMinY = box.y;
       const boxMaxY = box.y + box.height;

       const overlappingIds = shapes.filter(s => {
           const lid = s.layerId || 'default';
           const isLocked = layers.find(l => l.id === lid)?.locked ?? false;
           if (isLocked) return false;
          const sMinX = Math.min(s.x, s.x + s.width);
          const sMaxX = Math.max(s.x, s.x + s.width);
          const sMinY = Math.min(s.y, s.y + s.height);
          const sMaxY = Math.max(s.y, s.y + s.height);
          return (
             sMinX < boxMaxX && sMaxX > boxMinX &&
             sMinY < boxMaxY && sMaxY > boxMinY
          );
       }).map(s => s.id);

       if (e.shiftKey) {
          const newSelection = new Set([...selectedShapeIds, ...overlappingIds]);
          setSelection(Array.from(newSelection));
       } else {
          setSelection(overlappingIds);
       }
       return;
    }

    if (resizeInfo.current.isResizing && resizeInfo.current.shapeId) {
      const coords = getCanvasCoords(e);
      const dx = coords.x - resizeInfo.current.startX;
      const dy = coords.y - resizeInfo.current.startY;
      const handle = resizeInfo.current.handle;
      
      let newW = resizeInfo.current.initialWidth;
      let newH = resizeInfo.current.initialHeight;
      let newX = resizeInfo.current.initialX;
      let newY = resizeInfo.current.initialY;

      if (handle === 'tl') {
        newW -= dx; newH -= dy; newX += dx; newY += dy;
      } else if (handle === 'tr') {
        newW += dx; newH -= dy; newY += dy;
      } else if (handle === 'bl') {
        newW -= dx; newH += dy; newX += dx;
      } else if (handle === 'br') {
        newW += dx; newH += dy;
      } else if (handle === 'r') {
        newW += dx;
      } else if (handle === 'l') {
        newW -= dx; newX += dx;
      } else if (handle === 't') {
        newH -= dy; newY += dy;
      } else if (handle === 'b') {
        newH += dy;
      }

      if (newW < 5) {
         if (handle === 'tl' || handle === 'bl' || handle === 'l') newX -= (5 - newW);
         newW = 5;
      }
      if (newH < 5) {
         if (handle === 'tl' || handle === 'tr' || handle === 't') newY -= (5 - newH);
         newH = 5;
      }
      
      updateShape(resizeInfo.current.shapeId, {
        x: newX,
        y: newY,
        width: newW,
        height: newH
      });
      return;
    }

    if (isDrawing && draftShape) {
      const coords = getCanvasCoords(e);
      const isLineLike = ['line', 'arrow', 'doubleArrow', 'curvedArrow', 'connector'].includes(draftShape.type);
      if (isLineLike) {
        const anchors = getAllAnchors(shapes);
        let closest: AnchorPoint | null = null;
        let minDist = 20; // snap threshold
        anchors.forEach(a => {
          if (draftShape.fromId && a.shapeId === draftShape.fromId) return;
          const dist = Math.hypot(coords.x - a.x, coords.y - a.y);
          if (dist < minDist) {
            closest = a;
            minDist = dist;
          }
        });

        const endX = closest ? closest.x : coords.x;
        const endY = closest ? closest.y : coords.y;

        setDraftShape({
          ...draftShape,
          width: endX - draftShape.x,
          height: endY - draftShape.y,
          toId: closest ? closest.shapeId : undefined,
          toPosition: closest ? closest.position : undefined,
        });
        setActiveSnap(closest);
      } else {
        setDraftShape({
          ...draftShape,
          width: coords.x - draftShape.x,
          height: coords.y - draftShape.y
        });
      }
    } else if (dragInfo.current.isDragging && dragInfo.current.shapeId) {
      const coords = getCanvasCoords(e);
      const dx = coords.x - dragInfo.current.startX;
      const dy = coords.y - dragInfo.current.startY;
      
      const initialPositions = dragInfo.current.initialPositions;
      if (initialPositions && initialPositions.length > 0) {
        // Multi-drag
        const updates = initialPositions.forEach(pos => {
           updateShape(pos.id, {
             x: pos.x + dx,
             y: pos.y + dy
           });
        });
      } else {
        // Single drag fallback
        updateShape(dragInfo.current.shapeId, {
          x: dragInfo.current.initialShapeX + dx,
          y: dragInfo.current.initialShapeY + dy
        });
      }
    }
  };

  const smoothPoints = (pts: { x: number; y: number }[], factor: number) => {
    if (pts.length < 3 || factor <= 0) return pts;
    
    const f = (factor / 100) * 0.85; 
    let current = [...pts];
    
    const passes = Math.max(1, Math.min(5, Math.ceil(factor / 20)));
    for (let pass = 0; pass < passes; pass++) {
      const next = [current[0]];
      for (let i = 1; i < current.length - 1; i++) {
        const prev = current[i - 1];
        const curr = current[i];
        const nxt = current[i + 1];
        
        const smoothedX = curr.x * (1 - f) + (prev.x + nxt.x) * (f / 2);
        const smoothedY = curr.y * (1 - f) + (prev.y + nxt.y) * (f / 2);
        
        next.push({ x: smoothedX, y: smoothedY });
      }
      next.push(current[current.length - 1]);
      current = next;
    }
    return current;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isErasingRef.current) {
      isErasingRef.current = false;
      if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
      return;
    }
    if (isDrawing && draftShape && ['pencil', 'brush', 'highlight', 'laser'].includes(draftShape.type)) {
      let finalShape = { ...draftShape };
      let pts = finalShape.points || [];
      if (['pencil', 'brush'].includes(finalShape.type)) {
        pts = smoothPoints(pts, smoothing);
      }
      if (pts.length < 2) {
        setIsDrawing(false);
        setDraftShape(null);
        setActiveTool('select');
        return;
      }
      
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      pts.forEach(p => {
        const absX = finalShape.x + p.x;
        const absY = finalShape.y + p.y;
        if (absX < minX) minX = absX;
        if (absX > maxX) maxX = absX;
        if (absY < minY) minY = absY;
        if (absY > maxY) maxY = absY;
      });

      const normWidth = Math.max(1, maxX - minX);
      const normHeight = Math.max(1, maxY - minY);
      const adjustedPoints = pts.map(p => {
        const absX = finalShape.x + p.x;
        const absY = finalShape.y + p.y;
        return {
          x: absX - minX,
          y: absY - minY
        };
      });

      finalShape.x = minX;
      finalShape.y = minY;
      finalShape.width = normWidth;
      finalShape.height = normHeight;
      finalShape.points = adjustedPoints;
      finalShape.useVariableStroke = ['pencil', 'brush'].includes(finalShape.type) ? useVariableStroke : false;

      addShape(finalShape);
      setIsDrawing(false);
      setDraftShape(null);
      setActiveTool('select');
      setSelection([finalShape.id]);
      setActiveSnap(null);
      if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
      return;
    }
    if (dragLineInfo.current) {
      dragLineInfo.current = null;
      setActiveSnap(null);
      if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
      return;
    }

    if (panInfo.current.isPanning) {
      panInfo.current.isPanning = false;
      if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
      return;
    }

    if (selectionInfo.current.isSelecting) {
      selectionInfo.current.isSelecting = false;
      setSelectionBox(null);
      if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
      return;
    }

    if (resizeInfo.current.isResizing) {
      resizeInfo.current.isResizing = false;
      resizeInfo.current.shapeId = null;
      if (e.target instanceof HTMLElement) e.target.releasePointerCapture(e.pointerId);
      return;
    }

    if (isDrawing && draftShape) {
      let finalShape = { ...draftShape };
      const isLineLike = ['line', 'arrow', 'doubleArrow', 'curvedArrow', 'connector'].includes(finalShape.type);
      
      if (isLineLike) {
        finalShape.flipX = finalShape.width < 0;
        finalShape.flipY = finalShape.height < 0;
        finalShape.width = Math.abs(finalShape.width);
        finalShape.height = Math.abs(finalShape.height);
      } else {
        finalShape.flipX = finalShape.width < 0;
        finalShape.flipY = finalShape.height < 0;
        
        if (finalShape.width < 0) {
          finalShape.x += finalShape.width;
          finalShape.width = Math.abs(finalShape.width);
        }
        if (finalShape.height < 0) {
          finalShape.y += finalShape.height;
          finalShape.height = Math.abs(finalShape.height);
        }
        if (finalShape.width < 5 && finalShape.height < 5) {
          if (finalShape.type === 'sticky') {
            finalShape.width = 150;
            finalShape.height = 150;
          } else if (finalShape.type === 'text') {
             finalShape.width = 100;
             finalShape.height = 40;
             finalShape.text = "Type here";
          } else {
            finalShape.width = 100;
            finalShape.height = 100;
          }
        }
        if ((finalShape.type === 'text' || finalShape.type === 'sticky') && !finalShape.text) {
           finalShape.text = "New text";
        }
      }
      addShape(finalShape);
      setIsDrawing(false);
      setDraftShape(null);
      setActiveTool('select');
      setSelection([finalShape.id]);
      setActiveSnap(null);
    }
    
    if (dragInfo.current.isDragging) {
      dragInfo.current.isDragging = false;
      dragInfo.current.shapeId = null;
    }
    if (e.target instanceof HTMLElement) {
       e.target.releasePointerCapture(e.pointerId);
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent, shape: Shape, handle: string) => {
    e.stopPropagation();
    const coords = getCanvasCoords(e);
    resizeInfo.current = {
      isResizing: true,
      shapeId: shape.id,
      handle,
      startX: coords.x,
      startY: coords.y,
      initialWidth: shape.width,
      initialHeight: shape.height,
      initialX: shape.x,
      initialY: shape.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleShapePointerDown = (e: React.PointerEvent, shape: Shape) => {
    if (['pencil', 'brush', 'highlight', 'laser', 'eraser'].includes(activeTool)) {
      // Let pointer events bubble up to the container/svg canvas to draw/erase on top of existing shapes
      return;
    }
    e.stopPropagation();
    
    // Multi-select with shift key
    if (!selectedShapeIds.includes(shape.id)) {
      if (e.shiftKey) {
        setSelection([...selectedShapeIds, shape.id]);
      } else {
        setSelection([shape.id]);
      }
    } else if (e.shiftKey) {
      setSelection(selectedShapeIds.filter(id => id !== shape.id));
      return;
    }

    if (activeTool === 'select') {
      const coords = getCanvasCoords(e);
      const currentSelectedIds = selectedShapeIds.includes(shape.id) ? selectedShapeIds : [shape.id];
      const initialPositions = shapes.filter(s => currentSelectedIds.includes(s.id)).map(s => ({id: s.id, x: s.x, y: s.y}));

      dragInfo.current = {
        isDragging: true,
        shapeId: shape.id,
        startX: coords.x,
        startY: coords.y,
        initialShapeX: shape.x,
        initialShapeY: shape.y,
        initialPositions
      };
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-surface">
      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-gray-200 shadow-sm bg-white flex items-center justify-between px-4 z-50 shrink-0">
        {/* Left: Branding & Board Info */}
        <div className="flex items-center gap-1.5 sm:gap-3 max-w-[65%] lg:max-w-[40%] shrink">
          <button onClick={() => nav('/app')} className="p-1.5 hover:bg-gray-100 rounded-md text-gray-500 transition-colors">
            <ChevronLeft size={18} />
          </button>
          <div className="hidden sm:block shadow-sm shrink-0">
             <YuktiCanvasLogo height={24} />
          </div>
          <div className="hidden sm:block h-5 w-px bg-gray-200 ml-1"></div>
          <div className="flex items-center gap-1 min-w-0">
             <div className="group relative flex items-center shrink min-w-0">
                <input 
                  type="text" 
                  defaultValue={dbBoard?.title || `Untitled`}
                  key={dbBoard?.title || 'new'}
                  onBlur={(e) => {
                    if (boardId && boardId !== 'new' && e.target.value !== dbBoard?.title) {
                      updateBoard(boardId, { title: e.target.value })
                        .then(setDbBoard)
                        .catch(err => console.error('Failed to update title', err));
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.currentTarget.blur();
                    }
                  }}
                  className="font-semibold text-[13px] bg-transparent border-transparent hover:border-gray-200 focus:border-[#FF3B30] focus:ring-1 focus:ring-[#FF3B30] rounded px-2 py-1 outline-none transition-all w-20 xs:w-28 sm:w-40 text-[#111111] truncate"
                />
                <div className="hidden group-hover:block absolute left-2 -bottom-6 bg-gray-800 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-50">Rename Board</div>
             </div>
             {boardId && boardId !== 'new' && (
                <div className="flex items-center gap-0.5 shrink-0">
                   <button 
                     onClick={handleRenameBoardFromHeader} 
                     className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-blue-600 transition-colors"
                     title="Rename Board"
                   >
                     <Pencil size={13} />
                   </button>
                   <button 
                     onClick={handleDeleteBoardFromHeader} 
                     className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-[#FF3B30] transition-colors"
                     title="Delete Board"
                   >
                     <Trash2 size={13} />
                   </button>
                </div>
             )}
          </div>
          <span className="bg-gray-100 px-1.5 py-0.5 rounded text-[9px] font-bold text-gray-500 uppercase tracking-widest ml-1 hidden md:block shrink-0">Saved to cloud</span>
        </div>

        {/* Center: Whiteboard Tools (Undo/Redo, Objects) */}
        <div className="hidden lg:flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-lg p-1">
           <ToolbarButton icon={<Undo2 size={16} />} title="Undo" />
           <ToolbarButton icon={<Redo2 size={16} />} title="Redo" />
           <div className="w-px h-4 bg-gray-300 mx-1"></div>
           <ToolbarButton icon={<Copy size={16} />} title="Copy" />
           <ToolbarButton icon={<ClipboardPaste size={16} />} title="Paste" />
           <ToolbarButton icon={<CopyPlus size={16} />} title="Duplicate" onClick={() => {
              if (selectedShapeId) {
                const shapeToDuplicate = shapes.find(s => s.id === selectedShapeId);
                if (shapeToDuplicate) {
                   const newShape = { ...shapeToDuplicate, id: Date.now().toString(), x: shapeToDuplicate.x + 20, y: shapeToDuplicate.y + 20 };
                   addShape(newShape);
                   setSelection([newShape.id]);
                }
              }
           }} />
           <div className="w-px h-4 bg-gray-300 mx-1"></div>
           <ToolbarButton icon={<Group size={16} />} title="Group" />
           <ToolbarButton icon={<Ungroup size={16} />} title="Ungroup" />
           <div className="w-px h-4 bg-gray-300 mx-1"></div>
           <ToolbarButton icon={<MoveUp size={16} />} title="Bring Forward" onClick={() => {
              if (selectedShapeId) {
                 const shape = shapes.find(s => s.id === selectedShapeId);
                 if (shape) {
                    setShapes([...shapes.filter(s => s.id !== selectedShapeId), shape]);
                 }
              }
           }} />
           <ToolbarButton icon={<MoveDown size={16} />} title="Send Backward" onClick={() => {
              if (selectedShapeId) {
                 const shape = shapes.find(s => s.id === selectedShapeId);
                 if (shape) {
                    setShapes([shape, ...shapes.filter(s => s.id !== selectedShapeId)]);
                 }
              }
           }} />
           <div className="w-px h-4 bg-gray-300 mx-1"></div>
           <ToolbarButton icon={<Lock size={16} />} title="Lock" />
        </div>

        {/* Right: Collaboration & Export */}
          <div className="flex items-center gap-1.5 sm:gap-3">
          <div className="hidden lg:flex items-center">
             <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" placeholder="Search..." className="bg-gray-50 border border-gray-200 rounded-full py-1.5 pl-8 pr-3 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#FF3B30] w-36 transition-all" />
             </div>
          </div>
          
          <button onClick={() => {
             const svgElement = document.querySelector('.canvas-svg-container');
             if (svgElement) {
                const svgData = new XMLSerializer().serializeToString(svgElement);
                const blob = new Blob([svgData], {type: "image/svg+xml;charset=utf-8"});
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.download = `board-${boardId}.svg`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
             }
          }} className="px-2.5 sm:px-3 py-1.5 border border-gray-200 bg-white rounded-md text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center justify-center gap-1.5" title="Export board as SVG">
             <Download size={14} /> <span className="hidden sm:inline">Export</span>
          </button>
          
          <button onClick={() => setIsShareModalOpen(true)} className="flex items-center gap-1.5 bg-[#FF3B30] hover:bg-[#E3261C] text-white px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors shrink-0">
            <Share2 size={14} /> <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 relative overflow-hidden flex">
        
        {/* Left Toolbar (Floating, Scrollable) / Bottom Dock on Mobile */}
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 md:translate-x-0 md:left-4 md:top-4 md:bottom-24 w-[90%] md:w-14 bg-white border border-gray-200 shadow-xl rounded-2xl flex flex-row md:flex-col z-40 overflow-hidden">
           <div className="flex-1 overflow-x-auto md:overflow-y-auto no-scrollbar p-1.5 flex flex-row md:flex-col gap-1 items-center">
             
             {/* Core */}
             <ToolButton icon={<MousePointer2 size={16} />} tool="select" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Hand size={16} />} tool="hand" activeTool={activeTool} onClick={setActiveTool} />
             <div className="h-8 w-px md:w-8 md:h-px bg-gray-100 mx-1 md:mx-0 md:my-1 shrink-0" />
             
             {/* Shapes */}
             <ToolButton icon={<Square size={16} />} tool="rect" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Box size={16} />} tool="roundRect" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Circle size={16} />} tool="circle" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Triangle size={16} />} tool="triangle" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Hexagon size={16} />} tool="hexagon" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Octagon size={16} />} tool="octagon" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Star size={16} />} tool="star" activeTool={activeTool} onClick={setActiveTool} />
             <div className="h-8 w-px md:w-8 md:h-px bg-gray-100 mx-1 md:mx-0 md:my-1 shrink-0" />
             
             {/* Lines */}
             <ToolButton icon={<Minus size={16} />} tool="line" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<ArrowRight size={16} />} tool="arrow" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<ArrowRightLeft size={16} />} tool="doubleArrow" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<CornerUpRight size={16} />} tool="curvedArrow" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Link2 size={16} />} tool="connector" activeTool={activeTool} onClick={setActiveTool} />
             <div className="h-8 w-px md:w-8 md:h-px bg-gray-100 mx-1 md:mx-0 md:my-1 shrink-0" />
             
             {/* Drawing & Text */}
             <ToolButton icon={<Pencil size={16} />} tool="pencil" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Paintbrush size={16} />} tool="brush" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Highlighter size={16} />} tool="highlight" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Eraser size={16} />} tool="eraser" activeTool={activeTool} onClick={setActiveTool} />
             <div className="h-8 w-px md:w-8 md:h-px bg-gray-100 mx-1 md:mx-0 md:my-1 shrink-0" />
             
             <ToolButton icon={<Type size={16} />} tool="text" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<StickyNote size={16} />} tool="sticky" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<MessageSquare size={16} />} tool="comment" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<ImageIcon size={16} />} tool="image" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Frame size={16} />} tool="frame" activeTool={activeTool} onClick={setActiveTool} />
             <ToolButton icon={<Wand2 size={16} />} tool="laser" activeTool={activeTool} onClick={setActiveTool} />
             <div className="h-8 w-px md:w-8 md:h-px bg-gray-100 mx-1 md:mx-0 md:my-1 shrink-0" />
             
             <button onClick={() => setIsTemplateModalOpen(true)} className="p-2 shrink-0 rounded-xl flex items-center justify-center cursor-pointer transition-colors hover:bg-gray-50 text-gray-600 mt-0 md:mt-2" title="shape library">
                <Library size={16} />
             </button>
           </div>
        </div>

        {/* Canvas Area */}
        <div 
          className="flex-1 w-full h-full relative outline-none transition-colors duration-200" 
          style={{ backgroundColor: isDarkMode ? '#525252' : '#ffffff' }}
          tabIndex={0}
        >
            {fallbackNotice && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl px-4 py-3.5 shadow-xl flex items-start gap-2.5 backdrop-blur-sm">
                <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                <div className="flex-1">
                  <p className="text-xs font-bold text-amber-900 leading-normal mb-0.5">Model High Demand Fallback</p>
                  <p className="text-[11px] text-amber-800 leading-relaxed font-medium">{fallbackNotice}</p>
                </div>
                <button onClick={() => setFallbackNotice(null)} className="text-amber-600 hover:text-amber-800 cursor-pointer shrink-0 p-0.5 hover:bg-amber-100 rounded">
                  <X size={14} />
                </button>
              </div>
            )}
             {(isGeneratingAI || (aiError && shapes.length === 0)) && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center animate-fade-in">
                {isGeneratingAI ? (
                  <>
                    <div className="relative mb-6">
                      <div className="absolute inset-0 rounded-full bg-[#FFD60A]/20 animate-ping -m-4"></div>
                      <div className="w-16 h-16 rounded-full bg-white border border-gray-200 shadow-xl flex items-center justify-center text-[#FFD60A]">
                        <Sparkles size={32} className="animate-spin text-[#FFD60A]" />
                      </div>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">Yukti AI Co-Designer</h3>
                    <p className="text-xs text-gray-500 font-medium mb-3">{aiGeneratingMessage}</p>

                    {/* Premium Live Real-time Progress Bar HUD */}
                    <div className="w-full max-w-sm bg-gray-50 border border-gray-150 rounded-2xl p-4 shadow-sm animate-scale-in">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Canvas Construction</span>
                        <span className="text-xs font-extrabold text-[#FF3B30]">{aiLoadPercent}%</span>
                      </div>
                      
                      {/* Progress bar line */}
                      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-amber-400 via-rose-500 to-[#FF3B30] transition-all duration-300"
                          style={{ width: `${aiLoadPercent}%` }}
                        ></div>
                      </div>

                      {/* Step description */}
                      <p className="text-[11px] text-gray-600 font-semibold mt-3 text-left flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#FF3B30] animate-ping shrink-0" />
                        <span className="truncate">{aiLoadStepText || "Compiling system architecture..."}</span>
                      </p>

                      {/* Elements drawn counter indicator */}
                      {aiTotalElements > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                          <span>Drawn Elements:</span>
                          <span className="text-[#FF3B30] font-black">
                            {aiDrawnElements} / {aiTotalElements} shapes
                          </span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="max-w-md bg-white border border-gray-100 rounded-2xl p-6 shadow-2xl animate-scale-in">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 mx-auto mb-4 animate-bounce">
                      <Bot size={24} />
                    </div>
                    <h3 className="font-bold text-lg text-gray-900 mb-2">Yukti Co-Designer Error</h3>
                    <p className="text-sm text-gray-600 mb-4">{aiError}</p>
                    <div className="flex gap-3 justify-center">
                      {lastAttemptedType && lastAttemptedPrompt && (
                        <button 
                          onClick={() => handleGenerateAIDiagram(lastAttemptedType, lastAttemptedPrompt)}
                          className="px-4 py-2 bg-[#FF3B30] hover:bg-[#D63025] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm transition"
                        >
                          Retry Generation
                        </button>
                      )}
                      <button 
                        onClick={() => setAiError(null)}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer transition"
                      >
                        Draw Blank Board
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
            <div 
              ref={containerRef}
              className="w-full h-full overflow-hidden relative cursor-crosshair touch-none" 
              style={{ cursor: activeTool === 'hand' ? (panInfo.current.isPanning ? 'grabbing' : 'grab') : 'crosshair' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onMouseLeave={handlePointerUp}
              onDragOver={(e) => {
                 e.preventDefault();
                 e.dataTransfer.dropEffect = 'copy';
              }}
              onDrop={(e) => {
                 e.preventDefault();
                 const type = e.dataTransfer.getData('canvas/shape');
                 if (type) {
                    if (!containerRef.current) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
                    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
                    
                    let width = 100;
                    let height = 100;
                    if (type === 'sticky') {
                       width = 150; height = 150;
                    } else if (type === 'text') {
                       width = 100; height = 40;
                    }
                    
                    const shapeId = Date.now().toString();
                    addShape({
                       id: shapeId,
                       type: type as ShapeType,
                       x: x - width / 2,
                       y: y - height / 2,
                       width,
                       height,
                       color: selectedColor,
                       fillColor: selectedColor,
                       strokeColor: selectedStrokeColor,
                       stroke: selectedStroke,
                       text: type === 'sticky' || type === 'text' ? 'New text' : undefined,
                       flipX: false,
                       flipY: false
                    });
                    setActiveTool('select');
                    setSelection([shapeId]);
                 }
              }}
            >
              <svg
                className="canvas-svg-container absolute top-0 left-0 w-full h-full overflow-visible pointer-events-none"
                style={{ shapeRendering: 'geometricPrecision' }}
              >
                <defs>
                  <filter id="laser-glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                  <pattern
                    id="canvas-grid"
                    width={32 * viewport.zoom}
                    height={32 * viewport.zoom}
                    patternUnits="userSpaceOnUse"
                    patternTransform={`translate(${viewport.x % (32 * viewport.zoom)}, ${viewport.y % (32 * viewport.zoom)})`}
                  >
                    <circle cx={viewport.zoom} cy={viewport.zoom} r={1.5 * viewport.zoom} fill={isDarkMode ? "rgba(255, 255, 255, 0.2)" : "#e5e7eb"} />
                  </pattern>
                  {[...shapes, ...(draftShape ? [draftShape] : [])].map(shape => (shape.type === 'arrow' || shape.type === 'doubleArrow' || shape.type === 'curvedArrow' || shape.type === 'connector') ? (
                    <g key={`defs-${shape.id}`}>
                      <marker id={`arrowhead-${shape.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                         <polygon points="0 0, 10 3.5, 0 7" fill={shape.stroke === 'none' ? 'transparent' : (shape.strokeColor || (shape.color === '#111111' ? '#000' : (shape.color || '#111111')))} />
                      </marker>
                      <marker id={`arrowhead-start-${shape.id}`} markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                         <polygon points="10 0, 0 3.5, 10 7" fill={shape.stroke === 'none' ? 'transparent' : (shape.strokeColor || (shape.color === '#111111' ? '#000' : (shape.color || '#111111')))} />
                      </marker>
                    </g>
                  ) : null)}
                </defs>
                
                <rect width="100%" height="100%" fill="url(#canvas-grid)" pointerEvents="none" />

                <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>
 
                  {(() => {
                    const layerIndexMap = new Map<string, number>();
                    layers.forEach((l, idx) => {
                      layerIndexMap.set(l.id, idx);
                    });

                    const getShapeLayerIndex = (s: Shape) => {
                      const lid = s.layerId || 'default';
                      return layerIndexMap.has(lid) ? (layerIndexMap.get(lid) ?? 0) : 0;
                    };

                    const sortedAndFilteredShapes = shapes
                      .filter(s => {
                        const lid = s.layerId || 'default';
                        const layer = layers.find(l => l.id === lid);
                        return layer ? layer.visible : true;
                      })
                      .sort((a, b) => getShapeLayerIndex(a) - getShapeLayerIndex(b));

                    return [...sortedAndFilteredShapes, ...(draftShape ? [draftShape] : [])];
                  })().map((shape) => {
                    const isLineLike = ['line', 'arrow', 'doubleArrow', 'curvedArrow', 'connector'].includes(shape.type);
                    const transformStr = isLineLike ? 'translate(0, 0)' : `translate(${shape.x}, ${shape.y})`;
                    const { x1, y1, x2, y2 } = getLineCoords(shape, shapes);
                    const isSel = selectedShapeIds.includes(shape.id);

                    const isShapeLocked = (() => {
                      const lid = shape.layerId || 'default';
                      return layers.find(l => l.id === lid)?.locked ?? false;
                    })();

                    return (
                      <g
                        key={shape.id}
                        transform={transformStr}
                        className={`origin-center ${
                          isShapeLocked 
                            ? 'pointer-events-none opacity-60' 
                            : 'pointer-events-auto'
                        } ${activeTool === 'select' || activeTool === 'hand' ? (isLineLike ? 'cursor-default' : 'cursor-move') : 'cursor-crosshair'}`}
                        onPointerDown={(e) => {
                          if (isShapeLocked) return;
                          handleShapePointerDown(e, shape);
                        }}
                        style={{ pointerEvents: isShapeLocked ? 'none' : 'auto' }}
                      >
                        <ShapeRenderer 
                          shape={shape} 
                          isSelected={isSel} 
                          updateShape={updateShape} 
                          activeTool={activeTool}
                        />
                        {/* Selection Outline */}
                        {isSel && (
                          <g pointerEvents="auto">
                            {isLineLike ? (
                              <>
                                {/* Subtle guide line connecting start and end */}
                                <line 
                                  x1={x1} y1={y1} x2={x2} y2={y2} 
                                  fill="none" stroke="#007AFF" strokeWidth={1 / viewport.zoom} 
                                  strokeDasharray="4,4" 
                                  pointerEvents="none"
                                />
                                {/* Blue circle start handle */}
                                <circle 
                                  cx={x1} cy={y1} r={6 / viewport.zoom} 
                                  fill="#FFFFFF" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} 
                                  style={{ cursor: 'move' }}
                                  onPointerDown={(e) => {
                                    e.stopPropagation();
                                    dragLineInfo.current = { shapeId: shape.id, isEnd: 'start' };
                                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                                  }}
                                />
                                {/* Blue circle end handle */}
                                <circle 
                                  cx={x2} cy={y2} r={6 / viewport.zoom} 
                                  fill="#FFFFFF" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} 
                                  style={{ cursor: 'move' }}
                                  onPointerDown={(e) => {
                                    e.stopPropagation();
                                    dragLineInfo.current = { shapeId: shape.id, isEnd: 'end' };
                                    (e.target as HTMLElement).setPointerCapture(e.pointerId);
                                  }}
                                />
                              </>
                            ) : (
                              <g pointerEvents="none">
                                <rect 
                                  x={-4} y={-4} 
                                  width={Math.max(1, shape.width) + 8} 
                                  height={Math.max(1, shape.height) + 8} 
                                  fill="none" 
                                  stroke="#007AFF" 
                                  strokeWidth={1.5 / viewport.zoom} 
                                  vectorEffect="non-scaling-stroke"
                                />
                                {/* Edge Handles */}
                                <rect x={Math.max(1, shape.width) / 2 - 2} y={-7} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'ns-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 't')} />
                                <rect x={Math.max(1, shape.width) / 2 - 2} y={Math.max(1, shape.height) + 1} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'ns-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 'b')} />
                                <rect x={-7} y={Math.max(1, shape.height) / 2 - 2} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'ew-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 'l')} />
                                <rect x={Math.max(1, shape.width) + 1} y={Math.max(1, shape.height) / 2 - 2} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'ew-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 'r')} />
                                
                                {/* Corner Handles */}
                                <rect x={-7} y={-7} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'nwse-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 'tl')} />
                                <rect x={Math.max(1, shape.width) + 1} y={-7} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'nesw-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 'tr')} />
                                <rect x={Math.max(1, shape.width) + 1} y={Math.max(1, shape.height) + 1} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'nwse-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 'br')} />
                                <rect x={-7} y={Math.max(1, shape.height) + 1} width={6} height={6} fill="#fff" stroke="#007AFF" strokeWidth={1.5 / viewport.zoom} vectorEffect="non-scaling-stroke" pointerEvents="auto" style={{cursor: 'nesw-resize'}} onPointerDown={(e) => handleResizePointerDown(e, shape, 'bl')} />
                              </g>
                            )}
                          </g>
                        )}
                      </g>
                    );
                  })}

                  {/* Anchor Points overlay for snapping */}
                  {(['line', 'arrow', 'doubleArrow', 'curvedArrow', 'connector'].includes(activeTool) || isDrawing || dragLineInfo.current) && (
                    <g pointerEvents="none">
                      {getAllAnchors(shapes).map((anchor, idx) => {
                        const isSnapped = activeSnap && activeSnap.shapeId === anchor.shapeId && activeSnap.position === anchor.position;
                        return (
                          <g key={`anchor-${idx}`} transform={`translate(${anchor.x}, ${anchor.y})`}>
                            {isSnapped ? (
                              <>
                                <circle r={14 / viewport.zoom} fill="none" stroke="#FF9500" strokeWidth={1.5 / viewport.zoom} className="animate-ping" style={{ transformOrigin: 'center' }} />
                                <circle r={7 / viewport.zoom} fill="#FF9500" stroke="#FFFFFF" strokeWidth={2 / viewport.zoom} />
                              </>
                            ) : (
                              <circle r={5 / viewport.zoom} fill="#007AFF" fillOpacity={0.8} stroke="#FFFFFF" strokeWidth={1.5 / viewport.zoom} />
                            )}
                          </g>
                        );
                      })}
                    </g>
                  )}

                  {selectionBox && (
                    <rect
                      x={selectionBox.x}
                      y={selectionBox.y}
                      width={selectionBox.width}
                      height={selectionBox.height}
                      fill="rgba(0, 112, 243, 0.1)"
                      stroke="rgba(0, 112, 243, 0.6)"
                      strokeWidth={1 / viewport.zoom}
                      pointerEvents="none"
                    />
                  )}
                </g>
              </svg>
            </div>

            {/* Canvas Controls */}
            {selectedShapeIds.length > 1 && (
              <div className="absolute top-6 left-1/2 -translate-x-1/2 z-40 bg-white border border-gray-200 rounded-lg flex items-center shadow-lg p-1 gap-1">
                <button onClick={() => alignShapes('left')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Align Left"><AlignLeft size={16} /></button>
                <button onClick={() => alignShapes('center')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Align Center (Horizontal)"><AlignCenter size={16} /></button>
                <button onClick={() => alignShapes('right')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Align Right"><AlignRight size={16} /></button>
                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                <button onClick={() => alignShapes('top')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Align Top"><AlignVerticalJustifyStart size={16} /></button>
                <button onClick={() => alignShapes('middle')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Align Middle (Vertical)"><AlignVerticalJustifyCenter size={16} /></button>
                <button onClick={() => alignShapes('bottom')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Align Bottom"><AlignVerticalJustifyEnd size={16} /></button>
                {selectedShapeIds.length > 2 && (
                  <>
                    <div className="w-px h-4 bg-gray-200 mx-1"></div>
                    <button onClick={() => alignShapes('distribute-horizontal')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Distribute Horizontally"><AlignHorizontalSpaceAround size={16} /></button>
                    <button onClick={() => alignShapes('distribute-vertical')} className="p-1.5 hover:bg-gray-100 rounded text-gray-700" title="Distribute Vertically"><AlignVerticalSpaceAround size={16} /></button>
                  </>
                )}
              </div>
            )}

            <div className="absolute bottom-4 left-4 md:left-24 md:bottom-6 z-40 flex items-center gap-2">
               <div className="bg-white border border-gray-200 rounded-lg flex items-center shadow-lg">
                 <button onClick={() => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      zoom(1 / 1.2, rect.width / 2, rect.height / 2);
                    }
                 }} className="p-2 hover:bg-gray-50 text-gray-600"><ZoomOut size={16} /></button>
                 <span className="px-2 text-xs font-bold border-x border-gray-100 text-gray-600">{Math.round(viewport.zoom * 100)}%</span>
                 <button onClick={() => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      zoom(1.2, rect.width / 2, rect.height / 2);
                    }
                 }} className="p-2 hover:bg-gray-50 text-gray-600"><ZoomIn size={16} /></button>
               </div>
               
               <div className="bg-white border border-gray-200 rounded-lg flex items-center shadow-lg">
                 <button className="p-2 hover:bg-gray-50 text-gray-600" title="Fit to Screen" onClick={() => {
                    if (containerRef.current) {
                      const rect = containerRef.current.getBoundingClientRect();
                      useCanvasStore.getState().zoomToFit(rect.width, rect.height);
                    }
                 }}>
                   <Maximize size={16} />
                 </button>
               </div>
               
               <div className="bg-white border border-gray-200 rounded-lg flex items-center shadow-lg animate-fade-in">
                 <button 
                   className={`p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors flex items-center justify-center ${isDarkMode ? 'text-indigo-600' : 'text-gray-600'}`} 
                   title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode (#525252)"} 
                   onClick={() => setIsDarkMode(!isDarkMode)}
                 >
                   {isDarkMode ? <Sun size={16} /> : <Moon size={16} />}
                 </button>
               </div>

               <div className="bg-white border border-gray-200 rounded-lg flex items-center shadow-lg animate-fade-in">
                 <button 
                   className={`p-2 hover:bg-gray-50 cursor-pointer rounded-lg transition-colors flex items-center justify-center ${isLayersPanelOpen ? 'text-indigo-600 bg-indigo-50/50' : 'text-gray-600'}`} 
                   title="Layers Management" 
                   onClick={() => setIsLayersPanelOpen(!isLayersPanelOpen)}
                 >
                   <Layers size={16} />
                 </button>
               </div>
            </div>

            {/* Dynamic Layer Management Panel */}
            {isLayersPanelOpen && (
              <div className="absolute left-4 bottom-16 md:left-24 md:bottom-20 w-76 bg-white border border-gray-200 shadow-2xl rounded-xl p-3.5 z-40 flex flex-col animate-fade-in text-[#111111]">
                {/* Panel Header */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100 mb-2">
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-indigo-600">
                    <Layers size={14} />
                    <span>Canvas Layers</span>
                    <span className="bg-indigo-50 text-indigo-700 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold">
                      {layers.length}
                    </span>
                  </div>
                  <button 
                    onClick={() => setIsLayersPanelOpen(false)}
                    className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    title="Close layers panel"
                  >
                    <X size={14} />
                  </button>
                </div>

                {/* Layers List */}
                <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1 no-scrollbar flex-1">
                  {layers
                    .map((layer, index) => {
                      const isActive = layer.id === activeLayerId;
                      const shapesOnThisLayer = shapes.filter(s => (s.layerId || 'default') === layer.id);
                      const hasSelectedShapesOnThisLayer = selectedShapeIds.some(id => {
                        const sh = shapes.find(s => s.id === id);
                        return sh && (sh.layerId || 'default') === layer.id;
                      });

                      return (
                        <div 
                          key={layer.id}
                          className={`group flex items-center justify-between p-2 rounded-lg border text-xs transition-all ${
                            isActive 
                              ? 'border-indigo-200 bg-indigo-50/40 shadow-sm' 
                              : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50/50'
                          }`}
                        >
                          {/* Left Segment: Active Indicator + Name Input */}
                          <div 
                             className="flex items-center gap-2 flex-grow min-w-0 cursor-pointer"
                             onClick={() => setActiveLayerId(layer.id)}
                          >
                            {/* Active bullet */}
                            <div 
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isActive ? 'bg-indigo-600 ring-4 ring-indigo-100/50' : 'bg-gray-300'
                              }`} 
                              title={isActive ? 'Active drawing layer' : 'Click to draw on this layer'}
                            />

                            {/* Inline layer title editor */}
                            <input
                              type="text"
                              value={layer.name}
                              onChange={(e) => {
                                updateLayer(layer.id, { name: e.target.value });
                              }}
                              onClick={(e) => e.stopPropagation()} // don't trigger layer activation on typing
                              className="font-medium bg-transparent border-none text-gray-800 focus:text-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-100 rounded px-1 truncate flex-grow min-w-0 text-xs py-0"
                            />

                            {/* Shape count badge */}
                            <span 
                              className={`text-[9px] font-mono px-1 rounded-sm shrink-0 whitespace-nowrap ${
                                hasSelectedShapesOnThisLayer
                                  ? 'bg-indigo-100 text-indigo-800 font-bold'
                                  : 'bg-gray-100 text-gray-500'
                              }`}
                              title={`${shapesOnThisLayer.length} items on this layer ${
                                hasSelectedShapesOnThisLayer ? '(contains selected items)' : ''
                              }`}
                            >
                              {shapesOnThisLayer.length}
                            </span>
                          </div>

                          {/* Right Segment: Visibility, Lock, Reorder, Delete Actions */}
                          <div className="flex items-center gap-1 shrink-0 ml-1.5">
                            {/* Visibility Toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLayer(layer.id, { visible: !layer.visible });
                              }}
                              className={`p-1 rounded hover:bg-gray-200/60 transition-colors ${
                                layer.visible ? 'text-gray-500 hover:text-gray-750' : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                              }`}
                              title={layer.visible ? 'Hide layer' : 'Show layer'}
                            >
                              {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
                            </button>

                            {/* Lock Toggle */}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateLayer(layer.id, { locked: !layer.locked });
                              }}
                              className={`p-1 rounded hover:bg-gray-200/60 transition-colors ${
                                layer.locked ? 'text-indigo-650 bg-indigo-50 hover:bg-indigo-100/50' : 'text-gray-400 hover:text-gray-700'
                              }`}
                              title={layer.locked ? 'Unlock layer' : 'Lock layer'}
                            >
                              {layer.locked ? <Lock size={12} /> : <Unlock size={12} />}
                            </button>

                            {/* Reordering Controls: Move UP / DOWN */}
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (index > 0) {
                                  const prev = [...layers];
                                  const temp = prev[index];
                                  prev[index] = prev[index - 1];
                                  prev[index - 1] = temp;
                                  setLayers(prev);
                                }
                              }}
                              className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-200/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Move Layer Down (Draw Underneath)"
                            >
                              <ChevronDown size={12} />
                            </button>

                            <button
                              type="button"
                              disabled={index === layers.length - 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (index < layers.length - 1) {
                                  const prev = [...layers];
                                  const temp = prev[index];
                                  prev[index] = prev[index + 1];
                                  prev[index + 1] = temp;
                                  setLayers(prev);
                                }
                              }}
                              className="p-1 rounded text-gray-400 hover:text-gray-600 transition-colors hover:bg-gray-200/60 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Move Layer To Top (Draw On Top)"
                            >
                              <ChevronUp size={12} />
                            </button>

                            {/* Delete Layer Button */}
                            <button
                              type="button"
                              disabled={layers.length <= 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteLayer(layer.id);
                              }}
                              className="p-1 rounded text-gray-400 hover:text-[#FF3B30] hover:bg-red-50/50 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
                              title="Delete layer (shapes will migrate to fallback)"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>

                {/* Creation & Actions Panel */}
                <div className="pt-2 border-t border-gray-100 mt-2 flex flex-col gap-2">
                  {/* Quick Move Selected Shapes to Selected Layer option */}
                  {selectedShapeIds.length > 0 && (
                    <div className="bg-indigo-50/30 hover:bg-indigo-50/50 border border-indigo-100/50 rounded-lg p-2 flex flex-col gap-1 transition-colors">
                      <span className="text-[10px] text-indigo-700 font-medium">
                        Move {selectedShapeIds.length} selected object{selectedShapeIds.length > 1 ? 's' : ''} to:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {layers.map(l => (
                          <button
                            key={`move-to-${l.id}`}
                            onClick={() => {
                              selectedShapeIds.forEach(id => {
                                updateShape(id, { layerId: l.id });
                              });
                            }}
                            className="bg-white hover:bg-indigo-50 border border-indigo-200 rounded px-1.5 py-0.5 text-[9px] font-medium text-indigo-700 transition-colors"
                            title={`Move selected objects to ${l.name}`}
                          >
                            {l.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Layer Button */}
                  <button
                    onClick={() => {
                      const lNum = layers.length + 1;
                      addLayer(`Layer ${lNum}`);
                    }}
                    className="w-full bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded-lg py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <Plus size={14} /> Add New Layer
                  </button>
                </div>
              </div>
            )}

                  {/* Floating AI Assistant */}
                  <div className="absolute bottom-4 right-4 md:right-6 md:bottom-6 z-40">
                     {/* Menu items */}
                     <div className={`absolute bottom-16 right-0 w-[280px] xs:w-72 max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-xl border border-gray-200 p-3 transition-all transform duration-150 origin-bottom-right ${isAiMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'}`}>
                        <div className="px-3 py-2 border-b border-gray-100 mb-2 flex items-center justify-between">
                           <div className="flex items-center gap-2">
                              <Sparkles size={14} className="text-[#FFD60A]" />
                              <span className="font-semibold text-xs text-[#111111]">
                                {!selectedPreset ? 'Yukti AI Assistant' : (
                                  selectedPreset === 'flowchart' ? 'AI Flowchart' : 
                                  selectedPreset === 'mindmap' ? 'AI Mind Map' :
                                  selectedPreset === 'architecture' ? 'AI Architecture' :
                                  selectedPreset === 'journey' ? 'AI User Journey' : 'AI Product Roadmap'
                                )}
                              </span>
                           </div>
                           {selectedPreset ? (
                             <button 
                               onClick={() => setSelectedPreset(null)} 
                               className="text-gray-500 hover:text-gray-700 text-[10px] font-semibold px-1.5 py-0.5 rounded hover:bg-gray-100"
                             >
                               ← Back
                             </button>
                           ) : (
                             <button 
                               onClick={() => setIsAiMenuOpen(false)} 
                               className="text-gray-400 hover:text-gray-600 text-xs font-bold px-1.5 py-0.5 rounded hover:bg-gray-50"
                             >
                               ✕
                             </button>
                           )}
                        </div>
                        
                        {aiError && (
                          <div className="mx-2 mb-2 p-2 bg-red-50 text-red-600 rounded text-[10px] leading-relaxed border border-red-100 max-h-24 overflow-y-auto">
                            {aiError}
                          </div>
                        )}

                        {!selectedPreset ? (
                          <>
                            <div className="space-y-1">
                               <button 
                                 onClick={() => {
                                   setSelectedPreset('flowchart');
                                   setAiPrompt("User signup with email validation steps");
                                 }}
                                 className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center justify-between"
                               >
                                 <span className="flex items-center gap-2">
                                   <Network size={14} className="text-[#FF3B30]" /> Generate Flowchart
                                 </span>
                                 <span className="text-[9px] text-gray-400 font-mono">Steps</span>
                               </button>
                               <button 
                                 onClick={() => {
                                   setSelectedPreset('mindmap');
                                   setAiPrompt("Marketing priorities brainstorm");
                                 }}
                                 className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center justify-between"
                               >
                                 <span className="flex items-center gap-2">
                                   <Bot size={14} className="text-orange-500" /> Generate Mind Map
                                 </span>
                                 <span className="text-[9px] text-gray-400 font-mono">Hub</span>
                               </button>
                               <button 
                                 onClick={() => {
                                   setSelectedPreset('architecture');
                                   setAiPrompt("Highly-available real-time chat with cloud services");
                                 }}
                                 className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center justify-between"
                               >
                                 <span className="flex items-center gap-2">
                                   <Box size={14} className="text-blue-500" /> Generate Architecture
                                 </span>
                                 <span className="text-[9px] text-gray-400 font-mono">Layers</span>
                               </button>
                               <button 
                                 onClick={() => {
                                   setSelectedPreset('journey');
                                   setAiPrompt("New mobile app user registration journey map");
                                 }}
                                 className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center justify-between"
                               >
                                 <span className="flex items-center gap-2">
                                   <MousePointerClick size={14} className="text-pink-500" /> Generate User Journey
                                 </span>
                                 <span className="text-[9px] text-gray-400 font-mono">UX</span>
                               </button>
                               <button 
                                 onClick={() => {
                                   setSelectedPreset('roadmap');
                                   setAiPrompt("Marketing campaign timeline Q3");
                                 }}
                                 className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center justify-between"
                               >
                                 <span className="flex items-center gap-2">
                                    <MapIcon size={14} className="text-green-600" /> Generate Product Roadmap
                                 </span>
                                 <span className="text-[9px] text-gray-400 font-mono">Timeline</span>
                               </button>
                            </div>
                            <form 
                              onSubmit={(e) => {
                                e.preventDefault();
                                if (aiPrompt.trim()) {
                                  handleGenerateAIDiagram('flowchart', aiPrompt);
                                }
                              }}
                              className="mt-2 pt-2 border-t border-gray-100 px-2"
                            >
                               <div className="relative">
                                  <input 
                                    type="text" 
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    placeholder="Or describe any flowchart/diagram..." 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-[11px] text-gray-950 focus:outline-none focus:ring-1 focus:ring-[#FFD60A] transition-all" 
                                  />
                                  <button 
                                    type="submit" 
                                    title="Generate with custom prompt"
                                    className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#111111] rounded flex items-center justify-center text-white hover:bg-neutral-800 transition-colors"
                                  >
                                    <ArrowRight size={10} />
                                  </button>
                               </div>
                            </form>
                          </>
                        ) : (
                          <div className="px-1 py-1 space-y-3">
                            <div>
                              <label className="block text-[10px] font-semibold text-gray-400 mb-1 uppercase tracking-wider">
                                What is the concept/topic?
                              </label>
                              <textarea
                                value={aiPrompt}
                                onChange={(e) => setAiPrompt(e.target.value)}
                                rows={3}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs text-gray-950 focus:outline-none focus:ring-2 focus:ring-[#FFD60A]/20 focus:border-[#FFD60A] transition-all resize-none font-medium leading-relaxed"
                              />
                            </div>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => setSelectedPreset(null)}
                                className="flex-1 bg-gray-100 text-gray-700 hover:bg-gray-200 font-medium py-2 rounded-lg text-xs transition-colors"
                              >
                                Cancel
                              </button>
                              <button 
                                onClick={() => handleGenerateAIDiagram(selectedPreset, aiPrompt)}
                                className="flex-1 bg-black text-white hover:bg-neutral-900 font-medium py-2 rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow"
                              >
                                ✨ Generate
                              </button>
                            </div>
                          </div>
                        )}
                     </div>
                     
                     <button 
                       onClick={() => setIsAiMenuOpen(!isAiMenuOpen)}
                       className={`h-12 px-5 bg-white border rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-all font-semibold text-sm ${isAiMenuOpen ? 'border-[#FFD60A] ring-2 ring-[#FFD60A]/10 text-[#111111]' : 'border-gray-200 text-[#111111]'}`}
                     >
                        <Sparkles size={18} className="text-[#FFD60A] animate-pulse" /> Ask AI
                     </button>

                     {selectedShapeId && (
                       <button
                         onClick={() => setIsMobilePropertiesOpen(!isMobilePropertiesOpen)}
                         className="md:hidden h-12 w-12 bg-[#FF3B30] text-white hover:bg-[#E3261C] border border-white/20 rounded-full shadow-xl flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0"
                         title="Design options"
                       >
                         <Paintbrush size={18} className="text-white" />
                       </button>
                     )}
                  </div>
        </div>

        {/* Mobile Backdrop Overlay for Design properties */}
        {isMobilePropertiesOpen && (
          <div 
            className="fixed inset-0 bg-black/30 z-30 md:hidden transition-opacity"
            onClick={() => setIsMobilePropertiesOpen(false)}
          />
        )}

        {/* Right Panel (Properties) */}
        <div className={`
          bg-white border-l border-gray-200 flex flex-col z-35 shrink-0
          fixed md:relative top-14 bottom-0 right-0 w-[280px] md:h-auto h-[calc(100vh-56px)] transition-transform duration-300 ease-in-out
          ${isMobilePropertiesOpen ? 'translate-x-0 shadow-2xl' : 'translate-x-full md:translate-x-0'}
          ${(selectedShapeId || ['pencil', 'brush', 'highlight', 'laser'].includes(activeTool as string)) ? 'opacity-100 pointer-events-auto' : 'opacity-60 md:opacity-100 pointer-events-none md:pointer-events-auto'}
        `}>
           <div className="h-12 border-b border-gray-100 flex items-center justify-between px-4 shrink-0">
             <h3 className="font-semibold text-xs text-[#111111]">Design</h3>
             <button 
               onClick={() => setIsMobilePropertiesOpen(false)}
               className="md:hidden p-1 hover:bg-gray-100 rounded text-gray-500 cursor-pointer"
               title="Close sidebar"
             >
               <X size={15} />
             </button>
           </div>
           <div className="p-4 flex-1 overflow-y-auto space-y-6 no-scrollbar">
              
              {/* Pen & Brush Studio (Handwriting Smoothing & Variable Stroke Profiles) */}
               {['pencil', 'brush', 'highlight', 'laser'].includes(activeTool) && (
                 <div className="pb-4 border-b border-gray-100 space-y-4">
                   <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600">
                     <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                       <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                     </svg>
                     <span>Academic Pen & Brush Studio</span>
                   </div>

                   {/* Handwriting Smoothing */}
                   <div className="space-y-1.5">
                     <div className="flex items-center justify-between text-xs">
                       <span className="text-gray-600 font-medium flex items-center gap-1" title="Instantly cleans up messy, jagged lines into elegant, smooth curves.">
                         Smoothing
                       </span>
                       <span className="text-[10px] font-semibold font-mono text-gray-500 bg-gray-100 rounded px-1.5 py-0.5">{smoothing}%</span>
                     </div>
                     <input
                       type="range"
                       min="0"
                       max="100"
                       value={smoothing}
                       onChange={(e) => setSmoothing(parseInt(e.target.value))}
                       className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600 focus:outline-none"
                     />
                     <p className="text-[10px] text-gray-400">Bezier interpolation & low-pass filtering</p>
                   </div>

                   {/* Variable Stroke (Calligraphy Simulation) */}
                   {['pencil', 'brush'].includes(activeTool) && (
                     <div className="flex items-center justify-between pt-2">
                       <div className="space-y-0.5">
                         <span className="text-xs text-gray-600 font-medium">Variable Stroke Profile</span>
                         <p className="text-[10px] text-gray-400">Calibrated calligraphic pen tapers</p>
                       </div>
                       <button
                         onClick={() => setUseVariableStroke(!useVariableStroke)}
                         className={`w-9 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${useVariableStroke ? "bg-indigo-600" : "bg-gray-200"}`}
                         title="Thins out stroke widths at ends to simulate classic fountain & calligraphy pens."
                       >
                         <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-200 ${useVariableStroke ? "translate-x-4" : "translate-x-0"}`} />
                       </button>
                     </div>
                   )}
                 </div>
               )}

               {/* Style Presets */}
              <div className="pb-4 border-b border-gray-100">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-xs font-semibold text-gray-500">Style Options</h4>
                </div>
                <div className="grid grid-cols-2 gap-2">
                   <button 
                     onClick={() => {
                        const baseColor = selectedColor === 'transparent' ? '#FFFFFF' : selectedColor;
                        const baseStrokeColor = selectedStrokeColor === 'transparent' ? '#000000' : selectedStrokeColor;
                        setSelectedColor(baseColor);
                        setSelectedStrokeColor(baseStrokeColor);
                        setSelectedStroke('solid');
                        selectedShapeIds.forEach(id => updateShape(id, { fillColor: baseColor, color: baseColor, strokeColor: baseStrokeColor, stroke: 'solid' }));
                     }}
                     className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-2 text-xs font-medium text-gray-700 flex flex-col items-center justify-center gap-1"
                   >
                     <div className="w-6 h-6 bg-[#34C759] border-2 border-[#111111] rounded-sm"></div>
                     Fill + Outline
                   </button>
                   <button 
                     onClick={() => {
                        const baseStrokeColor = selectedStrokeColor === 'transparent' ? (selectedColor === 'transparent' ? '#000000' : selectedColor) : selectedStrokeColor;
                        setSelectedColor('transparent');
                        setSelectedStrokeColor(baseStrokeColor);
                        setSelectedStroke('solid');
                        selectedShapeIds.forEach(id => updateShape(id, { fillColor: 'transparent', color: 'transparent', strokeColor: baseStrokeColor, stroke: 'solid' }));
                     }}
                     className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-2 text-xs font-medium text-gray-700 flex flex-col items-center justify-center gap-1"
                   >
                     <div className="w-6 h-6 bg-transparent border-2 border-[#111111] rounded-sm"></div>
                     Outline Only
                   </button>
                   <button 
                     onClick={() => {
                        const baseColor = selectedColor === 'transparent' ? (selectedStrokeColor === 'transparent' ? '#34C759' : selectedStrokeColor) : selectedColor;
                        setSelectedColor(baseColor);
                        setSelectedStrokeColor('transparent');
                        setSelectedStroke('none');
                        selectedShapeIds.forEach(id => updateShape(id, { fillColor: baseColor, color: baseColor, strokeColor: 'transparent', stroke: 'none' }));
                     }}
                     className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-2 text-xs font-medium text-gray-700 flex flex-col items-center justify-center gap-1"
                   >
                     <div className="w-6 h-6 bg-[#34C759] border-2 border-transparent rounded-sm"></div>
                     Fill Only
                   </button>
                   <button 
                     onClick={() => {
                        setSelectedColor('transparent');
                        setSelectedStrokeColor('transparent');
                        setSelectedStroke('none');
                        selectedShapeIds.forEach(id => updateShape(id, { fillColor: 'transparent', color: 'transparent', strokeColor: 'transparent', stroke: 'none' }));
                     }}
                     className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded p-2 text-xs font-medium text-gray-700 flex flex-col items-center justify-center gap-1"
                   >
                     <div className="w-6 h-6 bg-transparent border-2 border-dashed border-gray-300 rounded-sm"></div>
                     Transparent
                   </button>
                </div>
              </div>

              {/* Opacity */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                 <label className="text-xs font-semibold text-gray-500">Opacity</label>
                 <div className="flex items-center gap-2">
                    <input type="range" min="0" max="100" defaultValue="100" className="w-24 accent-[#FF3B30]" />
                    <span className="text-xs font-medium w-8 text-right">100%</span>
                 </div>
              </div>

              {/* Fill */}
              <div>
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-xs font-semibold text-gray-500">Fill Color</h4>
                   <button className="text-[10px] text-gray-400 font-medium hover:text-[#111111]">+</button>
                </div>
                <div className="flex items-center gap-2">
                   <div 
                      className="w-8 h-8 rounded border border-gray-200 relative overflow-hidden" 
                      style={{ backgroundColor: selectedColor === 'transparent' ? '#fff' : selectedColor, backgroundImage: selectedColor === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)' : 'none', backgroundSize: '8px 8px' }}
                   >
                     <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" value={selectedColor === 'transparent' ? '#ffffff' : selectedColor} onChange={(e) => {
                         setSelectedColor(e.target.value);
                         selectedShapeIds.forEach(id => updateShape(id, { fillColor: e.target.value, color: e.target.value }));
                     }}/>
                   </div>
                   <input type="text" value={selectedColor} readOnly className="flex-1 text-xs font-medium uppercase bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none" />
                   <span className="text-xs font-medium text-gray-400">100%</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {['#FF3B30', '#FFD60A', '#34C759', '#007AFF', '#5856D6', '#FFFFFF', '#111111', 'transparent'].map(c => (
                    <button 
                       key={c} 
                       onClick={() => {
                          setSelectedColor(c);
                          selectedShapeIds.forEach(id => updateShape(id, { fillColor: c, color: c }));
                       }}
                       className={`w-5 h-5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:ring-offset-1 ${selectedColor === c ? 'ring-2 ring-[#FF3B30] ring-offset-1' : ''}`} 
                       style={{ backgroundColor: c, backgroundImage: c === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)' : 'none', backgroundSize: '8px 8px' }} 
                    />
                  ))}
                </div>
              </div>

              {/* Stroke */}
              <div className="pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between mb-2">
                   <h4 className="text-xs font-semibold text-gray-500">Outline & Stroke Color</h4>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                   <div 
                      className="w-8 h-8 rounded border border-gray-200 relative overflow-hidden shadow-sm hover:border-indigo-400 transition-colors" 
                      style={{ backgroundColor: selectedStrokeColor === 'transparent' ? '#fff' : selectedStrokeColor, backgroundImage: selectedStrokeColor === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)' : 'none', backgroundSize: '8px 8px' }}
                      title="Custom Color Picker"
                   >
                     <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" value={selectedStrokeColor === 'transparent' ? '#ffffff' : selectedStrokeColor} onChange={(e) => {
                         setSelectedStrokeColor(e.target.value);
                         selectedShapeIds.forEach(id => updateShape(id, { strokeColor: e.target.value }));
                     }}/>
                   </div>
                   <input 
                     type="text" 
                     value={selectedStrokeColor === 'transparent' ? 'TRANSPARENT' : selectedStrokeColor} 
                     readOnly 
                     className="flex-1 text-xs font-mono font-medium uppercase bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none" 
                   />
                </div>
                
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] text-gray-400 font-medium uppercase tracking-wider block">Academic Presets</span>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { hex: '#4F46E5', name: 'Oxford Indigo' },
                      { hex: '#10B981', name: 'Cambridge Emerald' },
                      { hex: '#007AFF', name: 'Academic Blue' },
                      { hex: '#EF4444', name: 'Harvard Crimson' },
                      { hex: '#F59E0B', name: 'Amber Gold' },
                      { hex: '#8B5CF6', name: 'Royal Violet' },
                      { hex: '#111111', name: 'Charcoal Black' },
                      { hex: '#6B7280', name: 'Slate Gray' },
                      { hex: '#FFFFFF', name: 'Chalk White' },
                      { hex: 'transparent', name: 'Transparent' }
                    ].map(({ hex: c, name }) => (
                      <button 
                         key={`stroke-${c}`}
                         onClick={() => {
                            setSelectedStrokeColor(c);
                            selectedShapeIds.forEach(id => updateShape(id, { strokeColor: c }));
                         }}
                         className={`w-7 h-7 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#4f46e5] focus:ring-offset-1 transition-all ${selectedStrokeColor === c ? 'rotate-12 scale-110 shadow-sm ring-2 ring-[#4f46e5] ring-offset-1 z-10' : 'hover:scale-105 active:scale-95'}`} 
                         style={{ backgroundColor: c, backgroundImage: c === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)' : 'none', backgroundSize: '8px 8px' }} 
                         title={name}
                      />
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1 mb-3 bg-gray-50 p-1 rounded-lg border border-gray-200">
                   <button 
                     onClick={() => {
                        setSelectedStroke('solid');
                        selectedShapeIds.forEach(id => updateShape(id, { stroke: 'solid' }));
                     }}
                     className={`h-6 rounded flex items-center justify-center ${selectedStroke === 'solid' ? 'bg-white shadow-sm font-semibold' : 'hover:bg-gray-100'}`}
                     title="Solid Border"
                   >
                      <div className="w-5 h-0.5 bg-gray-800"></div>
                   </button>
                   <button 
                     onClick={() => {
                        setSelectedStroke('dashed');
                        selectedShapeIds.forEach(id => updateShape(id, { stroke: 'dashed' }));
                     }}
                     className={`h-6 rounded flex items-center justify-center ${selectedStroke === 'dashed' ? 'bg-white shadow-sm font-semibold' : 'hover:bg-gray-100'}`}
                     title="Dashed Border"
                   >
                      <div className="w-5 h-0 bg-transparent border-t border-dashed border-gray-800"></div>
                   </button>
                   <button 
                     onClick={() => {
                        setSelectedStroke('none');
                        selectedShapeIds.forEach(id => updateShape(id, { stroke: 'none' }));
                     }}
                     className={`h-6 rounded flex items-center justify-center text-[10px] ${selectedStroke === 'none' ? 'bg-white shadow-sm font-semibold text-gray-800' : 'text-gray-500 hover:bg-gray-100'}`}
                     title="No Border"
                   >
                      None
                   </button>
                </div>

                <div className="flex items-center justify-between gap-2">
                   <select className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF3B30] text-[#111111]">
                      <option>Solid</option>
                      <option>Edge</option>
                      <option>Thick</option>
                      <option>Extra Thick</option>
                   </select>
                   <div className="flex items-center gap-1 bg-white border border-gray-200 rounded px-2 py-1.5 w-16">
                      <span className="text-[10px] text-gray-400">W</span>
                      <input type="text" defaultValue="2" onChange={(e) => {
                         const val = parseInt(e.target.value) || 0;
                         selectedShapeIds.forEach(id => updateShape(id, { strokeWidth: val }));
                      }} className="w-full text-xs text-right focus:outline-none bg-transparent" />
                   </div>
                </div>
              </div>

              {/* Typography */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 mb-3">Typography</h4>
                <div className="space-y-2">
                   <select className="w-full bg-white border border-gray-200 rounded px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#FF3B30] text-[#111111] font-medium">
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Courier New</option>
                      <option>Comic Sans</option>
                      <option>Space Grotesk</option>
                   </select>
                   <div className="flex gap-2">
                      <div className="flex-1 bg-white border border-gray-200 rounded px-2 py-1.5 flex items-center justify-between focus-within:ring-1 focus-within:ring-[#FF3B30]">
                         <span className="text-[10px] text-gray-400">A</span>
                         <input type="text" defaultValue="14" className="w-8 text-xs text-right focus:outline-none" />
                      </div>
                      <div className="flex bg-gray-50 border border-gray-200 rounded p-1">
                         <button className="w-7 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-600"><AlignLeft size={12} /></button>
                         <button className="w-7 h-6 rounded flex items-center justify-center bg-white shadow-sm text-gray-800"><AlignCenter size={12} /></button>
                         <button className="w-7 h-6 rounded flex items-center justify-center hover:bg-gray-200 text-gray-600"><AlignRight size={12} /></button>
                      </div>
                   </div>
                </div>
              </div>

              {/* Layout & Effects */}
              <div className="pt-4 border-t border-gray-100">
                <h4 className="text-xs font-semibold text-gray-500 mb-3">Layout & Effects</h4>
                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-600 flex items-center gap-2"><Square size={12} className="text-gray-400"/> Corner Radius</span>
                     <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-16">
                        <input type="text" defaultValue="8" className="w-full text-xs text-right bg-transparent focus:outline-none" />
                     </div>
                   </div>
                   <div className="flex items-center justify-between">
                     <span className="text-xs text-gray-600 flex items-center gap-2"><Maximize size={12} className="text-gray-400"/> Shadow</span>
                     <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded px-2 py-1 w-16">
                        <input type="text" defaultValue="15%" className="w-full text-xs text-right bg-transparent focus:outline-none" />
                     </div>
                   </div>
                   <div className="flex gap-2 w-full mt-2">
                       <button onClick={() => {
                          if (selectedShapeId) {
                             const shape = shapes.find(s => s.id === selectedShapeId);
                             if (shape) {
                                setShapes([...shapes.filter(s => s.id !== selectedShapeId), shape]);
                             }
                          }
                       }} className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#111111]">Forward</button>
                       <button onClick={() => {
                          if (selectedShapeId) {
                             const shape = shapes.find(s => s.id === selectedShapeId);
                             if (shape) {
                                setShapes([shape, ...shapes.filter(s => s.id !== selectedShapeId)]);
                             }
                          }
                       }} className="flex-1 py-1.5 border border-gray-200 rounded text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-[#111111]">Backward</button>
                   </div>
                </div>
              </div>

           </div>
        </div>

      </div>

      {/* Footer Status Bar */}
      <footer className="h-8 bg-gray-50 border-t border-gray-200 px-4 flex items-center justify-between text-[10px] font-medium text-gray-500 shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
            <span>Connected: Live Sync Active</span>
          </div>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <span>4 Objects</span>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <span>X: 1420px, Y: -340px</span>
          <div className="h-4 w-[1px] bg-gray-200"></div>
          <div className="flex items-center gap-1">
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd"></path></svg>
            <span>Shortcuts: Alt + K</span>
          </div>
        </div>
      </footer>
      <TemplateLibraryModal isOpen={isTemplateModalOpen} onClose={() => setIsTemplateModalOpen(false)} />
      
      {showCanvasRenameModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCanvasRenameModal(false)}>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              confirmRenameBoardFromHeader();
            }}
            className="bg-white border border-gray-150 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-gray-900 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <Pencil size={18} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Rename Diagram</h3>
            </div>
            
            <div className="mb-6">
              <label htmlFor="canvas-title-input" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                New Board Title
              </label>
              <input
                id="canvas-title-input"
                type="text"
                value={tempCanvasTitle}
                onChange={(e) => setTempCanvasTitle(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-3.5 text-sm focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 shadow-sm transition-all"
                placeholder="Enter board title..."
                autoFocus
                required
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCanvasRenameModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all"
                disabled={isHeaderRenamingActive}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-bold text-white bg-[#111111] hover:bg-gray-900 rounded-xl shadow-sm transition-all"
                disabled={isHeaderRenamingActive}
              >
                {isHeaderRenamingActive ? "Saving..." : "Save Title"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showCanvasDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in" onClick={() => setShowCanvasDeleteModal(false)}>
          <div 
            className="bg-white border border-gray-150 rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-scale-in text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-[#FF3B30] mb-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 size={20} />
              </div>
              <h3 className="font-bold text-lg text-gray-900">Delete Diagram</h3>
            </div>
            
            <p className="text-sm text-gray-500 mb-6 leading-relaxed">
              Are you sure you want to delete this board? This action is permanent and cannot be undone.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCanvasDeleteModal(false)}
                className="px-4 py-2 text-sm font-semibold text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-xl border border-gray-200 transition-all"
                disabled={isHeaderDeletingActive}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteBoardFromHeader}
                className="px-4 py-2 text-sm font-bold text-white bg-[#FF3B30] hover:bg-[#E3261C] rounded-xl shadow-sm transition-all flex items-center justify-center animate-none"
                disabled={isHeaderDeletingActive}
              >
                {isHeaderDeletingActive ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {isShareModalOpen && boardId && (
        <ShareModal 
          boardId={boardId} 
          boardTitle={dbBoard?.title || 'Untitled Board'} 
          onClose={() => setIsShareModalOpen(false)} 
        />
      )}
    </div>
  )
}

function ToolButton({ icon, tool, activeTool, onClick }: { icon: React.ReactNode, tool: ShapeType | 'select' | 'hand', activeTool: ShapeType | 'select' | 'hand', onClick: (t: ShapeType | 'select' | 'hand') => void }) {
  const active = activeTool === tool;
  const isShape = !['select', 'hand', 'pencil', 'brush', 'highlight', 'eraser', 'laser', 'frame', 'image', 'comment'].includes(tool);
  return (
    <button 
      onClick={() => onClick(tool)}
      draggable={isShape}
      onDragStart={(e) => {
        if (isShape) {
          e.dataTransfer.setData('canvas/shape', tool);
          e.dataTransfer.effectAllowed = 'copy';
        }
      }}
      className={`p-2 rounded-xl flex items-center justify-center cursor-pointer transition-colors ${active ? 'bg-gray-100 text-[#111111]' : 'hover:bg-gray-50 text-gray-600'}`}
      title={tool}
    >
      {icon}
    </button>
  )
}

function ToolbarButton({ icon, title, onClick }: { icon: React.ReactNode, title: string, onClick?: () => void }) {
  return (
    <button 
      className="p-1.5 rounded-md text-gray-500 hover:text-[#111111] hover:bg-white hover:shadow-sm transition-all focus:outline-none"
      title={title}
      onClick={onClick}
    >
      {icon}
    </button>
  )
}
