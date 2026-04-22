import React, { useState, useEffect, useCallback, useRef } from 'react';
import { COLORS } from '../../constants';
import { HelpCircle, SkipBack, SkipForward } from 'lucide-react';
import { SoundManager } from '../../services/audio';

interface ControlsProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  isPowerOn: boolean;
  onInteract?: () => void; // Kept for API compatibility, though sounds are now internal
}

export const StartButton: React.FC<ControlsProps> = ({ isPlaying, onTogglePlay, isPowerOn, onInteract }) => {
  return (
    <div className="absolute top-[85%] left-[7%] w-[13%] h-[13%] -translate-y-1/2 z-50">
      {/* LED Indicator - Slightly larger/brighter */}
      <div className="absolute -top-[18%] left-1/2 -translate-x-1/2 w-full flex justify-center">
         <div 
            className="w-[12%] aspect-square rounded-full shadow-[inset_0_0.1cqw_0.2cqw_rgba(0,0,0,0.8)] transition-all duration-300"
            style={{ 
                backgroundColor: isPowerOn && isPlaying ? COLORS.ledOn : '#2a0505',
                boxShadow: isPowerOn && isPlaying ? `0 0 1.5cqw ${COLORS.ledOn}, 0 0 3cqw ${COLORS.ledOn}` : 'inset 0 0.1cqw 0.2cqw rgba(0,0,0,0.8)'
            }}
         ></div>
      </div>

      <button
        onMouseDown={() => {
             SoundManager.play('tactile');
        }}
        onClick={() => {
            if (isPowerOn) {
                onTogglePlay();
                if (onInteract) onInteract();
            }
        }}
        className={`relative w-full h-full rounded-[0.3cqw] flex flex-col items-center justify-center group overflow-hidden transition-transform duration-100 
            ${isPowerOn ? 'cursor-pointer active:translate-y-[2%] active:scale-[0.99]' : 'cursor-not-allowed opacity-80'}
            shadow-[0_0.6cqw_1.2cqw_rgba(0,0,0,0.6),0_0.2cqw_0.4cqw_rgba(0,0,0,0.8)]
        `}
        style={{
            background: 'linear-gradient(145deg, #1a1a1a, #0d0d0d)',
            border: `0.3cqw solid ${COLORS.goldDark}` // Brass Border
        }}
      >
        {/* Button Face Texture */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-30 mix-blend-overlay"></div>
        
        {/* Bevel Highlight */}
        <div className="absolute inset-0 border-t border-white/10 rounded-[0.2cqw] pointer-events-none"></div>

        <span className="text-[1.4cqw] font-mono text-neutral-400 font-bold tracking-widest group-hover:text-amber-500 transition-colors z-10 drop-shadow-md">
            {isPlaying ? 'PAUSE' : 'START'}
        </span>
      </button>
    </div>
  );
};

export const PowerSwitch: React.FC<{ isOn: boolean; onToggle: () => void }> = ({ isOn, onToggle }) => {
    return (
        <div className="absolute top-[55%] left-[7%] z-50 flex flex-col items-center -translate-y-1/2">
            {/* Grand Rotary Switch - Polished Brass & Heavy - Deep Shadow Update */}
            <div 
                className="relative w-[6.5cqw] aspect-square rounded-full flex items-center justify-center cursor-pointer shadow-[0_2cqw_4cqw_rgba(0,0,0,0.9),inset_0_-0.5cqw_1cqw_rgba(0,0,0,0.6)]"
                onMouseDown={() => SoundManager.play('power')}
                onClick={onToggle}
                style={{
                    background: `conic-gradient(from 180deg, ${COLORS.goldDark}, ${COLORS.gold} 40%, ${COLORS.goldDark} 80%, ${COLORS.gold})`,
                    transform: isOn ? 'rotate(90deg)' : 'rotate(0deg)',
                    border: '0.1cqw solid #3E2F12',
                    // STIFF SPRING PHYSICS:
                    // Custom Bezier: Starts very slow (resistance), snaps at end (release)
                    transition: 'transform 0.4s cubic-bezier(0.7, 0, 0.2, 1)'
                }}
            >
                {/* Metallic Top Face - Enhanced Specular Gradient */}
                <div className="absolute inset-[5%] rounded-full bg-gradient-to-br from-[#fbf5b7] via-[#bf953f] to-[#aa771c] shadow-inner"></div>
                
                {/* The "Grip" / Toggle Bar */}
                <div className="absolute w-[20%] h-[120%] bg-[#111] rounded-[0.2cqw] shadow-[0_0.2cqw_0.5cqw_rgba(0,0,0,0.8)] border-x border-neutral-700 flex flex-col justify-between py-[10%]">
                    <div className="w-full h-[2px] bg-neutral-600"></div>
                    <div className="w-full h-[2px] bg-neutral-600"></div>
                    <div className="w-full h-[2px] bg-neutral-600"></div>
                </div>

                {/* Indicator Dot */}
                <div className={`absolute top-[10%] w-[15%] aspect-square rounded-full shadow-[inset_0_0_2px_rgba(0,0,0,0.8)] transition-all duration-500 ${isOn ? 'bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]' : 'bg-[#330000]'}`}></div>
            </div>

            {/* Labels - Below */}
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-[1.2cqw] text-[0.8cqw] text-neutral-400 font-mono tracking-widest whitespace-nowrap flex gap-[2cqw] bg-black/40 px-2 rounded-full backdrop-blur-sm border border-white/5">
                <span className={!isOn ? 'text-amber-500 font-bold' : 'opacity-50'}>OFF</span>
                <span className={isOn ? 'text-red-500 font-bold text-shadow-glow' : 'opacity-50'}>POWER</span>
            </div>
        </div>
    );
};

interface SpeedSelectorProps {
    currentRpm: 33 | 45;
    onSetRpm: (rpm: 33 | 45) => void;
    isPowerOn: boolean;
}

export const SpeedSelector: React.FC<SpeedSelectorProps> = ({ currentRpm, onSetRpm, isPowerOn }) => {
    return (
        <div className="absolute top-[85%] left-[22%] -translate-y-1/2 flex gap-[1cqw] z-50">
            {[33, 45].map((speed) => (
                <button 
                    key={speed}
                    onClick={(e) => {
                        e.stopPropagation();
                        SoundManager.play('tactile');
                        if(isPowerOn) onSetRpm(speed as 33 | 45);
                    }}
                    className={`w-[4.5cqw] aspect-[5/4] rounded-[0.3cqw] bg-[#1a1a1a] border border-black shadow-[0_0.2cqw_0.4cqw_rgba(0,0,0,0.5)] flex items-center justify-center active:translate-y-[2%] transition-all ${isPowerOn ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'} ${currentRpm === speed && isPowerOn ? 'ring-[0.1cqw] ring-red-900/50 bg-[#220a0a]' : ''}`}
                >
                    <span className={`text-[1.2cqw] font-mono ${currentRpm === speed && isPowerOn ? 'text-red-500 shadow-[0_0_0.5cqw_rgba(255,0,0,0.2)]' : 'text-neutral-600'}`}>{speed}</span>
                </button>
            ))}
        </div>
    );
};

export const NavigationCluster: React.FC<{ onSkip: (dir: 1 | -1) => void; isPowerOn: boolean; onInteract?: () => void }> = ({ onSkip, isPowerOn, onInteract }) => {
    const handleClick = (dir: 1 | -1) => {
        if (isPowerOn) {
            onSkip(dir);
            if(onInteract) onInteract();
        }
    }
    return (
        <div className="absolute bottom-[4%] left-[28%] z-50 flex gap-[1.5cqw]">
             <button
                onMouseDown={() => SoundManager.play('tactile')}
                onClick={() => handleClick(-1)}
                className={`w-[6cqw] h-[2.5cqw] bg-gradient-to-b from-[#e5e5e5] to-[#999] rounded-[0.2cqw] shadow-[0_0.3cqw_0.5cqw_rgba(0,0,0,0.6)] border border-neutral-400 flex items-center justify-center active:translate-y-[2px] active:shadow-none transition-transform ${isPowerOn ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-50 grayscale'}`}
             >
                <SkipBack className="w-[1.2cqw] text-neutral-800 fill-current" />
             </button>
             <button
                onMouseDown={() => SoundManager.play('tactile')}
                onClick={() => handleClick(1)}
                className={`w-[6cqw] h-[2.5cqw] bg-gradient-to-b from-[#e5e5e5] to-[#999] rounded-[0.2cqw] shadow-[0_0.3cqw_0.5cqw_rgba(0,0,0,0.6)] border border-neutral-400 flex items-center justify-center active:translate-y-[2px] active:shadow-none transition-transform ${isPowerOn ? 'cursor-pointer hover:brightness-110' : 'cursor-not-allowed opacity-50 grayscale'}`}
             >
                <SkipForward className="w-[1.2cqw] text-neutral-800 fill-current" />
             </button>
        </div>
    )
}

export const StrobeLight: React.FC<{ isPlaying: boolean; isPowerOn: boolean; isAdminMode?: boolean }> = ({ isPlaying, isPowerOn, isAdminMode }) => {
    return (
        <div className="absolute top-[15%] left-[6%] -translate-y-1/2 w-[8%] aspect-square z-10">
            <div className="w-full h-full rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 border border-neutral-600 shadow-[0_0.5cqw_1cqw_rgba(0,0,0,0.6)] flex items-center justify-center">
                <div className="w-[60%] h-[60%] bg-black rounded-full flex items-center justify-center border border-neutral-700 relative overflow-hidden">
                     {/* Normal LED */}
                     <div className={`absolute top-0 right-0 w-full h-full bg-red-600 blur-md mix-blend-screen transition-opacity duration-100 ${isPowerOn && !isAdminMode ? 'opacity-80' : 'opacity-0'}`}></div>
                     
                     {/* Admin Breathing LED (Blue/Cyan override or just different pulse) */}
                     {isAdminMode && (
                        <div className="absolute top-0 right-0 w-full h-full bg-orange-500 blur-md mix-blend-screen animate-pulse opacity-80"></div>
                     )}

                     <div className={`relative w-[20%] h-[20%] rounded-full z-10 ${isPowerOn ? 'bg-red-500' : isAdminMode ? 'bg-orange-400' : 'bg-red-900'}`}></div>
                </div>
            </div>
            {/* Glow */}
            <div className={`absolute top-1/2 left-full w-[100%] h-[100%] -translate-y-1/2 blur-xl rounded-full pointer-events-none transition-opacity duration-100 ${isPowerOn ? 'bg-red-500/20 opacity-100' : isAdminMode ? 'bg-orange-500/20 opacity-80 animate-pulse' : 'opacity-0'}`}></div>
        </div>
    )
}

interface PitchSliderProps {
    value: number;
    onChange: (val: number) => void;
    isPowerOn?: boolean;
    onAdminTrigger?: () => void;
}

export const PitchSlider: React.FC<PitchSliderProps> = ({ value, onChange, isPowerOn, onAdminTrigger }) => {
    const isLocked = value === 0;
    
    // --- ADMIN TRIGGER LOGIC ---
    const [holdTimer, setHoldTimer] = useState<number | null>(null);
    const [tickInterval, setTickInterval] = useState<number | null>(null);
    const [isPulsing, setIsPulsing] = useState(false);
    const holdStartTime = useRef<number>(0);

    const handlePressStart = useCallback((e: React.SyntheticEvent) => {
        // Condition: Power must be OFF to trigger admin flow
        if (isPowerOn) return;
        
        e.stopPropagation();
        
        holdStartTime.current = Date.now();
        
        // 3s Warning Timer
        const pulseTimer = window.setTimeout(() => {
            setIsPulsing(true);
            
            // Start Ticking Every Second
            const tick = window.setInterval(() => {
                 SoundManager.play('tick', 0.8);
            }, 1000);
            setTickInterval(tick);

        }, 3000);

        // 10s Trigger Timer
        const triggerTimer = window.setTimeout(() => {
            if (onAdminTrigger) {
                SoundManager.play('unlock'); // Success
                onAdminTrigger();
            }
            setIsPulsing(false);
            if (tickInterval) clearInterval(tickInterval);
        }, 10000);

        setHoldTimer(triggerTimer);

        // Cleanup function for the pulsing visual if released early
        return () => {
            clearTimeout(pulseTimer);
        };

    }, [isPowerOn, onAdminTrigger, tickInterval]);

    const handlePressEnd = useCallback(() => {
        if (holdTimer) {
            clearTimeout(holdTimer);
            setHoldTimer(null);
        }
        if (tickInterval) {
            clearInterval(tickInterval);
            setTickInterval(null);
        }
        setIsPulsing(false);
        holdStartTime.current = 0;
        
        onChange(0);

    }, [holdTimer, onChange, tickInterval]);

    return (
        <>
            {/* The Track */}
            <div className="absolute right-[8%] top-[65%] -translate-y-1/2 w-[5%] h-[40%] bg-[#121212] rounded-[0.2cqw] border-[0.2cqw] border-neutral-800 shadow-[inset_0_0.2cqw_0.4cqw_rgba(0,0,0,0.9)] flex flex-col items-center py-[2cqw] z-50">
                
                <input 
                    type="range"
                    min="-8"
                    max="8"
                    step="0.1"
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ns-resize z-50"
                    style={{ appearance: 'slider-vertical' }} 
                />

                <div className="absolute top-[10%] right-[140%] text-[0.6cqw] text-neutral-600 font-mono text-right leading-loose select-none flex flex-col justify-between h-[80%]">
                    <div>+8</div>
                    <div className="text-neutral-400">0</div>
                    <div>-8</div>
                </div>

                <div className="w-[10%] h-full bg-black rounded-full relative shadow-[inset_0_0.1cqw_0.3cqw_rgba(0,0,0,1)]">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-neutral-700/30"></div>
                    <div className={`absolute left-1/2 -translate-x-1/2 w-[300%] aspect-[2/3] rounded-[0.1cqw] shadow-xl flex items-center justify-center group z-20 pointer-events-none transition-all duration-300 ${isLocked ? 'grayscale opacity-70' : ''}`}
                        style={{
                            top: `${50 - (value * 5)}%`, 
                            background: `linear-gradient(to bottom, ${COLORS.goldDark}, ${COLORS.gold} 20%, ${COLORS.goldDark})`,
                            border: '0.1cqw solid #634d1b',
                            transform: 'translate(-50%, -50%)'
                        }}
                    >
                        <div className="w-full h-[0.1cqw] bg-black/40"></div>
                    </div>
                </div>
                
                <div className={`absolute top-1/2 right-[-20%] w-[15%] aspect-square rounded-full -translate-y-1/2 shadow-[inset_0_0_1px_rgba(0,0,0,1)] transition-colors duration-200 ${isLocked ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-green-900'}`}></div>
            </div>

            {/* QUARTZ LOCK - Updated with Long Press Logic */}
            <div className="absolute right-[3%] top-[30%] z-50 flex flex-col items-center">
                <button 
                    onMouseDown={(e) => {
                         SoundManager.play('tactile');
                         handlePressStart(e);
                    }}
                    onMouseUp={handlePressEnd}
                    onMouseLeave={handlePressEnd}
                    onTouchStart={handlePressStart}
                    onTouchEnd={handlePressEnd}
                    
                    className="w-[5.25cqw] aspect-square rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0d0d0d] border border-neutral-700 shadow-[0_0.2cqw_0.4cqw_rgba(0,0,0,0.8),inset_0_0.1cqw_0.1cqw_rgba(255,255,255,0.1)] flex items-center justify-center cursor-pointer active:scale-95 group transition-transform select-none"
                    title="Quartz Lock / Pitch Reset"
                >
                    {/* Inner dot with conditional Admin Pulse */}
                    <div className={`
                        w-[1.2cqw] aspect-square rounded-full shadow-[inset_0_0_1px_rgba(0,0,0,0.5)] transition-all duration-300
                        ${isPulsing ? 'bg-amber-500 animate-ping' : isLocked ? 'bg-green-500 shadow-[0_0_4px_#22c55e]' : 'bg-green-900'}
                    `}></div>
                </button>
                <span className="mt-[0.5cqw] text-[0.7cqw] text-neutral-500 font-mono tracking-widest">RESET</span>
            </div>
        </>
    )
}

interface RotaryKnobProps {
    value: number; // 0 to 1
    onChange: (value: number) => void;
    label: string;
    indicatorColor?: string;
    onInteract?: () => void;
    labelPosition?: 'top' | 'bottom';
}

export const RotaryKnob: React.FC<RotaryKnobProps> = ({ 
    value, 
    onChange, 
    label, 
    indicatorColor = '#22d3ee', 
    onInteract, 
    labelPosition = 'top' 
}) => {
    const [isDragging, setIsDragging] = useState(false);
    const [startY, setStartY] = useState(0);
    const [startValue, setStartValue] = useState(0);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setStartY(e.clientY);
        setStartValue(value);
        document.body.style.cursor = 'ns-resize';
        SoundManager.play('knob', 0.2); // Trigger on touch
        if(onInteract) onInteract();
    };

    const handleMouseMove = useCallback((e: MouseEvent) => {
        if (!isDragging) return;
        const deltaY = startY - e.clientY; 
        const sensitivity = 0.005;
        const newValue = Math.min(1, Math.max(0, startValue + (deltaY * sensitivity)));
        onChange(newValue);
    }, [isDragging, startY, startValue, onChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
        document.body.style.cursor = 'default';
    }, []);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        }
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, handleMouseMove, handleMouseUp]);

    const rotation = -135 + (value * 270);

    return (
        <div className="flex flex-col items-center gap-[0.5cqw] select-none z-50">
            {/* Conditional Label Position: Top */}
            {labelPosition === 'top' && (
                <span className="text-[0.7cqw] text-neutral-300 font-bold font-sans tracking-widest uppercase mb-[0.2cqw] drop-shadow-md">{label}</span>
            )}
            
            <div 
                className="relative w-full aspect-square rounded-full shadow-[0_1cqw_2cqw_rgba(0,0,0,0.8),inset_0_0.2cqw_0.5cqw_rgba(255,255,255,0.2)] cursor-ns-resize"
                style={{
                    background: 'conic-gradient(from 0deg, #111, #333 45%, #111 90%, #222)',
                    border: '0.15cqw solid #444'
                }}
                onMouseDown={handleMouseDown}
            >
                {/* Knurled Pattern Effect */}
                <div className="absolute inset-0 rounded-full opacity-50" 
                     style={{ 
                         background: 'repeating-conic-gradient(#000 0deg, #000 2deg, transparent 2deg, transparent 4deg)' 
                     }}>
                </div>

                {/* Top Cap with Inner Reflection */}
                <div className="absolute inset-[10%] rounded-full bg-gradient-to-br from-[#2a2a2a] to-[#050505] shadow-[inset_0_1px_1px_rgba(255,255,255,0.1),0_2px_4px_rgba(0,0,0,0.5)] border border-neutral-900 flex items-center justify-center"
                     style={{ transform: `rotate(${rotation}deg)` }}
                >
                    {/* Ring Reflection */}
                    <div className="absolute inset-[10%] rounded-full border border-white/5 opacity-50"></div>

                    {/* Indicator Line / Notch */}
                    <div className="absolute top-[5%] w-[8%] h-[35%] rounded-full shadow-[0_0_4px_rgba(34,211,238,0.5)]"
                         style={{ backgroundColor: indicatorColor }}
                    ></div>
                </div>
            </div>

            {/* Conditional Label Position: Bottom */}
            {labelPosition === 'bottom' && (
                <span className="text-[0.7cqw] text-neutral-300 font-bold font-sans tracking-widest uppercase mt-[0.2cqw] drop-shadow-md">{label}</span>
            )}
        </div>
    );
};


