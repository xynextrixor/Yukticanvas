import { Shape, ShapeType } from '../store/canvasStore';

export interface CanvasTemplate {
  id: string;
  name: string;
  description: string;
  shapes: Shape[];
}

const generateId = () => Math.random().toString(36).substr(2, 9);

function createRect(x: number, y: number, width: number, height: number, text: string, color: string, strokeColor: string = '#000000'): Shape {
  return { id: generateId(), type: 'rect', x, y, width, height, text, fillColor: color, strokeColor, stroke: 'solid' };
}

function createText(x: number, y: number, width: number, height: number, text: string, align: 'left'|'center'|'right' = 'center', color: string = '#111111'): Shape {
  return { id: generateId(), type: 'text', x, y, width, height, text, color, fillColor: 'transparent' };
}

function createSticky(x: number, y: number, text: string, color: string): Shape {
  return { id: generateId(), type: 'sticky', x, y, width: 160, height: 160, text, fillColor: color };
}

function createArrow(x: number, y: number, width: number, height: number): Shape {
  return { id: generateId(), type: 'arrow', x, y, width, height, strokeColor: '#000000', stroke: 'solid', flipX: width < 0, flipY: height < 0 };
}

function createFrame(x: number, y: number, width: number, height: number, color: string = '#f1f5f9', stroke: string = '#cbd5e1'): Shape {
  return { id: generateId(), type: 'rect', x, y, width, height, fillColor: color, strokeColor: stroke, stroke: 'solid' };
}

// 1. Startup Idea Mind Map
const createMindMap = (): Shape[] => {
  const shapes: Shape[] = [];
  const cx = 600, cy = 400;
  // core
  shapes.push({ id: generateId(), type: 'circle', x: cx - 80, y: cy - 80, width: 160, height: 160, text: 'Startup Idea\nCore Value', fillColor: '#3b82f6', color: '#ffffff', strokeColor: '#2563eb' });
  
  const nodes = ['Target Market', 'Problem', 'Solution', 'Revenue Model', 'Competitors', 'Marketing'];
  const r = 250;
  nodes.forEach((label, i) => {
    const angle = (Math.PI * 2 / nodes.length) * i;
    const nx = cx + Math.cos(angle) * r;
    const ny = cy + Math.sin(angle) * r;
    shapes.push(createArrow(cx, cy, nx - cx, ny - cy));
    shapes.push({ id: generateId(), type: 'roundRect', x: nx - 70, y: ny - 35, width: 140, height: 70, text: label, fillColor: '#eff6ff', strokeColor: '#bfdbfe' });
  });
  return shapes;
};

// 2. Product Roadmap
const createRoadmap = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Q3/Q4 Product Roadmap', 'left'));
  const cols = ['Q1 (Now)', 'Q2 (Next)', 'Q3 (Later)', 'Q4 (Future)'];
  cols.forEach((col, i) => {
    const x = 100 + i * 280;
    shapes.push(createFrame(x, 100, 260, 600));
    shapes.push(createText(x, 120, 260, 40, col));
    // Sample items
    shapes.push(createRect(x + 20, 180, 220, 60, `Initiative ${i+1}.1`, '#ffffff', '#e2e8f0'));
    shapes.push(createRect(x + 20, 260, 220, 60, `Initiative ${i+1}.2`, '#ffffff', '#e2e8f0'));
  });
  return shapes;
};

// 3. User Journey Map
const createUserJourney = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'User Journey Map'));
  const stages = ['Discovery', 'Evaluation', 'Purchase', 'Onboarding', 'Retention'];
  const rows = ['Actions', 'Thoughts', 'Emotions', 'Opportunities'];
  
  stages.forEach((stage, c) => {
    shapes.push(createRect(250 + c * 200, 100, 180, 60, stage, '#bfdbfe', '#2563eb'));
  });
  
  rows.forEach((row, r) => {
    shapes.push(createRect(50, 180 + r * 150, 180, 130, row, '#f1f5f9', '#94a3b8'));
    stages.forEach((stage, c) => {
      shapes.push(createSticky(260 + c * 200, 180 + r * 150, 'User touchpoint...', '#fef3c7'));
    });
  });
  return shapes;
};

