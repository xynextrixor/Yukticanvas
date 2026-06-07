import * as React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { useNavigate, useParams, useLocation } from "react-router-dom"
import { 
  MousePointer2, Square, Circle, Triangle, Minus, ArrowRight,
  Pencil, Highlighter, Type, StickyNote, Image as ImageIcon,
  MoreHorizontal, Users, Share, Settings, ChevronLeft, Search, ZoomIn, ZoomOut, Sparkles,
  Hand, Hexagon, Octagon, Star, MessageSquare, Frame, Eraser, Link2, Wand2, Paintbrush,
  Undo2, Redo2, Copy, ClipboardPaste, CopyPlus, Group, Ungroup, MoveUp, MoveDown, Lock, Unlock, Download, Share2, AlignCenter, AlignLeft, AlignRight, CornerUpRight, ArrowRightLeft, AlignVerticalJustifyCenter, AlignVerticalJustifyStart, AlignVerticalJustifyEnd, AlignHorizontalJustifyCenter, AlignHorizontalSpaceAround, AlignVerticalSpaceAround,
  Box, Maximize, MousePointerClick, Bot, Network, Map, Library, Trash2
} from "lucide-react"
import { useKeyboardShortcuts } from "../../hooks/useKeyboardShortcuts"
import { TemplateLibraryModal } from "../../components/TemplateLibraryModal"
import ShareModal from "../../components/ShareModal"
import { useAuth } from "../../lib/AuthContext"
import { createBoardChannel, CollaboratorState, CursorPosition } from "../../lib/realtime"
import { useCanvasStore, Shape, ShapeType } from "../../store/canvasStore"
import { YuktiCanvasLogo } from "../../components/YuktiCanvasLogo"
import { getBoard, updateBoard, deleteBoard, Board } from "../../lib/boards"

