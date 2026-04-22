import React from 'react';
import { Album } from '../types';
import { Disc3 } from 'lucide-react';

interface LinerNotesProps {
  album: Album | null;
  activeTrackIndex: number;
  onTrackClick: (index: number) => void;
  isPowerOn: boolean;
  isPlaying: boolean;
}

const LinerNotes: React.FC<LinerNotesProps> = ({ 
    album, 
    activeTrackIndex, 
    onTrackClick, 
    isPowerOn, 
    isPlaying 
}) => {
  if (!album || !album.tracklist) return null;

  return (
    <div className={`w-full h-auto flex flex-col justify-center animate-fade-in transition-all duration-1000 ${isPowerOn ? 'opacity-100 filter-none' : 'opacity-20 blur-[1px] grayscale pointer-events-none'}`}>
      <div className="bg-[#111] border border-neutral-800 rounded-sm p-6 relative overflow-hidden group shadow-2xl">
         {/* Paper Texture Overlay */}
         <div className="absolute inset-0 opacity-[0.05] bg-[url('https://www.transparenttextures.com/patterns/cardboard.png')] pointer-events-none"></div>
         
         {/* Header */}
         <div className="flex flex-col gap-1 mb-8 border-b border-neutral-800 pb-4">
            <div className="flex items-center gap-2">
                <Disc3 className="w-4 h-4 text-neutral-500" />
                <h3 className="text-neutral-500 font-mono text-[10px] tracking-[0.2em] uppercase">Selections</h3>
            </div>
            <h2 className="text-white font-sans font-bold text-lg leading-tight">{album.title}</h2>
            <p className="text-neutral-500 font-mono text-xs">{album.artist}</p>
         </div>

         {/* Tracklist */}
         <ul className="space-y-1 relative z-10">
            {album.tracklist.map((trackFile, idx) => {
                const isSelected = activeTrackIndex === idx;
                // Active highlight only appears if Power is ON AND Motor is Spinning
                const isVisuallyActive = isSelected && isPowerOn && isPlaying;
                
                return (
                    <li 
                        key={idx}
                        onClick={() => onTrackClick(idx)}
                        className={`
                            relative flex items-center justify-between py-3 px-3 rounded-[2px] cursor-pointer group/item
                            transition-all duration-200
                            ${isSelected 
                                ? 'bg-white/5' 
                                : 'hover:bg-white/5'}
                            ${isVisuallyActive ? '!bg-orange-900/20' : ''}
                        `}
                    >
                        {/* Left Side: Number & Title */}
                        <div className="flex items-center gap-4">
                            <span className={`font-mono text-[10px] ${isVisuallyActive ? 'text-orange-500' : 'text-neutral-600'}`}>
                                {String(idx + 1).padStart(2, '0')}
                            </span>
                            <span className={`font-sans text-xs tracking-wide transition-colors ${isVisuallyActive ? 'text-orange-400 font-bold' : isSelected ? 'text-white' : 'text-white/40 group-hover/item:text-white/70'}`}>
                                {trackFile.title.replace(/_/g, ' ').replace(/\.[^/.]+$/, "")} {/* Clean up filename display */}
                            </span>
                        </div>
                        
                        {/* Right Side: Duration & Status */}
                        <div className="flex items-center gap-3">
                             {isVisuallyActive && (
                                <div className="flex gap-[2px] items-end h-3">
                                    <div className="w-[2px] bg-orange-500 animate-[bounce_1s_infinite] h-[60%]"></div>
                                    <div className="w-[2px] bg-orange-500 animate-[bounce_1.2s_infinite] h-[100%]"></div>
                                    <div className="w-[2px] bg-orange-500 animate-[bounce_0.8s_infinite] h-[40%]"></div>
                                </div>
                             )}
                             <span className={`font-mono text-[10px] ${isVisuallyActive ? 'text-orange-500/70' : 'text-neutral-700'}`}>
                                {trackFile.duration}
                             </span>
                        </div>
                    </li>
                )
            })}
         </ul>

         {/* Footer Metadata */}
         <div className="mt-8 pt-4 border-t border-neutral-800 flex justify-between items-center opacity-30">
            <span className="font-mono text-[9px] uppercase tracking-widest">Stereo LP</span>
            <span className="font-mono text-[9px] uppercase tracking-widest">{album.bpm ? `${album.bpm} BPM /` : ''} 33RPM</span>
         </div>
      </div>
    </div>
  );
};

export default LinerNotes;