// 4. Customer Persona Canvas
const createPersona = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Customer Persona Canvas'));
  shapes.push(createFrame(100, 100, 800, 600));
  
  shapes.push(createRect(120, 120, 240, 240, 'Portrait/Name\n"Jane Doe"', '#e2e8f0'));
  shapes.push(createRect(380, 120, 500, 110, 'Demographics & Background', '#f8fafc'));
  shapes.push(createRect(380, 250, 500, 110, 'Goals & Needs', '#f8fafc'));
  
  shapes.push(createRect(120, 380, 370, 300, 'Frustrations & Pain Points', '#fee2e2', '#f87171'));
  shapes.push(createRect(510, 380, 370, 300, 'Motivations & Behaviors', '#dcfce7', '#4ade80'));
  return shapes;
};

// 5. Business Model Canvas
const createBusinessModel = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Business Model Canvas'));
  const w = 180;
  const col1 = 100, col2 = 280, col3 = 460, col4 = 640, col5 = 820;
  
  shapes.push(createRect(col1, 100, w-10, 400, 'Key Partners', '#f8fafc'));
  shapes.push(createRect(col2, 100, w-10, 195, 'Key Activities', '#f8fafc'));
  shapes.push(createRect(col2, 305, w-10, 195, 'Key Resources', '#f8fafc'));
  shapes.push(createRect(col3, 100, w-10, 400, 'Value Propositions', '#bfdbfe'));
  shapes.push(createRect(col4, 100, w-10, 195, 'Customer Relationships', '#f8fafc'));
  shapes.push(createRect(col4, 305, w-10, 195, 'Channels', '#f8fafc'));
  shapes.push(createRect(col5, 100, w-10, 400, 'Customer Segments', '#f8fafc'));
  
  shapes.push(createRect(col1, 510, (w*2.5)-10, 200, 'Cost Structure', '#fee2e2'));
  shapes.push(createRect(col1 + (w*2.5), 510, (w*2.5)-10, 200, 'Revenue Streams', '#dcfce7'));
  return shapes;
};

// 6. SWOT Analysis
const createSWOT = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(200, 50, 600, 40, 'SWOT Analysis Matrix'));
  shapes.push(createRect(200, 120, 350, 300, 'STRENGTHS\n\nInternal positive factors', '#dcfce7', '#4ade80'));
  shapes.push(createRect(560, 120, 350, 300, 'WEAKNESSES\n\nInternal negative factors', '#fee2e2', '#f87171'));
  shapes.push(createRect(200, 430, 350, 300, 'OPPORTUNITIES\n\nExternal positive factors', '#bfdbfe', '#60a5fa'));
  shapes.push(createRect(560, 430, 350, 300, 'THREATS\n\nExternal negative factors', '#fef08a', '#facc15'));
  return shapes;
};

// 7. Lean Canvas
const createLeanCanvas = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Lean Canvas'));
  const w = 180;
  const col1 = 100, col2 = 280, col3 = 460, col4 = 640, col5 = 820;
  
  shapes.push(createRect(col1, 100, w-10, 400, 'Problem', '#f8fafc'));
  shapes.push(createRect(col2, 100, w-10, 195, 'Solution', '#f8fafc'));
  shapes.push(createRect(col2, 305, w-10, 195, 'Key Metrics', '#f8fafc'));
  shapes.push(createRect(col3, 100, w-10, 400, 'Unique Value Prov.', '#bfdbfe'));
  shapes.push(createRect(col4, 100, w-10, 195, 'Unfair Advantage', '#f8fafc'));
  shapes.push(createRect(col4, 305, w-10, 195, 'Channels', '#f8fafc'));
  shapes.push(createRect(col5, 100, w-10, 400, 'Customer Segments', '#f8fafc'));
  
  shapes.push(createRect(col1, 510, (w*2.5)-10, 200, 'Cost Structure', '#fee2e2'));
  shapes.push(createRect(col1 + (w*2.5), 510, (w*2.5)-10, 200, 'Revenue Streams', '#dcfce7'));
  return shapes;
};

