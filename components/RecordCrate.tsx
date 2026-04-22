import React from 'react';
import { Album } from '../types';
import { Disc, ChevronUp, ChevronDown } from 'lucide-react';

interface RecordCrateProps {
  albums: Album[];
  selectedAlbumId?: string;
  onSelectAlbum: (album: Album) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isPowerOn: boolean;
}

const RecordCrate: React.FC<RecordCrateProps> = ({ 
    albums, 
    selectedAlbumId, 
    onSelectAlbum, 
    isOpen, 
    setIsOpen,
    isPowerOn
}) => {
  return (
    <div 
        className={`
            fixed bottom-0 left-0 right-0 z-50 
            transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]
            flex flex-col items-center
        `}
        style={{
            // Handle height is roughly 3rem (12 units in Tailwind spacing usually)
            // When closed, translate down 100% minus the handle height
            transform: isOpen ? 'translateY(0%)' : 'translateY(calc(100% - 3rem))'
        }}
    >
      {/* 1. THE HANDLE / PULL TAB */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer group relative flex flex-col items-center justify-end h-12 w-full max-w-md mx-auto z-50"
      >
         {/* Brass/Leather Tab Shape */}
         <div className="w-48 h-full bg-[#1a1a1a] rounded-t-lg border-t border-x border-neutral-700 shadow-[0_-5px_15px_rgba(0,0,0,0.5)] flex items-center justify-center gap-2 relative overflow-hidden transition-colors hover:bg-[#222]">
            
            {/* Leather Texture on Handle */}
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/leather.png')]"></div>
            
            {/* Brass Trim */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#8F7124] via-[#D4AF37] to-[#8F7124]"></div>

            {/* Icon / Text */}
            <div className="relative z-10 flex items-center gap-2 text-[#D4AF37] font-mono text-xs font-bold tracking-widest uppercase opacity-80 group-hover:opacity-100">
                <Disc className="w-4 h-4" />
                <span>Record Archive</span>
                {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </div>
         </div>
      </div>

      {/* 2. THE TRAY BODY */}
      <div className="w-full max-w-[95vw] bg-[#0f0f0f] border-t border-neutral-800 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] pb-8 relative rounded-t-sm">
        {/* Inner Shadow / Depth */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_10px_20px_rgba(0,0,0,0.8)] z-20"></div>
        
        {/* Texture */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')] pointer-events-none z-0"></div>

        {/* Scrollable Container */}
        <div className="relative z-10 w-full overflow-x-auto hide-scrollbar">
            <div className="flex justify-center min-w-max px-8 py-8 gap-8">
                {albums.map((album) => {
                    const isSelected = album.id === selectedAlbumId;
                    
                    return (
                        <div 
                            key={album.id}
                            onClick={() => onSelectAlbum(album)}
                            className={`
                                relative flex-shrink-0 w-36 h-36 md:w-48 md:h-48 group cursor-pointer
                                transition-all duration-300 ease-out transform perspective-1000
                                ${isSelected ? '-translate-y-4 scale-105' : 'hover:-translate-y-2 hover:scale-105'}
                                ${!isPowerOn ? 'grayscale opacity-60 hover:grayscale-0 hover:opacity-100' : ''}
                            `}
                        >
                            {/* Vinyl Record poking out (Preview) */}
                            <div className={`
                                absolute top-0 left-1/2 -translate-x-1/2 w-[90%] h-[90%] rounded-full bg-black shadow-xl
                                transition-all duration-500
                                ${isSelected ? '-top-[30%] animate-spin-slow' : 'group-hover:-top-[15%]'}
                            `}>
                                <div className="absolute inset-[35%] rounded-full border-[6px] border-yellow-600/30"></div>
                            </div>

                            {/* Sleeve */}
                            <div className="absolute inset-0 bg-neutral-800 rounded-sm shadow-xl overflow-hidden border border-neutral-700 z-10 relative">
                                <img 
                                    src={album.coverArt} 
                                    alt={album.title} 
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-90 group-hover:opacity-100'}`}
                                />
                                {/* Plastic Sleeve Glare */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
                                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-sm pointer-events-none"></div>
                            </div>

                            {/* Meta Label (Tooltip Style) */}
                            <div className="absolute -bottom-8 left-0 right-0 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                <p className="text-[10px] text-[#D4AF37] font-bold truncate font-mono tracking-wider">{album.title}</p>
                                <p className="text-[9px] text-neutral-500 truncate font-mono">{album.artist}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default RecordCrate;