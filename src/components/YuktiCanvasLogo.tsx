export function YuktiCanvasLogo({ className = "", width = "auto", height = "32" }: { className?: string, width?: number | string, height?: number | string }) {
  return (
    <svg 
      className={className} 
      width={width} 
      height={height} 
      viewBox="0 0 240 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible' }}
    >
      {/* Sticker Outline / Shadow */}
      <path 
        d="M20 50 C20 20, 40 10, 80 15 L140 10 C180 5, 220 20, 220 50 C220 80, 180 90, 140 90 L80 95 C40 100, 20 80, 20 50 Z" 
        fill="white" 
        stroke="#F0F0F0"
        strokeWidth="4"
        filter="drop-shadow(0px 4px 6px rgba(0,0,0,0.1))"
      />
      
      {/* Lightbulb Doodle */}
      <g transform="translate(185, 15) rotate(15)">
        <path d="M10 25 C0 25, -5 15, 0 5 C5 -5, 15 -5, 20 5 C25 15, 20 25, 10 25 Z" fill="#FFD60A" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M5 25 L5 30 C5 32, 15 32, 15 30 L15 25" fill="white" stroke="#111111" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="7" y1="33" x2="13" y2="33" stroke="#111111" strokeWidth="2.5" strokeLinecap="round"/>
        {/* Filament */}
        <path d="M8 25 L8 15 C8 12, 12 12, 12 15 L12 25" stroke="#111111" strokeWidth="2" fill="none" strokeLinecap="round"/>
      </g>

      {/* Cursor Doodle */}
      <g transform="translate(15, 45) rotate(-20) scale(0.8)">
        <path d="M10 10 L40 25 L25 25 L25 45 Z" fill="white" stroke="#111111" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M15 17 L25 22 L20 22 L20 32 Z" fill="#FF3B30" />
      </g>

      {/* Box Doodle */}
      <g transform="translate(75, 5) rotate(-10) scale(0.7)">
        <rect x="5" y="10" width="30" height="20" rx="2" fill="#FFD60A" stroke="#111111" strokeWidth="3" strokeLinejoin="round"/>
        <path d="M12 10 L12 5 L28 5 L28 10" stroke="#111111" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      </g>
      
      {/* Text Group */}
      <g transform="translate(45, 42) rotate(-3)">
        <text 
          x="0" 
          y="0" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="36" 
          fill="#FF3B30"
          letterSpacing="-1"
        >
          YUKTI
        </text>
      </g>
      
      <g transform="translate(35, 78) rotate(-2)">
        <text 
          x="0" 
          y="0" 
          fontFamily="system-ui, -apple-system, sans-serif" 
          fontWeight="900" 
          fontSize="38" 
          fill="#111111"
          letterSpacing="-2"
        >
          CANVAS
        </text>
      </g>

      {/* Scribble Underline */}
      <path d="M110 88 Q 150 82 200 85" stroke="#FF3B30" strokeWidth="3" fill="none" strokeLinecap="round"/>
    </svg>
  );
}
