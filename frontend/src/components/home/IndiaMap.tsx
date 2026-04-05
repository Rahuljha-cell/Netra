'use client';

import { useEffect, useState } from 'react';

interface IncidentDot {
  cx: number;
  cy: number;
  color: string;
  size: number;
  pulse?: boolean;
}

// Approximate SVG coordinates for Indian cities mapped to a simplified India outline
const INCIDENT_DOTS: IncidentDot[] = [
  // Mumbai region
  { cx: 175, cy: 340, color: '#E53935', size: 6, pulse: true },
  { cx: 170, cy: 335, color: '#E53935', size: 4 },
  { cx: 180, cy: 345, color: '#7B1FA2', size: 3 },
  // Delhi NCR
  { cx: 220, cy: 155, color: '#7B1FA2', size: 7, pulse: true },
  { cx: 225, cy: 150, color: '#E53935', size: 4 },
  { cx: 215, cy: 160, color: '#1565C0', size: 3 },
  { cx: 230, cy: 155, color: '#7B1FA2', size: 3 },
  // Bangalore
  { cx: 210, cy: 405, color: '#1565C0', size: 5, pulse: true },
  { cx: 215, cy: 410, color: '#E53935', size: 3 },
  // Chennai
  { cx: 245, cy: 395, color: '#1565C0', size: 5 },
  { cx: 250, cy: 400, color: '#7B1FA2', size: 3 },
  // Kolkata
  { cx: 320, cy: 260, color: '#E53935', size: 5 },
  { cx: 315, cy: 255, color: '#2E7D32', size: 4 },
  // Hyderabad
  { cx: 225, cy: 355, color: '#1565C0', size: 5, pulse: true },
  { cx: 230, cy: 350, color: '#7B1FA2', size: 3 },
  // Jaipur
  { cx: 195, cy: 185, color: '#7B1FA2', size: 4 },
  { cx: 200, cy: 180, color: '#E53935', size: 3 },
  // Lucknow
  { cx: 260, cy: 190, color: '#E53935', size: 4 },
  // Kerala (Wayanad, Thiruvananthapuram)
  { cx: 200, cy: 445, color: '#2E7D32', size: 5, pulse: true },
  { cx: 195, cy: 455, color: '#2E7D32', size: 4 },
  // Shimla
  { cx: 215, cy: 125, color: '#E53935', size: 4 },
  // Gujarat (Ahmedabad)
  { cx: 165, cy: 245, color: '#1565C0', size: 4 },
  // Pune
  { cx: 185, cy: 350, color: '#1565C0', size: 4 },
  // Darjeeling
  { cx: 310, cy: 220, color: '#2E7D32', size: 4 },
  // Gurugram
  { cx: 218, cy: 158, color: '#1565C0', size: 3 },
  // Assam
  { cx: 365, cy: 210, color: '#2E7D32', size: 4 },
  { cx: 370, cy: 215, color: '#E53935', size: 3 },
  // Bhopal
  { cx: 220, cy: 270, color: '#7B1FA2', size: 3 },
  // Patna
  { cx: 290, cy: 215, color: '#E53935', size: 3 },
  // Nagpur
  { cx: 225, cy: 300, color: '#1565C0', size: 3 },
  // Coimbatore
  { cx: 210, cy: 425, color: '#E53935', size: 3 },
  // Varanasi
  { cx: 270, cy: 210, color: '#7B1FA2', size: 3 },
  // Indore
  { cx: 200, cy: 265, color: '#1565C0', size: 3 },
  // Chandigarh
  { cx: 215, cy: 130, color: '#E53935', size: 3 },
];

