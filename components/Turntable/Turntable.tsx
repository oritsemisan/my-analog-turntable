import React, { useState, useEffect, useRef } from 'react';
import { PlayState, Album } from '../../types';
import { COLORS, START_ANGLE, END_ANGLE, REST_ANGLE } from '../../constants';
import Platter from './Platter';
import Tonearm from './Tonearm';
import { StartButton, SpeedSelector, StrobeLight, PitchSlider, HelpButton, HintOverlay, RotaryKnob, PowerSwitch, NavigationCluster } from './Controls';
import { SoundManager } from '../../services/audio';

interface TurntableProps {
  currentAlbum: Album | null;
  onTrackEnd: () => void;
  activeTrackIndex: number; 
  onTrackChange: (index: React.SetStateAction<number>) => void;
  isPowerOn: boolean;
  setIsPowerOn: (on: boolean) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  onAdminTrigger: () => void;
  isAdminMode?: boolean;
}

const Turntable: React.FC<TurntableProps> = ({ 
    currentAlbum, 
    onTrackEnd, 
    activeTrackIndex, 
    onTrackChange,
    isPowerOn,
    setIsPowerOn,
    isPlaying,
    setIsPlaying,
    onAdminTrigger,
    isAdminMode
}) => {
  const [rotation, setRotation] = useState(0);
  const [armAngle, setArmAngle] = useState(REST_ANGLE);
  const [isCueUp, setIsCueUp] = useState(true); // Default to UP (Safe)
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  // Hardware State
  const [rpm, setRpm] = useState<33 | 45>(33);
  const [pitch, setPitch] = useState(0); // -8 to 8
  const [showHints, setShowHints] = useState(false);
  const [masterVolume, setMasterVolume] = useState(1.0);
  const [vintageLevel, setVintageLevel] = useState(0.25);
  
  // Transition State Management
  const [displayAlbum, setDisplayAlbum] = useState<Album | null>(currentAlbum);
  const [platterSlideState, setPlatterSlideState] = useState<'center' | 'left' | 'right'>('center');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Ref to prevent multiple end-of-record triggers
  const isReturningRef = useRef(false);

  // Mouse position for lighting effects
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animationRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Web Audio Context Refs (For Filters)
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  
  // Track previous subtrack to prevent re-running effect on unrelated renders
  const prevTrackIndexRef = useRef(activeTrackIndex);

  // Helper: Safe Play
  const safePlay = async (audio: HTMLAudioElement) => {
      try {
          const playPromise = audio.play();
          if (playPromise !== undefined) {
              await playPromise;
          }
      } catch (error: any) {
          if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
             console.warn('Audio Playback Error:', error);
          }
      }
  };

  // Handle Mouse Move for Specular Highlights
  const handleMouseMove = (e: React.MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      setMousePos({ x, y });
  };

  // --- WEB AUDIO INIT (Low Pass Filter) ---
  useEffect(() => {
    // Only initialize if we have the element and haven't set up context yet
    if (audioRef.current && !audioCtxRef.current) {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const ctx = new AudioContextClass();
            
            // Create Nodes
            const source = ctx.createMediaElementSource(audioRef.current);
            const filter = ctx.createBiquadFilter();
            
            // Filter Config (Low Pass)
            filter.type = 'lowpass';
            filter.frequency.value = 24000; // Start Open (Clear)
            filter.Q.value = 0.7; // Standard Butterworth

            // Connect Graph: Source -> Filter -> Destination
            source.connect(filter);
            filter.connect(ctx.destination);
            
            audioCtxRef.current = ctx;
            filterRef.current = filter;
        } catch (e) {
            console.warn("Web Audio API not supported or blocked", e);
        }
    }
  }, []);

  // --- FILTER & VINTAGE LOGIC ---
  useEffect(() => {
      // 1. Apply Filter Frequency based on Vintage Knob
      if (filterRef.current && audioCtxRef.current) {
           // Map 0-1 to Frequency Range (24000Hz -> 2000Hz)
           // More vintage = Lower cutoff (muffled)
           const minFreq = 2000;
           const maxFreq = 24000;
           const targetFreq = maxFreq - (vintageLevel * (maxFreq - minFreq));
           
           const now = audioCtxRef.current.currentTime;
           // Smooth ramp to prevent clicking
           filterRef.current.frequency.setTargetAtTime(targetFreq, now, 0.1);
      }
      
      // 2. Control Crackle Loop Volume
      // Logic: Only audible if spinning + power on + not transitioning
      if (isPowerOn && isPlaying && !isTransitioning) {
          SoundManager.startLoop('crackle');
          // Map vintageLevel to Gain (0.0 to 0.4 max volume)
          SoundManager.setVolume('crackle', vintageLevel * masterVolume * 0.4);
      } else {
          SoundManager.stopLoop('crackle');
      }
      
      // 3. Motor Hum Logic
      if (isPowerOn && isPlaying) {
          SoundManager.fadeInLoop('hum', 0.15);
      } else {
          SoundManager.fadeOutLoop('hum');
      }

  }, [vintageLevel, masterVolume, isPowerOn, isPlaying, isTransitioning]);

  // --- CONTEXT RESUME ON POWER ---
  useEffect(() => {
      if (isPowerOn && audioCtxRef.current?.state === 'suspended') {
          audioCtxRef.current.resume().catch(e => console.warn("Context resume failed", e));
      }
  }, [isPowerOn]);


  // --- POWER SWITCH LOGIC ---
  useEffect(() => {
    if (!isPowerOn) {
        setIsPlaying(false); // Stop Motor
        
        // RESET PROTOCOL: Reset Index to 0 (Start of Album)
        onTrackChange(0);
        
        // Reset Audio Progress
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
        }

        // Auto-Return Arm Homing Animation (Kinematic Return)
        if (Math.abs(armAngle - REST_ANGLE) > 2) {
             setIsCueUp(true); // Lift
             // Play return sound
             SoundManager.play('armCreak', 0.2);
             
             const returnTimer = setTimeout(() => {
                 setArmAngle(REST_ANGLE); // Swing Home
             }, 300);
             return () => clearTimeout(returnTimer);
        }
    }
  }, [isPowerOn, armAngle, onTrackChange, setIsPlaying]);
  
  // --- SUB-TRACK NAVIGATION (Quick Sweep) ---
  useEffect(() => {
    const hasIndexChanged = activeTrackIndex !== prevTrackIndexRef.current;
    prevTrackIndexRef.current = activeTrackIndex;

    // 1. Power Check
    if (!isPowerOn) return;

    // 2. Prevent interference during Album Swap
    if (isTransitioning) return;
    
    // 3. Only run logic if the index ACTUALLY changed (prevents loops)
    if (!hasIndexChanged) return;

    if (activeTrackIndex >= 0 && currentAlbum?.tracklist) {
        // Calculate groove coordinate based on FILE COUNT
        const totalTracks = currentAlbum.tracklist.length;
        // Map index to angle range (Start to End)
        // We leave a bit of buffer at the start/end
        const grooveSpan = END_ANGLE - START_ANGLE;
        const segment = grooveSpan / totalTracks;
        
        // The "Groove Coordinate" with CALIBRATION OFFSET
        const calibration = currentAlbum.calibrationOffset || 0;
        const targetAngle = START_ANGLE + (segment * activeTrackIndex) + (segment * 0.1) + calibration;

        // Trigger "Quick Sweep"
        // 1. Lift Arm
        setIsCueUp(true);
        SoundManager.play('armCreak', 0.2);
        
        // 2. Move (timeout to allow lift visual)
        setTimeout(() => {
            setArmAngle(targetAngle);
            // 3. Drop (timeout to allow move) - Only if playing!
            if (isPowerOn && isPlaying && !isTransitioning) {
                 setTimeout(() => {
                     setIsCueUp(false);
                 }, 400);
            }
        }, 300);
        
        // Update Audio Time
        if (audioRef.current && currentAlbum.duration) {
             const timeSegment = currentAlbum.duration / totalTracks;
             const targetTime = timeSegment * activeTrackIndex;
             // Check delta to avoid jitter / feedback loop from animation frame
             if (Math.abs(audioRef.current.currentTime - targetTime) > 2) {
                 audioRef.current.currentTime = targetTime;
             }
        }
    }
  }, [activeTrackIndex, currentAlbum, isPowerOn, isPlaying, isTransitioning]);

  const handleSkip = (dir: 1 | -1) => {
      if (!currentAlbum?.tracklist) return;
      onTrackChange(prev => {
          const next = prev + dir;
          return Math.max(0, Math.min(next, currentAlbum.tracklist!.length - 1));
      });
  };

  // --- ALBUM SWAP SEQUENCE (Mechanical Audio Ingest) ---
  useEffect(() => {
    if (currentAlbum?.id !== displayAlbum?.id) {
        setIsTransitioning(true);
        
        // Step 1: Retract Arm
        setArmAngle(REST_ANGLE);
        setIsCueUp(true);

        // Step 2: Slide Out Old Disc
        const ejectTimer = setTimeout(() => {
            setPlatterSlideState('left');
            SoundManager.play('traySlide'); // SOUND: Motor Whir
            setTimeout(() => SoundManager.play('latch', 0.3), 100); // SOUND: Disengage
        }, 400);

        // Step 3: Load Asset & Swap
        const swapTimer = setTimeout(() => {
            // Start loading new image
            const img = new Image();
            img.src = currentAlbum?.coverArt || '';
            
            img.onload = () => {
                // Only proceed once loaded
                setDisplayAlbum(currentAlbum);
                SoundManager.play('latch', 0.5); // SOUND: Disc Drop
                setPlatterSlideState('right'); // Teleport hidden
                setAudioUrl(currentAlbum?.audioUrl || null);
                
                // Explicitly Reset Audio
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                }
                
                // Step 4: Slide In New Disc (Short delay after render)
                setTimeout(() => {
                    setPlatterSlideState('center');
                    SoundManager.play('traySlide'); // SOUND: Motor Whir In
                    
                    // Step 5: Finish
                    setTimeout(() => {
                        setIsTransitioning(false);
                        SoundManager.play('power', 0.3); // SOUND: Spindle Lock (Heavy Click)
                        if (isPowerOn && isPlaying) {
                             setArmAngle(START_ANGLE);
                             setIsCueUp(false);
                        }
                    }, 500);
                }, 50);
            };
            img.onerror = () => {
                 // Fallback if image fails (Drive link expired etc)
                 setDisplayAlbum(currentAlbum);
                 setPlatterSlideState('right');
                 setAudioUrl(currentAlbum?.audioUrl || null);
                 setTimeout(() => {
                     setPlatterSlideState('center');
                     setTimeout(() => setIsTransitioning(false), 500);
                 }, 50);
            }
        }, 900);

        return () => {
            clearTimeout(ejectTimer);
            clearTimeout(swapTimer);
        };
    }
  }, [currentAlbum, displayAlbum, isPlaying, isPowerOn]);


  // Auto-Start (When motor engages)
  useEffect(() => {
    if (isTransitioning || !isPowerOn) return; 

    if (isPlaying) {
        // If motor starts and arm is in rest, move it to start
        if (Math.abs(armAngle - REST_ANGLE) < 2) {
            SoundManager.play('armCreak', 0.3);
            setArmAngle(START_ANGLE);
            setIsCueUp(false); 
        }
    }
  }, [isPlaying, isTransitioning, isPowerOn, armAngle]);

  // Audio Playback Engine
  useEffect(() => {
    if (!audioRef.current) return;

    if (!isPowerOn) {
        audioRef.current.pause();
        return;
    }

    // Pitch & Speed Logic
    const baseRate = rpm === 45 ? 1.35 : 1.0;
    const pitchFactor = 1 + (pitch / 100); 
    const playbackRate = Math.max(0.1, baseRate * pitchFactor);
    
    audioRef.current.playbackRate = playbackRate;

    // --- MAIN MUSIC LOGIC ---
    // Music plays if Motor ON + Needle on Record + Cue DOWN + Not Transitioning
    const isNeedleOnRecord = armAngle >= START_ANGLE && armAngle <= END_ANGLE;
    const shouldPlayMusic = isPlaying && isNeedleOnRecord && !isCueUp && !isTransitioning;

    if (shouldPlayMusic) {
        // Use safePlay to handle promises and interruptions
        if (audioRef.current.paused) {
            safePlay(audioRef.current);
        }
        audioRef.current.volume = masterVolume; 
    } else {
        if (!audioRef.current.paused) {
            audioRef.current.pause();
        }
    }
  }, [isPlaying, armAngle, isCueUp, isTransitioning, rpm, pitch, masterVolume, isPowerOn]);


  // Animation Loop & Track Boundary Detection
  useEffect(() => {
    let lastTime = performance.now();
    let currentVelocity = 0; 
    
    // Calculate max velocity based on RPM
    const baseVelocity = rpm === 45 ? 4.5 : 3.3; // Visual degrees per frame

    const animate = (time: number) => {
      const delta = time - lastTime;
      lastTime = time;

      // Pitch effect on visual rotation
      const velocityTarget = baseVelocity * (1 + (pitch/100));

      // Calculate Rotation Velocity
      if (isPowerOn && isPlaying && !isTransitioning) {
        currentVelocity = Math.min(currentVelocity + 0.1, velocityTarget); 
      } else {
        currentVelocity = Math.max(currentVelocity - 0.05, 0); 
      }
      
      if (currentVelocity > 0) {
          setRotation(prev => (prev + currentVelocity) % 360);
      }

      // Tonearm Inward Sweep (Visual) & Boundary Logic
      if (currentVelocity > 2 && armAngle >= START_ANGLE && armAngle < END_ANGLE && !isCueUp && !isTransitioning) {
         if (audioRef.current && !audioRef.current.paused && currentAlbum?.tracklist) {
             const duration = audioRef.current.duration || 180;
             const currentTime = audioRef.current.currentTime;
             const progress = currentTime / duration;
             
             // Update Arm Angle based on progress
             const newAngle = START_ANGLE + (progress * (END_ANGLE - START_ANGLE));
             setArmAngle(newAngle);

             // CHECK TRACK BOUNDARY
             const totalTracks = currentAlbum.tracklist.length;
             const segmentDuration = duration / totalTracks;
             
             // What track *should* we be on?
             const calculatedTrackIndex = Math.min(
                 Math.floor(currentTime / segmentDuration), 
                 totalTracks - 1
             );

             // If we've crossed into a new track, trigger the "Hop"
             // Ensure we don't trigger if we are already returning (end of record)
             if (calculatedTrackIndex > activeTrackIndex && !isReturningRef.current) {
                 onTrackChange(calculatedTrackIndex);
             }
             
             // CHECK END OF RECORD (Progress >= 1)
             // Use ref to prevent multiple triggers
             if (progress >= 1 && !isReturningRef.current) {
                 isReturningRef.current = true;
                 
                 // Auto-Return Sequence
                 setIsCueUp(true); // Lift
                 
                 setTimeout(() => {
                     setArmAngle(REST_ANGLE); // Home
                     SoundManager.play('armCreak', 0.2);
                     
                     setTimeout(() => {
                         setIsPlaying(false); // Stop Motor
                         onTrackEnd(); // Notify App
                         
                         // Reset for next play
                         onTrackChange(0);
                         if (audioRef.current) {
                             audioRef.current.currentTime = 0;
                             audioRef.current.pause();
                         }
                         isReturningRef.current = false;
                     }, 1000);
                 }, 500);
             }
         }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPlaying, armAngle, isCueUp, onTrackEnd, isTransitioning, rpm, pitch, isPowerOn, activeTrackIndex, currentAlbum, onTrackChange, setIsPlaying]);

  // --- Handlers ---

  const handleDragStart = () => {
      if (isTransitioning || !isPowerOn) return;
      setIsCueUp(true); 
  };

  const handleDrag = (angle: number) => {
      if (isTransitioning || !isPowerOn) return;
      setArmAngle(angle);
  };

  const handleDragEnd = () => {
      if (isTransitioning || !isPowerOn) return;
      if (armAngle >= START_ANGLE && armAngle <= END_ANGLE) {
          setIsCueUp(false);
          setIsPlaying(true); 
      }
  };
  
  const handleCueToggle = (up: boolean) => {
      if (isTransitioning || !isPowerOn) return;
      setIsCueUp(up);
      SoundManager.play('tactile'); // New Sound
      if (!up && isPowerOn && isPlaying) {
          // Play needle drop sound if dropping onto record
           if (armAngle >= START_ANGLE && armAngle <= END_ANGLE) {
               setTimeout(() => SoundManager.play('needleDrop', vintageLevel), 100);
           }
      }
  };

  return (
    <div 
        ref={containerRef} 
        onMouseMove={handleMouseMove}
        className="relative w-full aspect-[3/2] select-none p-4"
        style={{ containerType: 'inline-size' }}
    >
       {/* Audio Element with CORS enabled for Web Audio API support */}
       <audio ref={audioRef} src={audioUrl || ''} loop={false} crossOrigin="anonymous" />

       {/* THE MONOLITH (Main Chassis) */}
       <div className="relative w-full h-full shadow-[0_4cqw_8cqw_rgba(0,0,0,0.5),0_1cqw_2cqw_rgba(0,0,0,0.3)] rounded-[0.5cqw] overflow-hidden bg-[#2a0505] transform transition-transform hover:scale-[1.002]">
           
           {/* Brushed Metallic Burgundy Surface */}
           <div 
             className="absolute inset-0"
             style={{
                background: `
                    repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(0,0,0,0.1) 1px, rgba(0,0,0,0.1) 2px),
                    linear-gradient(135deg, ${COLORS.plinthHighlight} 0%, ${COLORS.plinthBase} 100%)
                `,
                filter: isPowerOn ? 'contrast(1.1) brightness(0.9)' : 'contrast(1.0) brightness(0.6) grayscale(0.5)', // Cold look when OFF
                transition: 'filter 0.5s ease'
             }}
           >
               {/* Specular Glare - ENHANCED for Scale */}
               <div 
                 className="absolute inset-0 mix-blend-screen opacity-60 pointer-events-none"
                 style={{
                     background: `radial-gradient(circle at ${mousePos.x * 100}% ${mousePos.y * 100}%, rgba(255,255,255,0.6) 0%, transparent 60%)`
                 }}
               ></div>
               
               {/* Noise Grain */}
               <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>
               
               {/* Branding */}
               <div className="absolute top-[85%] left-[50%] -translate-x-1/2 flex flex-col items-center opacity-80 z-10 pointer-events-none">
                    <span className="font-serif italic text-[#C5A059] text-[2.5cqw] drop-shadow-sm">Technics</span>
               </div>
           </div>

           {/* --- COMPONENTS --- */}

           {/* 1. Strobe Light (Adjusted Position) */}
           <StrobeLight isPlaying={isPlaying} isPowerOn={isPowerOn} isAdminMode={isAdminMode} />

           {/* 2. Platter Assembly */}
           <div className="absolute top-[50%] left-[50%] w-[50%] h-auto aspect-square -translate-x-1/2 -translate-y-1/2 z-10">
                <Platter 
                    isPlaying={isPlaying && isPowerOn} 
                    album={displayAlbum} 
                    rotation={rotation}
                    slideState={platterSlideState}
                />
           </div>

           {/* 3. Tonearm Assembly */}
           <div className="absolute top-[55%] right-[20%] w-[1.5cqw] h-[4cqw] bg-neutral-900 rounded-[0.2cqw] shadow-lg border border-neutral-700 z-30 flex flex-col items-center justify-start py-[0.5cqw]">
                <div className="w-[1cqw] h-[1cqw] rounded-full bg-black/50 mb-[0.5cqw]"></div>
                <div className="w-full h-[0.1cqw] bg-neutral-700"></div>
           </div>
           
           <Tonearm 
             angle={armAngle}
             isShivering={isPowerOn && isPlaying && armAngle > START_ANGLE && armAngle < END_ANGLE && !isCueUp}
             onDragStart={handleDragStart}
             onDrag={handleDrag}
             onDragEnd={handleDragEnd}
             onCueToggle={handleCueToggle}
             isCueUp={isCueUp}
             parentRef={containerRef}
           />

           {/* 4. Controls */}
           <StartButton 
             isPlaying={isPlaying} 
             onTogglePlay={() => setIsPlaying(!isPlaying)} 
             isPowerOn={isPowerOn} 
           />
           <SpeedSelector currentRpm={rpm} onSetRpm={setRpm} isPowerOn={isPowerOn} />
           <PitchSlider value={pitch} onChange={setPitch} isPowerOn={isPowerOn} onAdminTrigger={onAdminTrigger} />
           
           {/* GRAND POWER SWITCH */}
           <PowerSwitch 
             isOn={isPowerOn} 
             onToggle={() => {
                 setIsPowerOn(!isPowerOn);
                 // Sound handled inside component on MouseDown
             }} 
            />
            
           <NavigationCluster onSkip={handleSkip} isPowerOn={isPowerOn} />
           
           {/* NEW: AUDIOPHILE ROW (Shifted Left to 81%) */}
           <div className="absolute bottom-[5%] left-[81%] -translate-x-1/2 flex flex-row gap-[1cqw] z-50 p-[0.5cqw] bg-[#111]/20 rounded-full border border-white/5 backdrop-blur-[2px] shadow-lg">
                {/* Volume - Left */}
                <div className="w-[5.5cqw]">
                    <RotaryKnob 
                        value={masterVolume} 
                        onChange={setMasterVolume} 
                        label="Volume" 
                        labelPosition="top"
                        indicatorColor="#22d3ee" // Teal
                    />
                </div>
                
                {/* Vintage - Right */}
                <div className="w-[5.5cqw]">
                    <RotaryKnob 
                        value={vintageLevel} 
                        onChange={setVintageLevel} 
                        label="Vintage" 
                        labelPosition="top"
                        indicatorColor="#d97706" // Amber
                    />
                </div>
           </div>
           
           {/* 45 Adapter Slot */}
           <div className="absolute top-[10%] right-[5%] w-[5cqw] h-[5cqw] rounded-full bg-black/40 shadow-inner border border-white/5 flex items-center justify-center">
               <div className="w-[4cqw] h-[4cqw] rounded-full bg-[#111] border border-neutral-700 shadow-[0_0.2cqw_0.5cqw_rgba(0,0,0,0.5)]"></div>
           </div>
           
           {/* HINTS */}
           {showHints && <HintOverlay />}
           <HelpButton active={showHints} onToggle={() => setShowHints(!showHints)} />

       </div>
    </div>
  );
};

export default Turntable;