// 8. Agile Sprint Board
const createSprintBoard = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Sprint Backlog Board'));
  const cols = ['To Do', 'In Progress', 'In Review', 'Done'];
  cols.forEach((col, i) => {
    const x = 100 + i * 250;
    shapes.push(createFrame(x, 100, 230, 600));
    shapes.push(createText(x, 120, 230, 40, col));
    
    shapes.push(createSticky(x + 35, 180, 'Task description...', '#ffec99'));
    shapes.push(createSticky(x + 35, 360, 'Another task...', '#ffec99'));
  });
  return shapes;
};

// 9. Kanban Board
const createKanban = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Kanban Board'));
  const cols = ['Backlog', 'Ready', 'Doing', 'Done'];
  cols.forEach((col, i) => {
    const x = 100 + i * 250;
    shapes.push(createFrame(x, 100, 230, 600));
    shapes.push(createText(x, 120, 230, 40, col));
    shapes.push(createRect(x + 20, 180, 190, 80, `Ticket ${i+1}`, '#ffffff', '#e2e8f0'));
    shapes.push(createRect(x + 20, 280, 190, 80, `Ticket ${i+2}`, '#ffffff', '#e2e8f0'));
  });
  return shapes;
};

// 10. Project Planning Board
const createProjectPlan = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Project Planning Board'));
  
  shapes.push(createRect(100, 100, 800, 120, 'Project Objectives & OKRs', '#bfdbfe'));
  
  shapes.push(createText(100, 250, 200, 40, 'Phases / Timeline'));
  const phases = ['Phase 1: Research', 'Phase 2: Design', 'Phase 3: Dev', 'Phase 4: Launch'];
  phases.forEach((p, i) => {
    const x = 100 + i * 205;
    shapes.push(createRect(x, 300, 195, 300, p, '#f8fafc'));
    shapes.push(createSticky(x + 18, 350, 'Milestone...', '#dcfce7'));
  });
  
  return shapes;
};

// 11. Brainstorming Board
const createBrainstorming = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(400, 50, 400, 40, 'Creative Brainstorming Canvas'));
  shapes.push(createFrame(100, 100, 1000, 700));
  
  shapes.push(createRect(450, 350, 300, 150, 'CENTRAL TOPIC\nWhat are we solving?', '#1e293b', '#0f172a'));
  
  for(let i=0; i<12; i++) {
    const angle = (Math.PI * 2 / 12) * i;
    const r = 350;
    const x = 600 + Math.cos(angle) * r - 80;
    const y = 425 + Math.sin(angle) * r - 80;
    shapes.push(createSticky(x, y, `Idea ${i+1}`, ['#ffec99', '#bfdbfe', '#dcfce7', '#fecaca'][i%4]));
  }
  return shapes;
};

// 12. Meeting Notes Workspace
const createMeetingNotes = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Meeting Notes Workspace'));
  
  shapes.push(createRect(100, 100, 300, 200, 'Agenda Items', '#f8fafc'));
  shapes.push(createRect(420, 100, 480, 200, 'Key Details & Participants', '#f8fafc'));
  
  shapes.push(createRect(100, 320, 450, 400, 'Discussion Notes', '#f8fafc'));
  shapes.push(createRect(570, 320, 330, 400, 'Action Items & Next Steps', '#fef3c7', '#f59e0b'));
  
  return shapes;
};