export default function IndiaMap() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative w-full max-w-lg mx-auto">
      {/* Heatmap glow background */}
      <svg viewBox="0 0 500 550" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Heatmap radial gradients for high-density areas */}
          <radialGradient id="heat1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#E53935" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#E53935" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#7B1FA2" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#7B1FA2" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="heat3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1565C0" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1565C0" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Simplified India outline */}
        <path
          d="M215,60 L230,55 L245,65 L260,58 L270,65 L285,60 L300,70 L310,65 L320,75
             L335,80 L350,90 L365,100 L375,115 L380,130 L385,150 L390,170
             L385,185 L375,195 L370,210 L365,225 L355,235
             L345,245 L335,255 L325,265 L320,275 L315,285
             L310,295 L305,305 L295,310 L285,315
             L275,325 L270,340 L265,355 L260,370
             L255,380 L250,390 L245,400 L240,410
             L235,420 L225,435 L215,445 L210,455
             L205,460 L200,455 L195,445 L190,430
             L185,415 L180,400 L175,385 L170,370
             L165,355 L160,340 L155,325 L152,310
             L150,295 L148,280 L145,265 L142,250
             L140,235 L138,220 L140,205 L145,190
             L150,175 L155,160 L160,150 L168,140
             L175,130 L180,120 L185,110 L190,100
             L195,90 L200,80 L205,70 L215,60 Z"
          fill="#F8F9FA"
          stroke="#E0E0E0"
          strokeWidth="2"
        />

        {/* Kashmir region */}
        <path
          d="M185,110 L180,95 L175,80 L180,70 L190,60 L200,55 L210,50 L215,60 L205,70 L200,80 L195,90 L190,100 L185,110 Z"
          fill="#F8F9FA"
          stroke="#E0E0E0"
          strokeWidth="2"
        />

        {/* Northeast India */}
        <path
          d="M335,255 L345,245 L355,235 L365,225 L370,210 L375,195 L385,185
             L390,190 L395,200 L390,210 L385,220 L380,225
             L375,230 L370,235 L365,240 L360,245 L355,248
             L350,250 L345,255 L340,258 L335,255 Z"
          fill="#F8F9FA"
          stroke="#E0E0E0"
          strokeWidth="2"
        />

        {/* Heatmap zones for major cities */}
        <circle cx="220" cy="155" r="40" fill="url(#heat2)" /> {/* Delhi */}
        <circle cx="175" cy="340" r="35" fill="url(#heat1)" /> {/* Mumbai */}
        <circle cx="210" cy="405" r="30" fill="url(#heat3)" /> {/* Bangalore */}
        <circle cx="245" cy="395" r="25" fill="url(#heat3)" /> {/* Chennai */}
        <circle cx="320" cy="260" r="25" fill="url(#heat1)" /> {/* Kolkata */}
        <circle cx="200" cy="445" r="25" fill="url(#heat1)" /> {/* Kerala */}

        {/* Incident dots */}
        {INCIDENT_DOTS.map((dot, i) => (
          <g key={i}>
            {dot.pulse && mounted && (
              <circle
                cx={dot.cx}
                cy={dot.cy}
                r={dot.size + 4}
                fill="none"
                stroke={dot.color}
                strokeWidth="1.5"
                opacity="0.4"
              >
                <animate attributeName="r" from={dot.size} to={dot.size + 12} dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="2s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size}
              fill={dot.color}
              opacity="0.85"
              filter="url(#glow)"
            />
            <circle
              cx={dot.cx}
              cy={dot.cy}
              r={dot.size * 0.4}
              fill="white"
              opacity="0.6"
            />
          </g>
        ))}

        {/* City labels for major cities */}
        <text x="220" y="145" textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">Delhi</text>
        <text x="175" y="328" textAnchor="middle" fontSize="10" fontWeight="600" fill="#374151">Mumbai</text>
        <text x="210" y="398" textAnchor="middle" fontSize="9" fontWeight="600" fill="#374151">Bengaluru</text>
        <text x="320" y="250" textAnchor="middle" fontSize="9" fontWeight="600" fill="#374151">Kolkata</text>
        <text x="260" y="390" textAnchor="middle" fontSize="9" fontWeight="600" fill="#374151">Chennai</text>
        <text x="240" y="350" textAnchor="middle" fontSize="9" fontWeight="600" fill="#374151">Hyderabad</text>
      </svg>
    </div>
  );
}
