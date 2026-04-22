import React, { useState } from 'react';
import { Album } from '../../types';
import { DEFAULT_LABEL_IMG } from '../../services/drive';

interface PlatterProps {
  isPlaying: boolean;
  album: Album | null;
  rotation: number;
  slideState: 'center' | 'left' | 'right';
}

const Platter: React.FC<PlatterProps> = ({ isPlaying, album, rotation, slideState }) => {
  const [imgError, setImgError] = useState(false);

  // Reset error state when album changes
  React.useEffect(() => {
      setImgError(false);
  }, [album?.id]);
  
  // Calculate transform for the slide animation
  const getSlideStyle = () => {
      switch(slideState) {
          case 'left': return { transform: 'translateX(-120%)', transition: 'transform 0.5s cubic-bezier(0.4, 0.0, 0.2, 1)' };
          case 'right': return { transform: 'translateX(120%)', transition: 'none' }; // Instant reset
          case 'center': return { transform: 'translateX(0)', transition: 'transform 0.5s cubic-bezier(0.0, 0.0, 0.2, 1)' };
      }
  };

  const currentArt = imgError || !album?.coverArt ? DEFAULT_LABEL_IMG : album.coverArt;
  const isFallback = imgError || !album?.coverArt;

  return (
    <div 
      className="w-full h-full rounded-full shadow-[0_0.5cqw_4cqw_rgba(0,0,0,0.8)] overflow-hidden relative z-10"
    >
      {/* Main Platter Structure */}
      <div 
        className="w-full h-full relative rounded-full bg-neutral-900 shadow-[inset_0_0_2cqw_rgba(0,0,0,0.8)] border-[0.2cqw] border-neutral-700"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        
        {/* Platter Metal Texture */}
        <div className="absolute inset-0 rounded-full bg-[url('https://www.transparenttextures.com/patterns/brushed-alum.png')] opacity-10 mix-blend-overlay"></div>

        {/* Strobe Dots - Scalable Borders using cqw */}
        <div className="absolute inset-[1.5%] rounded-full border-[0.6cqw] border-neutral-400 opacity-20 strobe-dots mix-blend-overlay"></div>
        <div className="absolute inset-[1.5%] rounded-full border-[0.6cqw] border-neutral-800 opacity-90 strobe-dots"></div>
        
        <div className="absolute inset-[4.5%] rounded-full border-[0.5cqw] border-neutral-400 opacity-20 strobe-dots mix-blend-overlay"></div>
        <div className="absolute inset-[4.5%] rounded-full border-[0.5cqw] border-neutral-800 opacity-90 strobe-dots"></div>
        
        <div className="absolute inset-[7.5%] rounded-full border-[0.5cqw] border-neutral-400 opacity-20 strobe-dots mix-blend-overlay"></div>
        <div className="absolute inset-[7.5%] rounded-full border-[0.5cqw] border-neutral-800 opacity-90 strobe-dots"></div>
        
        {/* Inner Platter Angled Edge */}
        <div className="absolute inset-[14%] rounded-full bg-gradient-to-br from-[#1a1a1a] to-black shadow-[inset_0_0.2cqw_1cqw_rgba(0,0,0,1)]"></div>

        {/* Vinyl Record - Full Bleed (2.5% Inset) */}
        <div 
            className="absolute inset-[2.5%] rounded-full vinyl-grooves shadow-[0_0_1.5cqw_rgba(0,0,0,0.9)] flex items-center justify-center will-change-transform"
            style={getSlideStyle()}
        >
            {/* Dynamic Label - Adjusted size relative to new vinyl size */}
            <div className="w-[34%] h-[34%] rounded-full bg-[#E5C050] overflow-hidden border-[0.1cqw] border-white/10 relative shadow-inner group flex items-center justify-center">
               {album ? (
                 <>
                    <img 
                        src={currentArt} 
                        alt="Label" 
                        onError={() => setImgError(true)}
                        className={`w-full h-full object-cover transition-opacity ${isFallback ? 'opacity-80 scale-150 grayscale contrast-150' : 'opacity-95 group-hover:opacity-100'}`} 
                    />
                    {isFallback && (
                         <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                             <div className="text-[0.6cqw] font-black text-[#D4AF37] bg-black/60 px-2 py-1 rotate-[-15deg] border border-[#D4AF37]/50 tracking-widest uppercase shadow-xl backdrop-blur-sm">
                                STUDIO METAFOUR
                             </div>
                         </div>
                    )}
                 </>
               ) : (
                 <div className="w-full h-full bg-neutral-900 flex items-center justify-center text-[0.6cqw] font-bold text-neutral-600 uppercase tracking-widest text-center">
                   NO DISC
                 </div>
               )}
               {/* Spindle (Stationary relative to record) */}
               <div className="absolute top-1/2 left-1/2 w-[3%] h-[3%] bg-neutral-200 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0.2cqw_0.4cqw_rgba(0,0,0,0.5)] border border-neutral-400 z-10"></div>
            </div>
            
            {/* Light Reflection overlay on vinyl */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none mix-blend-screen opacity-50"></div>
        </div>
      </div>
    </div>
  );
};

export default Platter;