const ShapeRenderer = ({ shape, isSelected, updateShape, activeTool }: { shape: Shape, isSelected: boolean, updateShape: any, activeTool: string }) => {
  const w = Math.max(1, shape.width);
  const h = Math.max(1, shape.height);
  
  const strokeColorFallback = shape.color === '#111111' ? '#000' : (shape.color || '#111111');
  const strokeColor = shape.stroke === 'none' ? 'transparent' : (shape.strokeColor || strokeColorFallback);
  
  const fillColorFallback = (shape.type === 'line' || shape.type === 'arrow' || shape.type === 'doubleArrow' || shape.type === 'pencil' || shape.type === 'text') ? 'none' : (shape.color || '#FFFFFF');
  const fillColor = shape.fillColor || fillColorFallback;
  
  const strokeWidth = shape.type === 'text' ? 0 : (shape.strokeWidth || 2);
  const strokeDasharray = shape.stroke === 'dashed' ? '8,8' : 'none';

    const renderContent = () => {
    switch (shape.type) {
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
        return <polygon points={`${w*0.3},0 ${w*0.7},0 ${w},${h*0.3} ${w},${h*0.7} ${w*0.7},${h} ${w*0.3},${h} 0,${h*0.7} 0,${h*0.3}`} fill={fillColor} stroke={strokeColor} strokeWidth={strokeWidth} strokeDasharray={strokeDasharray} strokeLinejoin="round" strokeLinecap="round" />;
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
            x1={shape.flipX ? w : 0} 
            y1={shape.flipY ? h : 0} 
            x2={shape.flipX ? 0 : w} 
            y2={shape.flipY ? 0 : h} 
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
        const x1 = shape.flipX ? w : 0;
        const y1 = shape.flipY ? h : 0;
        const x2 = shape.flipX ? 0 : w;
        const y2 = shape.flipY ? 0 : h;
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
        const x1 = shape.flipX ? w : 0;
        const y1 = shape.flipY ? h : 0;
        const x2 = shape.flipX ? 0 : w;
        const y2 = shape.flipY ? 0 : h;
        const midX = (x1 + x2) / 2;
        return (
          <path 
            d={`M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`} 
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
  
  const [collaborators, setCollaborators] = useState<CollaboratorState[]>([])
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const channelRef = useRef<any>(null)
  const isRemoteUpdateRef = useRef(false)
  
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
    setDraftShape
  } = useCanvasStore();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const templateId = searchParams.get('templateId');

  const [clipboard, setClipboard] = useState<Shape[]>([]);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const selectedShapeId = selectedShapeIds[0] || null;

  const [dbBoard, setDbBoard] = useState<Board | null>(null);
  const isLoadedRef = useRef(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  const handleDeleteBoardFromHeader = async () => {
    if (boardId && boardId !== 'new') {
      if (confirm("Are you sure you want to delete this board? This action is permanent.")) {
        try {
          await deleteBoard(boardId);
          nav('/app');
        } catch (err) {
          console.error("Failed to delete board from header:", err);
          alert("Failed to delete board");
        }
      }
    }
  };

  const handleRenameBoardFromHeader = async () => {
    if (boardId && boardId !== 'new' && dbBoard) {
      const newTitle = prompt("Enter new title for this board:", dbBoard.title || 'Untitled');
      if (newTitle !== null) {
        const trimmed = newTitle.trim();
        if (!trimmed) {
          alert("Board title cannot be empty!");
          return;
        }
        try {
          const updated = await updateBoard(boardId, { title: trimmed });
          setDbBoard(updated);
        } catch (err) {
          console.error("Failed to rename board from header:", err);
          alert("Failed to rename board");
        }
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

      if (user && user.email) {
        channelRef.current = createBoardChannel(
          boardId, 
          user.id, 
          user.email,
          (activeUsers) => setCollaborators(activeUsers.filter(u => u.id !== user.id)),
          (userId, pos) => {
            setCollaborators(prev => prev.map(c => c.id === userId ? { ...c, cursor: pos } : c));
          },
          (payload) => {
             // Received remote update
             isRemoteUpdateRef.current = true;
             if (payload.actionType === 'full_sync') {
                setShapes(payload.data.shapes);
             }
          }
        );
        return () => {
           if (channelRef.current) {
             channelRef.current.channel.unsubscribe();
           }
        }
      }
    }
  }, [boardId, setShapes, setViewport, user]);

  // Track cursor movement for realtime
  const handlePointerMoveCanvas = (e: React.PointerEvent) => {
    if (!channelRef.current) return;
    const pos = {
      x: (e.clientX - viewport.x) / viewport.zoom,
      y: (e.clientY - viewport.y) / viewport.zoom
    };
    channelRef.current.updateCursor(pos);
  };

  useEffect(() => {
    if (channelRef.current && selectedShapeIds) {
      channelRef.current.updateSelection(selectedShapeIds);
    }
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

  // Auto-save & broadcast
  useEffect(() => {
    if (!isLoadedRef.current || !boardId || boardId === 'new') return;
    
    if (isRemoteUpdateRef.current) {
      isRemoteUpdateRef.current = false;
      return; // Skip save/broadcast if change was from remote
    }

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      updateBoard(boardId, {
        content: { shapes, viewport }
      }).catch(err => console.error("Auto-save failed", err));

      if (channelRef.current) {
         channelRef.current.broadcastUpdate('full_sync', { shapes });
      }
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

  const [selectionBox, setSelectionBox] = useState<{x: number, y: number, width: number, height: number} | null>(null);
  const [selectedColor, setSelectedColor] = useState('#FFFFFF');
  const [selectedStrokeColor, setSelectedStrokeColor] = useState('#000000');
  const [selectedStroke, setSelectedStroke] = useState<'solid' | 'dashed' | 'none'>('solid');

  const getCanvasCoords = (e: React.PointerEvent) => {
    if (!containerRef.current) return { x: 0, y: 0 };
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left - viewport.x) / viewport.zoom;
    const y = (e.clientY - rect.top - viewport.y) / viewport.zoom;
    return { x, y };
  };

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
      setIsDrawing(true);
      setDraftShape({
        id: Date.now().toString(),
        type: activeTool as ShapeType,
        x: coords.x,
        y: coords.y,
        width: 0,
        height: 0,
        color: selectedColor, // legacy fallback if something breaks
        fillColor: selectedColor,
        strokeColor: selectedStrokeColor,
        stroke: selectedStroke
      });
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    handlePointerMoveCanvas(e);

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
      setDraftShape({
        ...draftShape,
        width: coords.x - draftShape.x,
        height: coords.y - draftShape.y
      });
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

  const handlePointerUp = (e: React.PointerEvent) => {
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
      addShape(finalShape);
      setIsDrawing(false);
      setDraftShape(null);
      setActiveTool('select');
      setSelection([finalShape.id]);
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
          
          <div className="flex items-center -space-x-1.5 mr-1 shrink-0">
             {collaborators.slice(0, 3).map((collab, i) => (
                <div key={collab.id} className={`w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-bold shadow-sm relative ${i > 0 ? "hidden xs:flex" : "flex"}`} style={{ backgroundColor: collab.color, zIndex: 30 - i }} title={collab.email}>
                   {collab.email?.substring(0, 1).toUpperCase() || 'U'}
                </div>
             ))}
             {collaborators.length > 3 && (
                <div className="w-7 h-7 rounded-full border-2 border-white bg-gray-100 text-gray-600 flex items-center justify-center text-[10px] font-bold shadow-sm relative z-0 hidden xs:flex">
                   +{collaborators.length - 3}
                </div>
             )}
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
        <div className="flex-1 w-full h-full relative outline-none bg-white" tabIndex={0}>
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
                  <pattern
                    id="canvas-grid"
                    width={32 * viewport.zoom}
                    height={32 * viewport.zoom}
                    patternUnits="userSpaceOnUse"
                    patternTransform={`translate(${viewport.x % (32 * viewport.zoom)}, ${viewport.y % (32 * viewport.zoom)})`}
                  >
                    <circle cx={viewport.zoom} cy={viewport.zoom} r={1.5 * viewport.zoom} fill="#e5e7eb" />
                  </pattern>
                  {[...shapes, ...(draftShape ? [draftShape] : [])].map(shape => (shape.type === 'arrow' || shape.type === 'doubleArrow' || shape.type === 'curvedArrow' || shape.type === 'connector') ? (
                    <g key={`defs-${shape.id}`}>
                      <marker id={`arrowhead-${shape.id}`} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                         <polygon points="0 0, 10 3.5, 0 7" fill={shape.stroke === 'none' ? 'transparent' : (shape.color === '#111111' ? '#000' : (shape.color || '#111111'))} />
                      </marker>
                      <marker id={`arrowhead-start-${shape.id}`} markerWidth="10" markerHeight="7" refX="1" refY="3.5" orient="auto">
                         <polygon points="10 0, 0 3.5, 10 7" fill={shape.stroke === 'none' ? 'transparent' : (shape.color === '#111111' ? '#000' : (shape.color || '#111111'))} />
                      </marker>
                    </g>
                  ) : null)}
                </defs>
                
                <rect width="100%" height="100%" fill="url(#canvas-grid)" pointerEvents="none" />

                <g transform={`translate(${viewport.x}, ${viewport.y}) scale(${viewport.zoom})`}>

                  {[...shapes, ...(draftShape ? [draftShape] : [])].map((shape) => (
                    <g
                      key={shape.id}
                      transform={`translate(${shape.x}, ${shape.y})`}
                      className={`pointer-events-auto origin-center ${activeTool === 'select' || activeTool === 'hand' ? 'cursor-move' : 'cursor-crosshair'}`}
                      onPointerDown={(e) => handleShapePointerDown(e, shape)}
                    >
                      <ShapeRenderer 
                        shape={shape} 
                        isSelected={selectedShapeIds.includes(shape.id)} 
                        updateShape={updateShape} 
                        activeTool={activeTool}
                      />
                      {/* Selection Outline */}
                      {selectedShapeIds.includes(shape.id) && (
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
                      
                      {/* Remote cursor selection boxes could go here if we wanted */}
                    </g>
                  ))}

                  {/* Remote Cursors */}
                  {collaborators.map(collab => collab.cursor && (
                      <g key={'cursor-'+collab.id} transform={`translate(${collab.cursor.x}, ${collab.cursor.y})`} style={{ pointerEvents: 'none', transition: 'transform 0.1s linear' }}>
                        <path d="M0,0 L8.5,23 L12.5,14.5 L21,11 Z" fill={collab.color} stroke="#FFFFFF" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                        <rect x={12} y={12} fill={collab.color} rx={4} width={Math.max(60, (collab.email?.split('@')[0] || 'User').length * 8 + 10)} height={20} />
                        <text x={17} y={26} fill="#FFFFFF" fontSize={12} fontWeight="bold">{collab.email?.split('@')[0] || 'User'}</text>
                      </g>
                  ))}

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
            </div>

                  {/* Floating AI Assistant */}
                  <div className="absolute bottom-4 right-4 md:right-6 md:bottom-6 z-40 group">
                     {/* Menu items */}
                     <div className="absolute bottom-16 right-0 w-[260px] xs:w-64 max-w-[calc(100vw-32px)] bg-white rounded-xl shadow-xl border border-gray-200 p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all translate-y-2 group-hover:translate-y-0">
                        <div className="px-3 py-2 border-b border-gray-100 mb-2">
                           <div className="flex items-center gap-2">
                              <Sparkles size={14} className="text-[#FFD60A]" />
                              <span className="font-semibold text-xs text-[#111111]">Yukti AI Assistant</span>
                           </div>
                        </div>
                        <div className="space-y-1">
                           <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center gap-2">
                              <Network size={14} className="text-gray-400" /> Generate Flowchart
                           </button>
                           <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center gap-2">
                              <Bot size={14} className="text-gray-400" /> Generate Mind Map
                           </button>
                           <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center gap-2">
                              <Box size={14} className="text-gray-400" /> Generate Architecture
                           </button>
                           <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center gap-2">
                              <MousePointerClick size={14} className="text-gray-400" /> Generate User Journey
                           </button>
                           <button className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-50 hover:text-[#111111] rounded-md transition-colors flex items-center gap-2">
                              <Map size={14} className="text-gray-400" /> Generate Product Roadmap
                           </button>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-100 px-2">
                           <div className="relative">
                              <input type="text" placeholder="Or type a prompt..." className="w-full bg-gray-50 border border-gray-200 rounded-md py-1.5 pl-3 pr-8 text-[11px] focus:outline-none focus:ring-1 focus:ring-[#FFD60A] transition-all" />
                              <button className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 bg-[#111111] rounded flex items-center justify-center text-white"><ArrowRight size={10} /></button>
                           </div>
                        </div>
                     </div>
                     
                     <button className="h-12 px-4 bg-white border border-gray-200 rounded-full shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-all font-semibold text-sm text-[#111111]">
                        <Sparkles size={18} className="text-[#FFD60A]" /> Ask AI
                     </button>
                  </div>
        </div>

        {/* Right Panel (Properties) */}
        <div className="w-[280px] bg-white border-l border-gray-200 hidden md:flex flex-col z-30 shrink-0">
           <div className="h-12 border-b border-gray-100 flex items-center px-4">
             <h3 className="font-semibold text-xs text-[#111111]">Design</h3>
           </div>
           <div className="p-4 flex-1 overflow-y-auto space-y-6 no-scrollbar">
              
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
                   <h4 className="text-xs font-semibold text-gray-500">Stroke</h4>
                </div>
                
                <div className="flex items-center gap-2 mb-3">
                   <div 
                      className="w-8 h-8 rounded border border-gray-200 relative overflow-hidden" 
                      style={{ backgroundColor: selectedStrokeColor === 'transparent' ? '#fff' : selectedStrokeColor, backgroundImage: selectedStrokeColor === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)' : 'none', backgroundSize: '8px 8px' }}
                   >
                     <input type="color" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer" value={selectedStrokeColor === 'transparent' ? '#ffffff' : selectedStrokeColor} onChange={(e) => {
                         setSelectedStrokeColor(e.target.value);
                         selectedShapeIds.forEach(id => updateShape(id, { strokeColor: e.target.value }));
                     }}/>
                   </div>
                   <input type="text" value={selectedStrokeColor} readOnly className="flex-1 text-xs font-medium uppercase bg-gray-50 border border-gray-200 rounded px-2 py-1.5 focus:outline-none" />
                </div>
                
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {['#FF3B30', '#34C759', '#007AFF', '#FFFFFF', '#000000', 'transparent'].map(c => (
                    <button 
                       key={`stroke-${c}`}
                       onClick={() => {
                          setSelectedStrokeColor(c);
                          selectedShapeIds.forEach(id => updateShape(id, { strokeColor: c }));
                       }}
                       className={`w-5 h-5 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#FF3B30] focus:ring-offset-1 ${selectedStrokeColor === c ? 'ring-2 ring-[#FF3B30] ring-offset-1' : ''}`} 
                       style={{ backgroundColor: c, backgroundImage: c === 'transparent' ? 'repeating-conic-gradient(#ccc 0% 25%, white 0% 50%)' : 'none', backgroundSize: '8px 8px' }} 
                    />
                  ))}
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
