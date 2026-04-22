import React, { useState, useEffect } from 'react';
import Turntable from './components/Turntable/Turntable';
import RecordCrate from './components/RecordCrate';
import LinerNotes from './components/LinerNotes';
import AuthModal from './components/Admin/AuthModal';
import ServiceManual from './components/Admin/ServiceManual';
import { StorageService } from './services/storage';
import { Album } from './types';

function App() {
  // Crate State (Loaded from Storage)
  const [crate, setCrate] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Record State
  const [currentAlbum, setCurrentAlbum] = useState<Album | null>(null);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  
  // Global Hardware State
  const [isPowerOn, setIsPowerOn] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Tray State
  const [isCrateOpen, setIsCrateOpen] = useState(false);

  // Admin / Service Mode State
  const [isAdminAuthOpen, setIsAdminAuthOpen] = useState(false);
  const [isServiceManualOpen, setIsServiceManualOpen] = useState(false);

  // Initialize System (Boot Sequence / Storage Load)
  useEffect(() => {
    const initSystem = async () => {
        setLoading(true);
        try {
            const albums = await StorageService.loadCrate();
            setCrate(albums);
            if (albums.length > 0) {
                setCurrentAlbum(albums[0]);
            }
        } catch (e) {
            console.error("Storage Sync Failed", e);
        } finally {
            setLoading(false);
        }
    };
    initSystem();
  }, []);

  const handleAlbumSelect = (album: Album) => {
    setCurrentAlbum(album);
    setActiveTrackIndex(0); // Reset needle to track 1
    setIsCrateOpen(false); // Auto-close tray
  };

  const handleTrackEnd = () => {
      console.log("Record finished");
  };

  const handleAdminTrigger = () => {
      // Play a heavy click sound here if audio context allowed
      setIsAdminAuthOpen(true);
  };

  const handleAdminSuccess = () => {
      setIsAdminAuthOpen(false);
      setIsServiceManualOpen(true);
  };

  if (loading) {
      return (
        <div className="h-screen w-full bg-neutral-900 flex items-center justify-center">
            <div className="text-[#D4AF37] font-mono tracking-widest animate-pulse">INITIALIZING DRIVE BRIDGE...</div>
        </div>
      );
  }

  // Handle Empty State (No Albums in Database)
  if (!currentAlbum && !loading && crate.length === 0) {
      return (
          <div className="h-screen w-full bg-neutral-900 flex flex-col items-center justify-center text-center px-4 relative">
              <AuthModal 
                isOpen={isAdminAuthOpen} 
                onSuccess={handleAdminSuccess} 
                onClose={() => setIsAdminAuthOpen(false)} 
              />
              
              <div className={`absolute inset-0 z-[80] transition-opacity duration-500 ${isServiceManualOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                  <ServiceManual 
                      isOpen={isServiceManualOpen}
                      crate={crate}
                      onUpdateCrate={(newCrate) => {
                          setCrate(newCrate);
                          if (newCrate.length > 0 && !currentAlbum) {
                              setCurrentAlbum(newCrate[0]);
                          }
                      }}
                      onClose={() => setIsServiceManualOpen(false)}
                  />
              </div>

              <div className="w-24 h-24 mb-6 opacity-20 border-4 border-white rounded-full flex items-center justify-center">
                 <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
              <h1 className="text-2xl text-white font-mono tracking-widest mb-2">CRATE IS EMPTY</h1>
              <p className="text-sm text-neutral-500 font-mono mb-8 max-w-md">The master record crate returned 0 results from the cloud database.</p>
              
              <button 
                onClick={handleAdminTrigger}
                className="border border-[#D4AF37] text-[#D4AF37] px-6 py-3 font-mono text-sm tracking-widest hover:bg-[#D4AF37] hover:text-black transition-colors"
               >
                  OPEN SERVICE MANUAL
              </button>
          </div>
      );
  }

  if (!currentAlbum) return null;

  return (
    <div className="h-screen w-full bg-pegboard overflow-hidden relative flex flex-col items-center justify-center">
      
      {/* Background Vignette */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)] z-0"></div>

      {/* Admin Modals - Overlay on top of everything */}
      <AuthModal 
        isOpen={isAdminAuthOpen} 
        onSuccess={handleAdminSuccess} 
        onClose={() => setIsAdminAuthOpen(false)} 
      />
      
      {/* Service Manual Overlay (Takes over the Turntable view essentially) */}
      <div className={`absolute inset-0 z-[80] transition-opacity duration-500 ${isServiceManualOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
          <ServiceManual 
              isOpen={isServiceManualOpen}
              crate={crate}
              onUpdateCrate={setCrate}
              onClose={() => setIsServiceManualOpen(false)}
          />
      </div>


      {/* Branding (Floating) */}
      <div className="absolute top-4 xl:top-6 left-0 right-0 text-center pointer-events-none select-none z-10 opacity-50 mix-blend-overlay">
         <h1 className="text-xl md:text-3xl font-black text-neutral-800 tracking-tighter uppercase">
            Studio Deck V1
         </h1>
      </div>

      {/* Main Stage: Ultra-Wide Hero Layout */}
      <div className="relative z-10 flex flex-col xl:flex-row items-center justify-between w-[98vw] h-full max-h-[96vh] gap-4 px-2 xl:px-8">
          
          {/* Left: The Monolith (Hero Scale: Dominant) */}
          <div className="flex-1 h-full w-full flex items-center justify-center xl:justify-start xl:pl-12">
             <div className="aspect-[3/2] h-auto max-h-full w-full max-w-full xl:w-auto xl:h-[90%] flex items-center shadow-2xl relative">
                <Turntable 
                    currentAlbum={currentAlbum}
                    onTrackEnd={handleTrackEnd}
                    activeTrackIndex={activeTrackIndex}
                    onTrackChange={setActiveTrackIndex}
                    isPowerOn={isPowerOn}
                    setIsPowerOn={setIsPowerOn}
                    isPlaying={isPlaying}
                    setIsPlaying={setIsPlaying}
                    onAdminTrigger={handleAdminTrigger}
                    isAdminMode={isServiceManualOpen}
                />
             </div>
          </div>

          {/* Right: Side Menu (Fixed Compact Column) */}
          <div className="hidden xl:flex w-[20%] max-w-[300px] h-full flex-col justify-center items-end pr-4">
            <LinerNotes 
                 album={currentAlbum}
                 activeTrackIndex={activeTrackIndex}
                 onTrackClick={setActiveTrackIndex}
                 isPowerOn={isPowerOn}
                 isPlaying={isPlaying}
            />
          </div>
      </div>

      {/* Retractable Crate Tray (Fixed Bottom) */}
      <RecordCrate 
        albums={crate}
        selectedAlbumId={currentAlbum.id}
        onSelectAlbum={handleAlbumSelect}
        isOpen={isCrateOpen}
        setIsOpen={setIsCrateOpen}
        isPowerOn={isPowerOn}
      />
    </div>
  );
}

export default App;