export interface FallbackShape {
  type: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor?: string;
  strokeColor?: string;
  text?: string;
  flipX?: boolean;
  flipY?: boolean;
  stroke?: string;
}

// Helper to compute correct arrow coordinates between center of Shape A and Shape B
function createArrow(
  x1: number,
  y1: number,
  w1: number,
  h1: number,
  x2: number,
  y2: number,
  w2: number,
  h2: number,
  text = ""
): FallbackShape {
  // Find centers
  const cx1 = x1 + w1 / 2;
  const cy1 = y1 + h1 / 2;
  const cx2 = x2 + w2 / 2;
  const cy2 = y2 + h2 / 2;

  const rx = Math.min(cx1, cx2);
  const ry = Math.min(cy1, cy2);
  const rw = Math.max(Math.abs(cx2 - cx1), 8);
  const rh = Math.max(Math.abs(cy2 - cy1), 8);

  return {
    type: "arrow",
    x: rx,
    y: ry,
    width: rw,
    height: rh,
    flipX: cx1 > cx2,
    flipY: cy1 > cy2,
    text,
    strokeColor: "#111111",
    fillColor: "#111111"
  };
}

// Simple text extractor to find some meaningful words in the user prompt to customize fallback titles
function extractKeyTerms(prompt: string, count = 3): string[] {
  const words = prompt
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(
      (w) =>
        w.length > 3 &&
        !["create", "system", "diagram", "process", "design", "make", "build", "show", "some", "with", "flows", "flow"].includes(
          w.toLowerCase()
        )
    );
  if (words.length === 0) return ["Process Node"];
  return words.slice(0, count).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

export function generateFallbackDiagram(type: string, prompt: string): FallbackShape[] {
  const terms = extractKeyTerms(prompt, 5);
  const mainSubject = terms.join(" ") || "Your System";

  const shapes: FallbackShape[] = [];

  switch (type) {
    case "flowchart": {
      // 1. Start node
      const startX = 500, startY = 120, startW = 160, startH = 70;
      shapes.push({
        type: "roundRect",
        x: startX,
        y: startY,
        width: startW,
        height: startH,
        fillColor: "#E2F0D9", // light mint
        strokeColor: "#2F5597",
        text: `Start: ${terms[0] || "Initialize"}`
      });

      // 2. Step 1 Process
      const p1X = 500, p1Y = 270, p1W = 180, p1H = 80;
      shapes.push({
        type: "rect",
        x: p1X,
        y: p1Y,
        width: p1W,
        height: p1H,
        fillColor: "#FFF9DB", // dynamic yellow
        strokeColor: "#FF3B30",
        text: `Process: ${terms[1] || "Configure Action"}`
      });
      shapes.push(createArrow(startX, startY, startW, startH, p1X, p1Y, p1W, p1H));

      // 3. Decision Diamond
      const decX = 530, decY = 430, decW = 120, decH = 120;
      shapes.push({
        type: "diamond",
        x: decX,
        y: decY,
        width: decW,
        height: decH,
        fillColor: "#FFE699", // orange-yellow
        strokeColor: "#C65911",
        text: `Is Valid ${terms[2] || "Input"}?`
      });
      shapes.push(createArrow(p1X, p1Y, p1W, p1H, decX, decY, decW, decH));

      // 4. Branch Action (Left side) - Yes branch
      const sideX = 260, sideY = 450, sideW = 180, sideH = 80;
      shapes.push({
        type: "rect",
        x: sideX,
        y: sideY,
        width: sideW,
        height: sideH,
        fillColor: "#DEEBF7", // pastel blue
        strokeColor: "#2F5597",
        text: `Success: Route ${terms[3] || "Data"}`
      });
      shapes.push(createArrow(decX, decY, decW, decH, sideX, sideY, sideW, sideH, "Yes"));

      // 5. Alternate Step (Bottom branch) - No branch
      const failX = 500, failY = 635, failW = 180, failH = 80;
      shapes.push({
        type: "roundRect",
        x: failX,
        y: failY,
        width: failW,
        height: failH,
        fillColor: "#FFF0F5", // pastel purple/lavender
        strokeColor: "#E040FB",
        text: `Handling: Try ${terms[4] || "Rescue Plan"}`
      });
      shapes.push(createArrow(decX, decY, decW, decH, failX, failY, failW, failH, "No"));

      // Connect left branch down to final handler as well
      shapes.push(createArrow(sideX, sideY, sideW, sideH, failX, failY, failW, failH));
      break;
    }

    case "mindmap": {
      // 1. Central Core Concept
      const cx = 550, cy = 300, cw = 140, ch = 140;
      shapes.push({
        type: "circle",
        x: cx,
        y: cy,
        width: cw,
        height: ch,
        fillColor: "#E2F0D9", // Mint center
        strokeColor: "#111111",
        text: mainSubject
      });

      // Orbiting Sub-concepts (4 directions)
      const subNodes = [
        { name: terms[1] || "Core Ideas", x: 250, y: 154, color: "#DEEBF7" },
        { name: terms[2] || "Visual Styling", x: 850, y: 160, color: "#FFE699" },
        { name: terms[3] || "Workflow Engine", x: 260, y: 460, color: "#FFF0F5" },
        { name: terms[4] || "Scale Strategy", x: 840, y: 470, color: "#E2F0D9" }
      ];

      subNodes.forEach((node) => {
        const nw = 150, nh = 150;
        shapes.push({
          type: "sticky",
          x: node.x,
          y: node.y,
          width: nw,
          height: nh,
          fillColor: node.color,
          strokeColor: "#111111",
          text: node.name
        });
        shapes.push(createArrow(cx, cy, cw, ch, node.x, node.y, nw, nh));
      });
      break;
    }

    case "architecture": {
      // 1. Client / Interface Layer
      const clX1 = 300, clX2 = 630;
      const clY = 150, clW = 160, clH = 75;
      shapes.push({
        type: "roundRect",
        x: clX1,
        y: clY,
        width: clW,
        height: clH,
        fillColor: "#DEEBF7",
        strokeColor: "#3B82F6",
        text: "Web Client SPA"
      });
      shapes.push({
        type: "roundRect",
        x: clX2,
        y: clY,
        width: clW,
        height: clH,
        fillColor: "#DEEBF7",
        strokeColor: "#10B981",
        text: "Mobile iOS/Android"
      });

      // 2. Gateway / Middleware Tier
      const gwX = 450, gwY = 290, gwW = 180, gwH = 80;
      shapes.push({
        type: "rect",
        x: gwX,
        y: gwY,
        width: gwW,
        height: gwH,
        fillColor: "#FFE699",
        strokeColor: "#C65911",
        text: `API Gateway: ${terms[0] || "Proxy / Auth"}`
      });
      shapes.push(createArrow(clX1, clY, clW, clH, gwX, gwY, gwW, gwH));
      shapes.push(createArrow(clX2, clY, clW, clH, gwX, gwY, gwW, gwH));

      // 3. Application Services (Backend Layer)
      const srvX1 = 250, srvX2 = 650, srvY = 460, srvW = 180, srvH = 80;
      shapes.push({
        type: "rect",
        x: srvX1,
        y: srvY,
        width: srvW,
        height: srvH,
        fillColor: "#FFF9DB",
        strokeColor: "#E040FB",
        text: `${terms[1] || "Users"} Microservice`
      });
      shapes.push({
        type: "rect",
        x: srvX2,
        y: srvY,
        width: srvW,
        height: srvH,
        fillColor: "#FFF9DB",
        strokeColor: "#FF3B30",
        text: `${terms[2] || "Notification"} Engine`
      });
      shapes.push(createArrow(gwX, gwY, gwW, gwH, srvX1, srvY, srvW, srvH));
      shapes.push(createArrow(gwX, gwY, gwW, gwH, srvX2, srvY, srvW, srvH));

      // 4. Data Layer (Bottom tier)
      const dbX = 450, dbY = 630, dbW = 180, dbH = 80;
      shapes.push({
        type: "roundRect",
        x: dbX,
        y: dbY,
        width: dbW,
        height: dbH,
        fillColor: "#E2F0D9",
        strokeColor: "#2F5597",
        text: `Database Core [${terms[3] || "PostgreSQL"}]`
      });
      shapes.push(createArrow(srvX1, srvY, srvW, srvH, dbX, dbY, dbW, dbH));
      shapes.push(createArrow(srvX2, srvY, srvW, srvH, dbX, dbY, dbW, dbH));
      break;
    }

    case "journey": {
      // Horizontal stages (4 phases)
      const stages = [
        { title: "1. Discover", focus: terms[0] || "User lands on app", color: "#E2F0D9" },
        { title: "2. Sign Up", focus: terms[1] || "OAuth submission", color: "#DEEBF7" },
        { title: "3. Configure", focus: terms[2] || "Whiteboard setup", color: "#FFF9DB" },
        { title: "4. Complete", focus: terms[3] || "Publish & Export", color: "#FFF0F5" }
      ];

      stages.forEach((stage, index) => {
        const sx = 100 + index * 270;
        const colW = 210;

        // Stage Title Header
        shapes.push({
          type: "roundRect",
          x: sx,
          y: 120,
          width: colW,
          height: 60,
          fillColor: stage.color,
          strokeColor: "#111111",
          text: stage.title
        });

        // Sticky card for user expectation
        shapes.push({
          type: "sticky",
          x: sx + 10,
          y: 220,
          width: 190,
          height: 140,
          fillColor: "#FFFFFF",
          strokeColor: "#CCCCCC",
          text: `Action:\n${stage.focus}`
        });

        // Pain points card
        shapes.push({
          type: "sticky",
          x: sx + 10,
          y: 395,
          width: 190,
          height: 140,
          fillColor: "#FFEEEE",
          strokeColor: "#FF8888",
          text: `Pain points:\nSlow load times, lack of simple guidelines.`
        });

        // Connecting sequence arrow between stages
        if (index < stages.length - 1) {
          const nextSx = 100 + (index + 1) * 270;
          shapes.push(createArrow(sx + colW - 30, 150, 40, 20, nextSx, 150, 40, 20));
        }
      });
      break;
    }

    case "roadmap": {
      // 3 Swimlanes representation (Q1, Q2, Q3)
      const quarters = [
        { q: "Q1 Launch", tasks: [terms[0] || "Database Schema", terms[1] || "Live Sync Engine"], y: 140, color: "#DEEBF7" },
        { q: "Q2 Scaling", tasks: [terms[2] || "Yukti AI Integration", "Full Stack Migration"], y: 340, color: "#FFE699" },
        { q: "Q3 Optimization", tasks: [terms[3] || "Canvas Export", terms[4] || "Custom SVG Brush"], y: 540, color: "#E2F0D9" }
      ];

      quarters.forEach((quarter) => {
        // Quarter name header rect
        shapes.push({
          type: "rect",
          x: 100,
          y: quarter.y,
          width: 200,
          height: 140,
          fillColor: quarter.color,
          strokeColor: "#2F5597",
          text: quarter.q
        });

        // Quarter tasks inside lanes (stickies side-by-side)
        quarter.tasks.forEach((task, tIndex) => {
          const tx = 340 + tIndex * 240;
          shapes.push({
            type: "sticky",
            x: tx,
            y: quarter.y,
            width: 190,
            height: 140,
            fillColor: "#FFFFFF",
            strokeColor: "#CCCCCC",
            text: task
          });

          // Draw logical connections between task milestones
          if (tIndex > 0) {
            shapes.push(createArrow(tx - 50, quarter.y + 70, 20, 20, tx, quarter.y + 70, 20, 20));
          }
        });
      });
      break;
    }

    default: {
      // General diagram shapes fallback
      shapes.push({
        type: "rect",
        x: 400,
        y: 200,
        width: 300,
        height: 150,
        fillColor: "#DEEBF7",
        strokeColor: "#111111",
        text: mainSubject
      });
      shapes.push({
        type: "roundRect",
        x: 400,
        y: 450,
        width: 300,
        height: 150,
        fillColor: "#E2F0D9",
        strokeColor: "#111111",
        text: "Generate dynamic nodes vertically"
      });
      shapes.push(createArrow(400, 200, 300, 150, 400, 450, 300, 150));
      break;
    }
  }

  return shapes;
}