// 13. Website Sitemap
const createSitemap = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Website Sitemap'));
  
  const rootX = 500, rootY = 150;
  shapes.push(createRect(rootX, rootY, 160, 60, 'Home Page', '#bfdbfe'));
  
  const pages = ['About', 'Products', 'Services', 'Blog', 'Contact'];
  const spacing = 180;
  const startX = 500 - ((pages.length - 1) * spacing) / 2;
  
  pages.forEach((p, i) => {
    const x = startX + i * spacing;
    const y = rootY + 150;
    shapes.push(createArrow(rootX + 80, rootY + 60, x - (rootX + 80) + 80, y - (rootY + 60)));
    shapes.push(createRect(x, y, 160, 60, p, '#f1f5f9'));
    
    // Sub pages
    shapes.push(createArrow(x + 80, y + 60, 0, 80));
    shapes.push(createRect(x, y + 140, 160, 60, `Sub ${p} 1`, '#ffffff'));
    shapes.push(createArrow(x + 80, y + 200, 0, 80));
    shapes.push(createRect(x, y + 280, 160, 60, `Sub ${p} 2`, '#ffffff'));
  });
  
  return shapes;
};

// 14. User Flow Diagram
const createUserFlow = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Authentication User Flow'));
  
  let x = 100, y = 300;
  shapes.push({ id: generateId(), type: 'circle', x, y, width: 100, height: 100, text: 'Start', fillColor: '#dcfce7' });
  
  shapes.push(createArrow(x + 100, y + 50, 100, 0));
  x += 200;
  shapes.push(createRect(x, y, 160, 100, 'Login Page', '#f1f5f9'));
  
  shapes.push(createArrow(x + 160, y + 50, 100, 0));
  x += 260;
  shapes.push({ id: generateId(), type: 'diamond', x, y: y - 30, width: 160, height: 160, text: 'Valid Auth?', fillColor: '#fef3c7' });
  
  // Yes
  shapes.push(createArrow(x + 160, y + 50, 100, 0));
  shapes.push(createText(x + 180, y + 20, 60, 30, 'Yes'));
  shapes.push(createRect(x + 260, y, 160, 100, 'Dashboard', '#bfdbfe'));
  
  // No
  shapes.push(createArrow(x + 80, y + 130, 0, 100));
  shapes.push(createText(x + 90, y + 150, 60, 30, 'No'));
  shapes.push(createRect(x, y + 230, 160, 100, 'Show Error', '#fee2e2'));
  
  return shapes;
};

// 15. Process Flowchart
const createFlowchart = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Standard Operating Procedure flow'));
  
  shapes.push({ id: generateId(), type: 'roundRect', x: 400, y: 100, width: 160, height: 80, text: 'Process Start', fillColor: '#dcfce7' });
  shapes.push(createArrow(480, 180, 0, 80));
  shapes.push(createRect(400, 260, 160, 80, 'Action Step 1', '#f1f5f9'));
  shapes.push(createArrow(480, 340, 0, 80));
  shapes.push({ id: generateId(), type: 'diamond', x: 400, y: 420, width: 160, height: 160, text: 'Decision Point?', fillColor: '#fef3c7' });
  shapes.push(createArrow(480, 580, 0, 80));
  shapes.push(createRect(400, 660, 160, 80, 'Final Action', '#f1f5f9'));
  shapes.push(createArrow(480, 740, 0, 80));
  shapes.push({ id: generateId(), type: 'roundRect', x: 400, y: 820, width: 160, height: 80, text: 'Process End', fillColor: '#fca5a5' });

  // branch
  shapes.push(createArrow(560, 500, 160, 0));
  shapes.push(createRect(720, 460, 160, 80, 'Alternate Action', '#f1f5f9'));

  return shapes;
};

// 16. Organizational Chart
const createOrgChart = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Company Organizational Chart'));
  
  shapes.push(createRect(500, 100, 200, 80, 'CEO', '#1e293b', '#000'));
  
  const depts = ['CTO', 'CMO', 'COO', 'CFO'];
  depts.forEach((dept, i) => {
    const x = 200 + i * 250;
    const y = 300;
    shapes.push(createArrow(600, 180, x + 100 - 600, y - 180));
    shapes.push(createRect(x, y, 200, 80, dept, '#3b82f6', '#1d4ed8'));
    
    // reports
    shapes.push(createArrow(x + 100, y + 80, 0, 80));
    shapes.push(createRect(x + 25, y + 160, 150, 60, `${dept} Direct Report`, '#93c5fd'));
    shapes.push(createArrow(x + 100, y + 220, 0, 80));
    shapes.push(createRect(x + 25, y + 300, 150, 60, `Team Level`, '#e0e7ff'));
  });
  
  return shapes;
};

