export interface TrackFile {
  title: string; // Filename or Metadata Title
  duration: string; // Display duration
  fileId?: string; // Drive File ID
}

export interface Album {
  id: string; // Drive Folder ID
  title: string; // Folder Name
  artist: string; // Derived or Metadata
  coverArt: string; // URL to image in folder
  audioUrl: string; // URL to first/current audio file
  duration: number; // Total seconds
  bpm?: number;
  tracklist?: TrackFile[]; // The audio files in the folder
  calibrationOffset?: number; // Manual override for needle drop angle (degrees)
}

export enum PlayState {
  STOPPED = 'STOPPED',
  SPINNING_UP = 'SPINNING_UP',
  PLAYING = 'PLAYING',
  SPINNING_DOWN = 'SPINNING_DOWN'
}

export interface TurntableState {
  isPlaying: boolean;
  playState: PlayState;
  rpm: 33 | 45;
  pitch: number; // -8 to +8
  volume: number;
}