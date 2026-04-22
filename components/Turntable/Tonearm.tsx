import React, { useState, useCallback } from 'react';
import { REST_ANGLE, START_ANGLE, END_ANGLE } from '../../constants';

interface TonearmProps {
  angle: number;
  isShivering: boolean;
  onDragStart: () => void;
  onDrag: (angle: number) => void;
  onDragEnd: () => void;
  onCueToggle: (isUp: boolean) => void; 
  isCueUp: boolean;
  parentRef: React.RefObject<HTMLDivElement>;
}

const Tonearm: React.FC<TonearmProps> = ({ 
  angle, 
  isShivering, 
  onDragStart, 
  onDrag, 
  onDragEnd, 
  onCueToggle,
  isCueUp,
  parentRef 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  
  const PIVOT_X_PCT = 80;
  const PIVOT_Y_PCT = 30;

  const calculateAngle = useCallback((clientX: number, clientY: number) => {
    if (!parentRef.current) return 0;
    
    const parentRect = parentRef.current.getBoundingClientRect();
    const pivotX = parentRect.left + (parentRect.width * (PIVOT_X_PCT / 100));
    const pivotY = parentRect.top + (parentRect.height * (PIVOT_Y_PCT / 100));

    const dx = clientX - pivotX;
    const dy = clientY - pivotY;

    let theta = Math.atan2(dy, dx) * (180 / Math.PI);
    return theta;
  }, [parentRef]);

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    onDragStart();
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    const newAngle = calculateAngle(e.clientX, e.clientY);
    const clampedAngle = Math.max(REST_ANGLE - 5, Math.min(newAngle, END_ANGLE + 15));
    onDrag(clampedAngle);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragging(false);
    onDragEnd();
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <>
      {/* BASE MECHANISM */}
      <div 
        className="absolute z-20 pointer-events-none"
        style={{ top: `${PIVOT_Y_PCT}%`, left: `${PIVOT_X_PCT}%` }}
      >
           <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-[16cqw] aspect-square rounded-full bg-[#151515] border-[0.2cqw] border-[#222] shadow-[0_1cqw_2cqw_rgba(0,0,0,0.6)]"></div>
           
           <div className="absolute top-[25%] right-[-30%] w-[5cqw] aspect-square rounded-full bg-[#1a1a1a] border border-neutral-700 shadow-lg flex items-center justify-center">
               <div className="w-[80%] h-[80%] rounded-full border border-neutral-600 bg-gradient-to-tr from-neutral-800 to-neutral-700 flex items-center justify-center text-[0.6cqw] text-neutral-400 font-mono">
                  2.5
               </div>
           </div>

           {/* CUE LEVER */}
           <div 
              className="absolute top-[25%] right-[-25%] z-30 pointer-events-auto cursor-pointer group"
              onClick={() => onCueToggle(!isCueUp)}
           >
                <div className="w-[4cqw] aspect-square rounded-full bg-[#111] border border-neutral-700 flex items-center justify-center shadow-md hover:border-neutral-500 transition-colors">
                     <div 
                        className="w-[10%] h-[140%] bg-gradient-to-b from-[#8F7124] to-[#D4AF37] rounded-full origin-bottom transition-transform duration-500 ease-in-out shadow-sm"
                        style={{ transform: isCueUp ? 'rotate(-10deg) translateY(-10%)' : 'rotate(45deg)' }}
                     >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200%] h-[30%] bg-black rounded-full"></div>
                     </div>
                </div>
           </div>
      </div>

      {/* ROTATING TONEARM ASSEMBLY */}
      <div 
        className="absolute z-30 w-[32%] aspect-[32/10] origin-top-left pointer-events-none"
        style={{ 
          top: `${PIVOT_Y_PCT}%`,
          left: `${PIVOT_X_PCT}%`,
          transform: `rotate(${angle}deg)`,
          transition: isDragging ? 'none' : 'transform 1.0s cubic-bezier(0.2, 1.0, 0.5, 1)', 
        }}
      >
        {/* HYDRAULIC LIFT CONTAINER 
            Applies the "Up" physics using Scale + TranslateY + DropShadow
        */}
        <div 
            className={`relative w-full h-full transition-all duration-700 ease-in-out ${isShivering ? 'animate-shiver' : ''}`}
            style={{
                transform: isCueUp ? 'scale(1.05) translateY(-2%)' : 'scale(1.0) translateY(0)',
                filter: isCueUp 
                    ? 'drop-shadow(0 2cqw 1cqw rgba(0,0,0,0.5))' // High lift shadow: blurry, distant
                    : 'drop-shadow(0 0.2cqw 0.2cqw rgba(0,0,0,0.7))' // Grounded shadow: sharp, close
            }}
        >
          
          {/* Main Bearing Housing (Yoke) */}
          <div className="absolute -top-[7.5%] -left-[7.5%] w-[15%] aspect-square rounded-full border-[0.6cqw] border-[#1a1a1a] z-30 border-t-transparent rotate-45"></div>
          <div className="absolute -top-[4.5%] -left-[4.5%] w-[9%] aspect-square rounded-full bg-gradient-to-br from-[#333] to-black border border-neutral-700 z-30 shadow-lg"></div>

          {/* Counterweight */}
          <div className="absolute top-[-1.5%] left-[-26%] w-[25%] h-[32%] z-10">
             <div className="w-full h-full bg-gradient-to-b from-[#2a2a2a] via-[#444] to-[#2a2a2a] rounded-[0.2cqw] border border-neutral-700 shadow-md flex items-center relative">
                 <div className="absolute inset-y-0 left-[20%] w-[1px] bg-black/50"></div>
                 <div className="absolute inset-y-0 left-[25%] w-[1px] bg-black/50"></div>
                 <div className="absolute right-0 top-0 bottom-0 w-[5%] bg-[#8F7124] rounded-r-[0.2cqw]"></div>
             </div>
          </div>

          {/* Brass S-Curve Arm (SVG) */}
          <svg 
              viewBox="0 0 300 100" 
              className="absolute top-[-2.5%] left-[3%] w-full h-full overflow-visible z-20 pointer-events-none"
              preserveAspectRatio="xMinYMid meet"
          >
              <defs>
                  <linearGradient id="brassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8F7124" />
                      <stop offset="40%" stopColor="#D4AF37" />
                      <stop offset="60%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#8F7124" />
                  </linearGradient>
              </defs>
              <path 
                  d="M 0,8 L 112,8 C 152,8 160,25 192,25 L 208,25 C 224,25 232,12 240,12" 
                  fill="none" 
                  stroke="url(#brassGradient)" 
                  strokeWidth="10" 
                  strokeLinecap="butt"
              />
          </svg>

          {/* Headshell - Interactive Drag Handle */}
          <div 
              className="absolute z-30 pointer-events-auto hover:scale-105 transition-transform"
              style={{ 
                  left: '79%', 
                  top: '-3%',
                  width: '20%',
                  height: '24%',
                  transform: 'rotate(-18deg)', 
                  transformOrigin: 'left center',
                  cursor: isDragging ? 'grabbing' : 'grab',
                  touchAction: 'none'
              }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
          >
              <div className="w-full h-full bg-[#111] rounded-[0.1cqw] border border-neutral-700 shadow-xl relative">
                  <div className="absolute right-[-6%] top-[15%] w-[60%] h-[15%] bg-[#222] rounded-full origin-left rotate-[-20deg] shadow-sm border border-neutral-800"></div>
                  <div className="absolute top-[30%] left-[25%] w-[10%] aspect-square rounded-full bg-[#D4AF37] shadow-sm"></div>
                  <div className="absolute top-[30%] left-[50%] w-[10%] aspect-square rounded-full bg-[#D4AF37] shadow-sm"></div>
              </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default Tonearm;