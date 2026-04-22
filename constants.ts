import { Album } from './types';

export const COLORS = {
  plinthBase: '#3E0A15', // Deep Burgundy Base
  plinthHighlight: '#7A1F30', // Lighter Burgundy Anodized
  gold: '#D4AF37', // Polished Brass/Gold
  goldDark: '#8F7124',
  ledOn: '#ff1a1a', // Bright Red Bloom
  ledOff: '#330000',
  blackMatte: '#18181b',
};

// Mock Audio Tracks (Albums)
export const CRATE_TRACKS: Album[] = [
  {
    id: '1',
    title: 'Midnight Jazz',
    artist: 'Smooth Trio',
    coverArt: 'https://picsum.photos/id/1084/600/600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 372,
    bpm: 90,
    tracklist: [
        { title: 'Blue Note Intro', duration: '3:45' },
        { title: 'Saxophone Dreams', duration: '4:20' },
        { title: 'Whiskey Neat', duration: '3:10' },
        { title: 'Late Night Cab', duration: '5:00' }
    ]
  },
  {
    id: '2',
    title: 'Neon Highway',
    artist: 'Synthwave Collective',
    coverArt: 'https://picsum.photos/id/106/600/600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 425,
    bpm: 120,
    tracklist: [
        { title: 'Ignition', duration: '2:30' },
        { title: 'Cyberpunk City', duration: '4:15' },
        { title: 'Digital Sunset', duration: '3:50' },
        { title: 'Mainframe Breach', duration: '4:45' }
    ]
  },
  {
    id: '3',
    title: 'Dusty Grooves',
    artist: 'The Samplers',
    coverArt: 'https://picsum.photos/id/338/600/600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 310,
    bpm: 88,
    tracklist: [
        { title: 'Vinyl Crackle', duration: '1:15' },
        { title: 'Old School Flow', duration: '3:30' },
        { title: 'Sample This', duration: '2:50' },
        { title: 'Loop Theory', duration: '4:00' }
    ]
  },
  {
    id: '4',
    title: 'Deep Focus',
    artist: 'Lofi Beats',
    coverArt: 'https://picsum.photos/id/235/600/600',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
    duration: 180,
    bpm: 75,
    tracklist: [
        { title: 'Study Session', duration: '2:45' },
        { title: 'Rainy Window', duration: '3:15' },
        { title: 'Coffee Break', duration: '2:30' }
    ]
  },
];

// Physics Constants
// 3:2 Aspect Ratio Layout
// Chassis is wider. Platter is approx 40% X. Tonearm pivot is approx 80% X.
export const ARM_PIVOT_X_PCT = 80; 
export const ARM_PIVOT_Y_PCT = 30;

// Angles in degrees (0 = 3 o'clock, 90 = 6 o'clock)
export const REST_ANGLE = 90; // Resting straight down (6 o'clock)
export const START_ANGLE = 112; // Lead-in groove
export const END_ANGLE = 145; // Run-out groove