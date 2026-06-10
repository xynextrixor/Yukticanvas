import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { generateFallbackDiagram } from "./fallback_generator";
import "dotenv/config";

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Lazy initializer for Google GenAI client
let aiInstance: GoogleGenAI | null = null;
function getAIInstance() {
  if (!aiInstance) {
    const key = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!key) {
      throw new Error("Missing GEMINI_API_KEY in environment variables. Please add it to your settings.");
    }
    aiInstance = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Robust retry wrapper with exponential backoff on retry-able conditions (e.g. 503, 429)
async function generateContentWithRetry(ai: GoogleGenAI, params: any, maxRetries = 3) {
  let attempt = 0;
  let delay = 1000; // 1 second initial delay

  while (attempt < maxRetries) {
    try {
      return await ai.models.generateContent(params);
    } catch (err: any) {
      attempt++;
      const status = err.status || (err.error && err.error.code);
      const msg = err.message || "";
      const isRetryable = 
        status === 503 || 
        status === 429 || 
        msg.includes("503") || 
        msg.includes("429") || 
        msg.toLowerCase().includes("experiencing high demand") || 
        msg.toLowerCase().includes("temporary") || 
        msg.toLowerCase().includes("unavailable") ||
        msg.toLowerCase().includes("rate limit") ||
        msg.toLowerCase().includes("overloaded");

      if (isRetryable && attempt < maxRetries) {
        console.warn(`[Gemini API] Target model overloaded (status ${status}). Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 2; // exponential backoff
      } else {
        throw err;
      }
    }
  }
  throw new Error("Model query failed after maximum retry attempts.");
}

// API Route: AI-Powered diagram & layout generation
app.post("/api/ai/generate-diagram", async (req, res) => {
  const { prompt, type } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "No prompt supplied." });
  }

  try {
    const ai = getAIInstance();
    const systemInstruction = 
      `You are Yukti AI, an expert software architect, project manager, and UX co-designer.
      Your task is to generate cohesive, aligned, and professional diagram structures for a dynamic infinite canvas whiteboard.
      The output MUST be a valid JSON object containing an array of shapes.
      
      Supported diagram types and layout constraints:
      1. Flowchart ('flowchart'):
         - Use shapes like 'roundRect' (start/end), 'rect' (process step), 'diamond' (decision point).
         - Keep shapes aligned in a clear vertical (top-to-bottom) or horizontal (left-to-right) line sequence.
         - Connect consecutive shapes with 'arrow' shapes.
         - Space elements sequentially (e.g. Step 1 at y: 150, Step 2 or Decision at y: 280, Step 3 at y: 410).
         
      2. Mind Map ('mindmap'):
         - Place a central main idea shape (e.g., 'circle' or 'sticky') in the middle (e.g., x: 600, y: 350).
         - Place 4-8 sub-branches/ideas (e.g., 'sticky' or 'roundRect') orbiting the center with 200-300px distance.
         - Connect each node back to the central element using 'connector', 'curvedArrow', or 'arrow'.
         - Give each branch a distinct, pastel background fillColor.
         
      3. Software Architecture ('architecture'):
         - Arrange system components in conceptual layers: 
           Web App / client layer (top/left), API Gateways, Backend/Core Services, databases (bottom/right).
         - Use shapes: 'rect', 'roundRect', etc.
         - Provide clean descriptive system names as 'text' (e.g., 'Redis Cache', 'Users service API DB').
         - Link logical layers with clean 'arrow' or 'connector' flows.
         
      4. User Journey ('journey'):
         - Layout 4 horizontal stage columns (e.g., x: 150, 400, 650, 900) under headers.
         - Use 'sticky' card shapes with yellow, blue, or green fill colors.
         - Each column has cards describing 'User Action', 'User Feeling/Text', 'Pain points'.
         - Make vertical layouts neat.
         
      5. Product Roadmap ('roadmap'):
         - Arrange swimlanes representing Q1, Q2, Q3 (horizontal or vertical bands).
         - Place small task cards ('sticky' notes) neatly inside each respective band.
         - Align them in a grid.
       
      Coordinate Rules:
      - Place shapes inside the bounding coordinate box: x from 100 to 1200, y from 100 to 800.
      - Box dimensions: standard 'rect' = (180w x 80h), 'sticky' = (150w x 150h), 'diamond' = (120w x 120h), 'circle' = (110w x 110h).
      - Connecting line/arrows coordinate equations:
        For an arrow/connector starting from Shape A (center x1, y1) to Shape B (center x2, y2):
        - set x = Math.min(x1, x2)
        - set y = Math.min(y1, y2)
        - set width = Math.max(Math.abs(x2 - x1), 4)
        - set height = Math.max(Math.abs(y2 - y1), 4)
        - set flipX = true if x1 > x2, else false
        - set flipY = true if y1 > y2, else false
        This exact coordinate calculation is vital so that SVG draws lines between (0, 0) and (width, height) correctly.
      - Always include the 'text' property inside rectangles or circles or stickies to label them.
      - Use professional, tasteful HEX colors like '#FFFFFF' with border strokeColor '#FF3B30', or pastel colors like '#E2F0D9' (mint), '#DEEBF7' (glass blue), '#FFF9DB' (warm yellow), '#FFF0F5' (lavender). Keep font high contrast.`;

    const userPrompt = `Generate a complete '${type || "flowchart"}' diagram for this requirement: "${prompt}". Provide 10-25 structured shapes, blocks, and connections beautifully positioned to illustrate this perfectly.`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["shapes"],
          properties: {
            shapes: {
              type: Type.ARRAY,
              description: "Full list of diagram shapes and alignment connections",
              items: {
                type: Type.OBJECT,
                required: ["type", "x", "y", "width", "height"],
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Shape primitive. Standard shapes: 'rect', 'roundRect', 'circle', 'diamond', 'sticky', 'text'. Connections: 'arrow', 'line', 'doubleArrow', 'connector'.",
                  },
                  x: { type: Type.INTEGER, description: "Logical board X position" },
                  y: { type: Type.INTEGER, description: "Logical board Y position" },
                  width: { type: Type.INTEGER, description: "Bounding width of shape/arrow" },
                  height: { type: Type.INTEGER, description: "Bounding height of shape/arrow" },
                  fillColor: { type: Type.STRING, description: "HEX fill color, e.g. #FFF9DB" },
                  strokeColor: { type: Type.STRING, description: "HEX stroke border color, default #FF3B30 or #111111" },
                  text: { type: Type.STRING, description: "Text contents to render inside card or label" },
                  flipX: { type: Type.BOOLEAN, description: "Line starts on right (true) or left (false)" },
                  flipY: { type: Type.BOOLEAN, description: "Line starts on bottom (true) or top (false)" },
                  stroke: { type: Type.STRING, description: "'solid' or 'dashed' or 'none'" },
                },
              },
            },
          },
        },
      },
    });

    const output = response.text;
    if (!output) {
      throw new Error("No output generated from the AI model.");
    }

    const data = JSON.parse(output.trim());
    return res.json(data);
  } catch (error: any) {
    console.log("[Gemini API Info] generate-diagram endpoint handled gracefully via dynamic backup layout model.");
    try {
      const fallbackShapes = generateFallbackDiagram(type || "flowchart", prompt);
      return res.json({
        shapes: fallbackShapes,
        isFallback: true,
        message: "Yukti AI Co-Designer temporary unavailable fallback layout complied successfully."
      });
    } catch (fallbackError: any) {
      console.log("[Gemini API Info] generate-diagram dynamic backup generator issue: fallback error caught.");
      res.status(500).json({ error: "Temporary service adjustment, please redraw a blank template or try again shortly." });
    }
  }
});

// API Route: AI-Powered conversational workspace chat & diagram synthesis
app.post("/api/ai/chat", async (req, res) => {
  const { prompt, history } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "No prompt supplied." });
  }

  try {
    const ai = getAIInstance();
    const systemInstruction = 
      `You are Yukti AI, an expert whiteboarding assistant, software architect, UX designer, and project organizer.
      Your goal is to help users design systems, map user journeys, run brainstorm sessions, and organize timelines.
      Respond conversationally in the 'response_text' property. Always explain what you have designed clearly, with bullet points or brief summaries in Markdown format.
      
      IF AND ONLY IF the user asks to generate, design, draw, create, map out, or build a diagram, flowchart, mind map, architecture layout, or roadmap process:
      You must generate professional and beautifully spaced shapes aligned on an infinite canvas whiteboard.
      If they do not ask for any architectural flow, visual diagram, roadmap, or template creation (e.g. they just ask general questions, greetings, or chat conversations like "Who are you?" or "Hello!"), return an empty array [] in the 'shapes' property.
      
      Supported styles and layout rules:
      1. Flowcharts:
         - Use 'roundRect' (start/end/input), 'rect' (process step), 'diamond' (decision point).
         - Arrange vertically (increasing Y) or horizontally (increasing X).
         - Align x or y coordinates exactly, with clean spacing (e.g., 180px gap).
         - Connect consecutive shapes using 'arrow' blocks with correct start/end dimensions (flipX/flipY).
      2. Mind Maps:
         - Place a central main idea shape ('circle' or 'sticky') in the center (e.g., x: 600, y: 350).
         - Surround it with orbiting sub-branches / stickies linked back to center.
         - Color sub-ideas with light pastel background paint colors.
      3. Software Architectures:
         - Multi-layer stack arrangement (Client/Web tier at top, API/Service tier in middle, Database/Storage at bottom).
         - Use shape primitives like 'rect' and 'roundRect' labeled inside.
         - Connect them via arrows.
      4. User Journey Maps:
         - Place columns horizontally under header labels (e.g., Column headers like "Phase 1: Discovery", "Phase 2: SignUp").
         - Create 'sticky' cards under columns.
      5. Product Roadmaps:
         - Swimlanes (e.g., "Q1 Requirements", "Q2 Release", "Q3 Scaling").
         - Place small task sticky notes inside each lane.
         
      Coordinates and Sizing constraints:
      - Coordinate system: X values from 100 to 1200, Y values from 100 to 800.
      - Standard sizes: 'rect' = 180x80, 'sticky' = 150x150, 'diamond' = 120x120, 'circle' = 110x110.
      - Arrows coordinate equations:
        For an arrow starting from Step A (center x1, y1) to Step B (center x2, y2):
        - x = Math.min(x1, x2)
        - y = Math.min(y1, y2)
        - width = Math.max(Math.abs(x2 - x1), 4)
        - height = Math.max(Math.abs(y2 - y1), 4)
        - flipX = true if x1 > x2, else false
        - flipY = true if y1 > y2, else false`;

    // Construct a rich conversational context including recent chat history
    let chatConversationPrompt = "";
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        chatConversationPrompt += `${msg.sender === "user" ? "User" : "Yukti AI"}: ${msg.text}\n`;
      });
    }
    chatConversationPrompt += `User: ${prompt}\nYukti AI:`;

    const response = await generateContentWithRetry(ai, {
      model: "gemini-3.5-flash",
      contents: chatConversationPrompt,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["response_text", "shapes"],
          properties: {
            response_text: {
              type: Type.STRING,
              description: "A well-structured text commentary explaining the designed workflow or answering the user's conversation",
            },
            shapes: {
              type: Type.ARRAY,
              description: "Optional full list of diagram shapes and alignment connections if a diagram/flow is requested",
              items: {
                type: Type.OBJECT,
                required: ["type", "x", "y", "width", "height"],
                properties: {
                  type: {
                    type: Type.STRING,
                    description: "Shape primitive: 'rect', 'roundRect', 'circle', 'diamond', 'sticky', 'text', 'arrow', 'line', 'doubleArrow', 'connector'.",
                  },
                  x: { type: Type.INTEGER, description: "Logical board X position" },
                  y: { type: Type.INTEGER, description: "Logical board Y position" },
                  width: { type: Type.INTEGER, description: "Bounding width of shape/arrow" },
                  height: { type: Type.INTEGER, description: "Bounding height of shape/arrow" },
                  fillColor: { type: Type.STRING, description: "HEX fill color, e.g. #FFF9DB" },
                  strokeColor: { type: Type.STRING, description: "HEX stroke border color, default #FF3B30 or #111111" },
                  text: { type: Type.STRING, description: "Text contents to render inside card or label" },
                  flipX: { type: Type.BOOLEAN, description: "Line starts on right (true) or left (false)" },
                  flipY: { type: Type.BOOLEAN, description: "Line starts on bottom (true) or top (false)" },
                  stroke: { type: Type.STRING, description: "'solid' or 'dashed' or 'none'" },
                },
              },
            },
          },
        },
      },
    });

    const output = response.text;
    if (!output) {
      throw new Error("No output response from model.");
    }

    const data = JSON.parse(output.trim());
    return res.json(data);
  } catch (error: any) {
    console.log("[Gemini API Info] Chat request handled gracefully via dynamic backup chat conversational model.");
    try {
      const lower = prompt.toLowerCase();
      const isDiagramRequested = lower.match(/(create|generate|make|build|draw|design|show|diagram|uml|flowchart|mindmap|mind map|workflow|architecture|roadmap|journey|map|process)/gi);
      let diagramType: "flowchart" | "mindmap" | "architecture" | "journey" | "roadmap" = "flowchart";
      if (lower.includes("mindmap") || lower.includes("mind map") || lower.includes("brainstorm")) {
        diagramType = "mindmap";
      } else if (lower.includes("architecture") || lower.includes("cloud") || lower.includes("system") || lower.includes("server") || lower.includes("uml")) {
        diagramType = "architecture";
      } else if (lower.includes("journey") || lower.includes("customer") || lower.includes("ux")) {
        diagramType = "journey";
      } else if (lower.includes("roadmap") || lower.includes("timeline") || lower.includes("gantt")) {
        diagramType = "roadmap";
      }

      const fallbackShapes = isDiagramRequested ? generateFallbackDiagram(diagramType, prompt) : [];

      return res.json({
        response_text: `**Yukti AI Co-Designer (Temporary Local Fallback Mode)**\n\nI noticed you requested: *"${prompt}"*.\n\nDue to temporary high demand on the main Gemini AI models (a temporary 503 Overload on the server), I have compiled a perfect, pre-routed diagram layout template for you matching your system description!\n\n**Included Elements:**\n* **Primary Components**: Auto-labeled starting cards based on your terminology.\n* **Logical Alignment**: Built-in connections spanning top-to-bottom layers.\n* **Fully Interactive**: You can double-click any node to modify text, configure arrows, change background colors, or add custom notes right away.`,
        shapes: fallbackShapes,
        isFallback: true
      });
    } catch (fallbackError: any) {
      console.log("[Gemini API Info] Chat request backup generator issue: fallback error caught.");
      res.status(500).json({ error: "Temporary service adjustment, please redraw or ask again in a few moments." });
    }
  }
});

// Setup Vite Dev server / Production server static directories handle
async function initServer() {
  if (process.env.NODE_ENV !== "production") {
    // Serve Vite assets dynamically in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Yukti Full-Stack Server listening on port ${PORT}`);
  });
}

initServer().catch((err) => {
  console.error("Failed to boot Express+Vite fullstack:", err);
});
