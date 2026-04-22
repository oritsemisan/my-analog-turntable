import React, { useState } from 'react';
import { Album } from '../../types';
import { StorageService } from '../../services/storage';
import { uploadFile, DEFAULT_LABEL_IMG } from '../../services/drive';
import { X, Save, Plus, Trash2, Sliders, UploadCloud } from 'lucide-react';

interface ServiceManualProps {
  isOpen: boolean;
  crate: Album[];
  onUpdateCrate: (newCrate: Album[]) => void;
  onClose: () => void;
}

const ServiceManual: React.FC<ServiceManualProps> = ({ isOpen, crate, onUpdateCrate, onClose }) => {
  const [isImporting, setIsImporting] = useState(false);
  const [activeTab, setActiveTab] = useState<'CRATE' | 'CALIBRATION'>('CRATE');
  
  // New Album Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);

  if (!isOpen) return null;

  const handleAddAlbum = async () => {
      if (!title || !artist || !audioFile) return;
      setIsImporting(true);
      try {
          // Upload files to Firebase Storage
          const audioUrl = await uploadFile(audioFile, 'audio');
          const coverArtUrl = coverFile ? await uploadFile(coverFile, 'covers') : DEFAULT_LABEL_IMG;
          
          // Calculate a rough duration or mock it
          const duration = 300; 

          const newAlbumData = {
              title,
              artist,
              coverArt: coverArtUrl,
              audioUrl: audioUrl,
              duration,
              bpm: 120,
              calibrationOffset: 0,
              tracklist: [
                { title: audioFile.name, duration: '5:00' }
              ]
          };

          const newAlbum = await StorageService.addAlbum(newAlbumData);
          const updated = [...crate, newAlbum];
          onUpdateCrate(updated);
          
          // Reset
          setTitle('');
          setArtist('');
          setAudioFile(null);
          setCoverFile(null);
      } catch (e) {
          alert('Upload Failed');
          console.error(e);
      } finally {
          setIsImporting(false);
      }
  };

  const handleRemove = async (id: string) => {
      try {
          await StorageService.removeAlbum(id);
          const updated = crate.filter(a => a.id !== id);
          onUpdateCrate(updated);
      } catch (e) {
          console.error("Failed to remove", e);
      }
  };

  const handleCalibrate = async (id: string, offset: number) => {
      try {
          await StorageService.updateAlbum(id, { calibrationOffset: offset });
          const updated = crate.map(a => a.id === id ? { ...a, calibrationOffset: offset } : a);
          onUpdateCrate(updated);
      } catch (e) {
          console.error("Failed to calibrate", e);
      }
  };

  return (
    <div className="absolute inset-0 z-[90] bg-[#001a33]/95 backdrop-blur-md p-8 md:p-12 font-mono text-blue-200 flex flex-col animate-fade-in overflow-hidden">
        {/* Blueprint Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20" 
             style={{ 
                 backgroundImage: 'linear-gradient(#0099ff 1px, transparent 1px), linear-gradient(90deg, #0099ff 1px, transparent 1px)',
                 backgroundSize: '20px 20px'
             }}
        ></div>

        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b-2 border-blue-500/30 pb-4 relative z-10">
            <div>
                <h1 className="text-3xl font-bold text-blue-400 uppercase tracking-tighter">Service Manual <span className="text-xs align-top opacity-50">v1.0.4</span></h1>
                <p className="text-xs text-blue-300/60 mt-1">MASTER CRATE CONFIGURATION & DIAGNOSTICS</p>
            </div>
            <button onClick={onClose} className="hover:text-white transition-colors"><X className="w-8 h-8" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6 relative z-10">
            <button 
                onClick={() => setActiveTab('CRATE')}
                className={`px-4 py-2 border border-blue-500/50 text-xs font-bold uppercase hover:bg-blue-500/20 transition-colors ${activeTab === 'CRATE' ? 'bg-blue-500/30 text-white' : ''}`}
            >
                Crate Management
            </button>
            <button 
                onClick={() => setActiveTab('CALIBRATION')}
                className={`px-4 py-2 border border-blue-500/50 text-xs font-bold uppercase hover:bg-blue-500/20 transition-colors ${activeTab === 'CALIBRATION' ? 'bg-blue-500/30 text-white' : ''}`}
            >
                Needle Calibration
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 relative z-10">
            
            {/* CRATE TAB */}
            {activeTab === 'CRATE' && (
                <div className="space-y-6">
                    {/* Add New */}
                    <div className="border border-blue-500/30 p-4 bg-blue-900/20 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="col-span-1 md:col-span-2">
                           <label className="block text-xs uppercase mb-2 text-blue-400">Upload New Record</label>
                        </div>
                        
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Album Title"
                            className="bg-black/50 border border-blue-500/30 text-blue-100 p-2 text-sm font-mono focus:border-blue-400 outline-none"
                        />
                        <input 
                            type="text" 
                            value={artist}
                            onChange={(e) => setArtist(e.target.value)}
                            placeholder="Artist Name"
                            className="bg-black/50 border border-blue-500/30 text-blue-100 p-2 text-sm font-mono focus:border-blue-400 outline-none"
                        />

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-blue-500">Audio File (.mp3/.wav)</label>
                            <input 
                                type="file" 
                                accept="audio/*"
                                onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                                className="text-xs text-blue-300"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[10px] uppercase text-blue-500">Cover Art (Optional)</label>
                            <input 
                                type="file" 
                                accept="image/*"
                                onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                                className="text-xs text-blue-300"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
                            <button 
                                onClick={handleAddAlbum}
                                disabled={isImporting || !title || !artist || !audioFile}
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 flex items-center gap-2 text-sm disabled:opacity-50"
                            >
                                {isImporting ? 'UPLOADING...' : <><UploadCloud className="w-4 h-4" /> UPLOAD TO CLOUD</>}
                            </button>
                        </div>
                    </div>

                    {/* List */}
                    <div className="space-y-2">
                        {crate.map((album, idx) => (
                            <div key={album.id} className="flex items-center justify-between bg-black/30 border border-blue-500/20 p-3 hover:border-blue-500/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <span className="text-blue-500/50 text-xs w-6">{String(idx + 1).padStart(2, '0')}</span>
                                    <div className="w-8 h-8 bg-blue-900/50 rounded overflow-hidden">
                                        <img src={album.coverArt} className="w-full h-full object-cover grayscale opacity-70" />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-blue-200">{album.title}</div>
                                        <div className="text-xs text-blue-500">{album.artist}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-xs text-blue-500/50">{album.tracklist?.length || 0} Tracks</span>
                                    <button onClick={() => handleRemove(album.id)} className="text-red-900 hover:text-red-500 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* CALIBRATION TAB */}
            {activeTab === 'CALIBRATION' && (
                <div className="space-y-4">
                    <p className="text-xs text-blue-300/70 mb-4 border-l-2 border-orange-500 pl-2">
                        WARNING: Adjusting Needle Drop Offset affects where the tonearm lands for the first track. 
                        Positive values move inward, negative values move outward.
                    </p>
                    {crate.map((album) => (
                        <div key={album.id} className="flex items-center justify-between bg-black/30 border border-blue-500/20 p-3">
                             <div className="flex items-center gap-4">
                                <Sliders className="w-4 h-4 text-blue-500" />
                                <span className="text-sm">{album.title}</span>
                             </div>
                             <div className="flex items-center gap-4">
                                <input 
                                    type="range" 
                                    min="-5" 
                                    max="5" 
                                    step="0.1"
                                    value={album.calibrationOffset || 0}
                                    onChange={(e) => handleCalibrate(album.id, parseFloat(e.target.value))}
                                    className="w-32 accent-blue-500 h-1 bg-blue-900/50 appearance-none rounded"
                                />
                                <span className="text-xs font-mono w-12 text-right">{(album.calibrationOffset || 0).toFixed(1)}°</span>
                             </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};

export default ServiceManual;