// 17. Database ER Diagram
const createERD = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Entity Relationship Diagram'));
  
  // Table 1
  shapes.push(createRect(100, 150, 250, 40, 'Users Table', '#cbd5e1'));
  shapes.push(createRect(100, 190, 250, 180, 'PK id : UUID\nemail : VARCHAR\npassword : VARCHAR\ncreated_at : TIMESTAMP', '#f8fafc'));
  
  // Table 2
  shapes.push(createRect(500, 150, 250, 40, 'Posts Table', '#cbd5e1'));
  shapes.push(createRect(500, 190, 250, 220, 'PK id : UUID\nFK user_id : UUID\ntitle : VARCHAR\ncontent : TEXT\npublished : BOOLEAN\ncreated_at : TIMESTAMP', '#f8fafc'));
  
  // Relationship line
  shapes.push(createArrow(350, 280, 150, 0));
  shapes.push(createText(400, 250, 50, 30, '1:N'));

  // Table 3
  shapes.push(createRect(280, 500, 250, 40, 'Comments Table', '#cbd5e1'));
  shapes.push(createRect(280, 540, 250, 200, 'PK id : UUID\nFK post_id : UUID\nFK user_id : UUID\ncontent : TEXT\ncreated_at : TIMESTAMP', '#f8fafc'));
  
  shapes.push(createArrow(625, 410, 0, 90));
  shapes.push(createArrow(225, 370, 0, 130));

  return shapes;
};

// 18. UML Class Diagram
const createUML = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'UML Class Diagram'));
  
  shapes.push(createRect(350, 150, 300, 250, '«Abstract Document»\n\n+ id: String\n+ title: String\n+ author: User\n\n+ save(): boolean\n+ publish(): void', '#fef3c7'));
  shapes.push(createRect(150, 500, 300, 200, 'Article\n\n+ body: Text\n+ tags: List<String>\n\n+ formatToHTML(): String', '#dcfce7'));
  shapes.push(createRect(550, 500, 300, 200, 'ImageAsset\n\n+ url: String\n+ altText: String\n\n+ resize(w, h): file', '#dcfce7'));
  
  // Inheritance arrows
  shapes.push(createArrow(300, 500, 150, -100)); // up right
  shapes.push(createArrow(700, 500, -150, -100)); // up left

  return shapes;
};

// 19. System Architecture Diagram
const createSysArchitecture = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'Cloud Architecture Diagram'));
  
  shapes.push(createFrame(600, 150, 500, 600, '#f1f5f9', '#64748b')); // VPC
  shapes.push(createText(600, 150, 500, 40, 'Cloud VPC'));
  
  shapes.push(createRect(100, 400, 160, 100, 'Client / Web browser', '#bfdbfe'));
  shapes.push(createArrow(260, 450, 140, 0));
  
  shapes.push({ id: generateId(), type: 'octagon', x: 400, y: 390, width: 120, height: 120, text: 'Load\nBalancer', fillColor: '#3b82f6' });
  shapes.push(createArrow(520, 450, 120, -100));
  shapes.push(createArrow(520, 450, 120, 100));
  
  shapes.push(createRect(640, 300, 160, 100, 'Application Server Primary', '#dcfce7'));
  shapes.push(createRect(640, 500, 160, 100, 'Application Server Replica', '#dcfce7'));
  
  shapes.push(createArrow(800, 350, 100, 50));
  shapes.push(createArrow(800, 550, 100, -50));
  
  shapes.push({ id: generateId(), type: 'circle', x: 900, y: 350, width: 150, height: 150, text: 'Primary DB', fillColor: '#fef3c7' });

  return shapes;
};