export const HelpButton: React.FC<{ active: boolean; onToggle: () => void }> = ({ active, onToggle }) => (
    <button
        onClick={onToggle}
        className={`absolute bottom-[3%] right-[3%] z-[110] w-[3cqw] aspect-square rounded-full border border-yellow-600/30 flex items-center justify-center transition-all duration-300 ${active ? 'bg-yellow-900/40 text-yellow-400' : 'bg-[#1a1a1a] text-neutral-600 hover:text-yellow-600'}`}
    >
        <HelpCircle className="w-[50%]" />
    </button>
)

export const HintOverlay: React.FC = () => (
    <div className="absolute inset-0 z-[100] pointer-events-none font-mono text-white/90 text-[0.8cqw] tracking-widest font-bold shadow-drop">
       <svg className="absolute inset-0 w-full h-full drop-shadow-md">
          <defs>
            <marker id="dot" markerWidth="6" markerHeight="6" refX="3" refY="3">
              <circle cx="3" cy="3" r="2" fill="white" />
            </marker>
          </defs>
          
          {/* Start/Pause */}
          <line x1="13%" y1="85%" x2="13%" y2="76%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="13%" y="75%" textAnchor="middle" fill="white">PLATTER ENGAGEMENT</text>
          
          {/* Power Switch - NEW POSITION */}
          <line x1="12%" y1="55%" x2="16%" y2="55%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="17%" y="55.5%" textAnchor="start" fill="white">SYSTEM POWER (RESETS TRACK)</text>
          
          {/* Navigation */}
          <line x1="30%" y1="92%" x2="30%" y2="88%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="30%" y="87%" textAnchor="middle" fill="white">GROOVE NAVIGATION</text>
  
          {/* 33/45 */}
          <line x1="28%" y1="85%" x2="28%" y2="78%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="28%" y="77%" textAnchor="middle" fill="white">SPEED SELECTORS</text>
  
          {/* Strobe */}
          <line x1="11%" y1="15%" x2="18%" y2="15%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="19%" y="15.5%" textAnchor="start" fill="white">TIMING REFERENCE</text>
  
          {/* Tone Arm */}
          <line x1="80%" y1="30%" x2="80%" y2="20%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="80%" y="19%" textAnchor="middle" fill="white">PIVOT ASSEMBLY</text>
  
          {/* Cue Lever */}
          <line x1="91%" y1="35%" x2="95%" y2="35%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="96%" y="35.5%" textAnchor="start" fill="white">HYDRAULIC LIFT</text>
  
          {/* Pitch Slider */}
          <line x1="90%" y1="65%" x2="85%" y2="65%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="84%" y="65.5%" textAnchor="end" fill="white">TEMPO ADJUSTMENT</text>
          
          {/* Quartz - UPDATED LABEL */}
          <line x1="95%" y1="35%" x2="92%" y2="35%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="91%" y="35.5%" textAnchor="end" fill="white">QUARTZ LOCK: RESETS PITCH & TEMPO</text>
          
          {/* Master Volume - UPDATED POSITION (Centered Gutter Left) */}
          <line x1="79%" y1="88%" x2="79%" y2="88%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="79%" y="88.5%" textAnchor="end" fill="white">MASTER OUTPUT</text>

          {/* Vintage Knob - UPDATED POSITION (Centered Gutter Right) */}
          <line x1="88%" y1="88%" x2="88%" y2="88%" stroke="white" strokeWidth="1" markerStart="url(#dot)" />
          <text x="88%" y="88.5%" textAnchor="start" fill="white">SURFACE NOISE</text>
       </svg>
    </div>
  )