// 20. AI Product Architecture Diagram
const createAIArchitecture = (): Shape[] => {
  const shapes: Shape[] = [];
  shapes.push(createText(100, 50, 400, 40, 'RAG AI Architecture'));
  
  shapes.push(createRect(100, 200, 200, 100, 'User Application UI', '#bfdbfe'));
  shapes.push(createArrow(300, 250, 100, 0));
  
  shapes.push(createRect(400, 200, 200, 100, 'API Gateway', '#f1f5f9'));
  shapes.push(createArrow(600, 250, 100, 0));
  shapes.push(createArrow(500, 300, 0, 100));
  
  shapes.push({ id: generateId(), type: 'hexagon', x: 700, y: 150, width: 200, height: 200, text: 'LLM Endpoint\n(Gemini 1.5)', fillColor: '#e0e7ff' });
  
  shapes.push(createRect(400, 400, 200, 100, 'Embedding Model', '#fef3c7'));
  shapes.push(createArrow(600, 450, 100, 0));
  
  shapes.push({ id: generateId(), type: 'circle', x: 700, y: 400, width: 200, height: 100, text: 'Vector Database', fillColor: '#dcfce7' });
  
  shapes.push(createArrow(800, 400, 0, -50)); // Search results back to LLM

  return shapes;
};

export const defaultTemplates: CanvasTemplate[] = [
  { id: 't1', name: 'Startup Idea Mind Map', description: 'Brainstorm core value proposition, problem, solution, and market.', shapes: createMindMap() },
  { id: 't2', name: 'Product Roadmap', description: 'Plan and visualize your product initiatives over time.', shapes: createRoadmap() },
  { id: 't3', name: 'User Journey Map', description: 'Map out the user experience across touchpoints.', shapes: createUserJourney() },
  { id: 't4', name: 'Customer Persona Canvas', description: 'Define the target customer profile and needs.', shapes: createPersona() },
  { id: 't5', name: 'Business Model Canvas', description: 'A strategic management and entrepreneurial tool.', shapes: createBusinessModel() },
  { id: 't6', name: 'SWOT Analysis', description: 'Evaluate strengths, weaknesses, opportunities, and threats.', shapes: createSWOT() },
  { id: 't7', name: 'Lean Canvas', description: 'A 1-page business plan template that helps you deconstruct your idea.', shapes: createLeanCanvas() },
  { id: 't8', name: 'Agile Sprint Board', description: 'Track your sprint backlog items and their progress.', shapes: createSprintBoard() },
  { id: 't9', name: 'Kanban Board', description: 'Visualize your work, limit work-in-progress, and maximize efficiency.', shapes: createKanban() },
  { id: 't10', name: 'Project Planning Board', description: 'Define objectives, phases, and key milestones.', shapes: createProjectPlan() },
  { id: 't11', name: 'Brainstorming Canvas', description: 'A freewriting space for radical ideation.', shapes: createBrainstorming() },
  { id: 't12', name: 'Meeting Notes Workspace', description: 'Structure your meetings with agendas and action items.', shapes: createMeetingNotes() },
  { id: 't13', name: 'Website Sitemap', description: 'Information architecture for websites and applications.', shapes: createSitemap() },
  { id: 't14', name: 'User Flow Diagram', description: 'Visualize the path taken by a prototypical user.', shapes: createUserFlow() },
  { id: 't15', name: 'Process Flowchart', description: 'Document an operational process or standard operating procedure.', shapes: createFlowchart() },
  { id: 't16', name: 'Organizational Chart', description: 'Visualize company structure and reporting lines.', shapes: createOrgChart() },
  { id: 't17', name: 'Database ER Diagram', description: 'Entity relationship diagram for database schema.', shapes: createERD() },
  { id: 't18', name: 'UML Class Diagram', description: 'Object-oriented programming system design blueprint.', shapes: createUML() },
  { id: 't19', name: 'System Architecture Diagram', description: 'High level system layout and infrastructure.', shapes: createSysArchitecture() },
  { id: 't20', name: 'AI Product Architecture Diagram', description: 'RAG and LLM systems flow blueprint.', shapes: createAIArchitecture() }
];
