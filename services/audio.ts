// Audio Assets map
const ASSETS = {
    // Power: Heavy Industrial Relay (Thunk + Ping)
    power: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', 
    
    // Tactile: Camera Shutter / High-end Audio Button (Crisp, dry)
    tactile: 'https://assets.mixkit.co/active_storage/sfx/2572/2572-preview.mp3',
    
    // Mechanical: Generic Click
    click: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3', 
    
    // Knob: Soft Detent
    knob: 'https://assets.mixkit.co/active_storage/sfx/2580/2580-preview.mp3',
    
    // Admin: Digital Ticks
    tick: 'https://assets.mixkit.co/active_storage/sfx/2599/2599-preview.mp3',
    unlock: 'https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3',
    
    // Physics: Needle Drop (Thump)
    needleDrop: 'https://assets.mixkit.co/active_storage/sfx/228/228-preview.mp3',
    
    // Kinematics: Servo/Gear Creak
    armCreak: 'https://assets.mixkit.co/active_storage/sfx/225/225-preview.mp3',
    
    // Mechanism: Tray Motor / Slide
    traySlide: 'https://assets.mixkit.co/active_storage/sfx/112/112-preview.mp3',
    
    // Mechanism: Latch / Clack
    latch: 'https://assets.mixkit.co/active_storage/sfx/2573/2573-preview.mp3',

    // Loops
    crackle: 'https://upload.wikimedia.org/wikipedia/commons/b/bb/Vinyl_crackle.ogg',
    hum: 'https://upload.wikimedia.org/wikipedia/commons/6/61/60Hz_hum.ogg'
};

class AudioController {
    private sounds: Record<string, HTMLAudioElement> = {};
    private initialized = false;
    private fadeIntervals: Record<string, number> = {};

    constructor() {
        if (typeof window !== 'undefined') {
            this.preload();
        }
    }

    private preload() {
        if (this.initialized) return;
        
        Object.entries(ASSETS).forEach(([key, src]) => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            
            // Configure loops
            if (key === 'crackle' || key === 'hum') {
                audio.loop = true;
            }

            // Default Volumes
            if (key === 'hum') audio.volume = 0.15;
            if (key === 'crackle') audio.volume = 0.25;
            if (key === 'armCreak') audio.volume = 0.3; // Subtle
            if (key === 'traySlide') audio.volume = 0.4;

            this.sounds[key] = audio;
        });

        this.initialized = true;
    }

    public async play(id: keyof typeof ASSETS, volume: number = 0.6) {
        const sound = this.sounds[id];
        if (sound) {
            try {
                sound.currentTime = 0;
                sound.volume = volume;
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    await playPromise;
                }
            } catch (error: any) {
                // Ignore AbortError (interrupted by pause) and NotAllowedError (interaction needed)
                if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                    console.warn(`SoundManager error playing ${id}:`, error);
                }
            }
        }
    }

    public async startLoop(id: 'crackle' | 'hum') {
        const sound = this.sounds[id];
        if (sound && sound.paused) {
            try {
                sound.volume = id === 'hum' ? 0.15 : 0.25; // Reset to default base
                const playPromise = sound.play();
                if (playPromise !== undefined) {
                    await playPromise;
                }
            } catch (error: any) {
                if (error.name !== 'AbortError' && error.name !== 'NotAllowedError') {
                    console.warn(`Loop error ${id}:`, error);
                }
            }
        }
    }

    public stopLoop(id: 'crackle' | 'hum') {
        const sound = this.sounds[id];
        if (sound) {
            // Clear any active fades first
            if (this.fadeIntervals[id]) {
                clearInterval(this.fadeIntervals[id]);
                delete this.fadeIntervals[id];
            }
            sound.pause();
            sound.currentTime = 0;
        }
    }
    
    // Smooth fade in for motor and crackle
    public fadeInLoop(id: 'crackle' | 'hum', targetVolume: number = 0.15, duration: number = 1000) {
        const sound = this.sounds[id];
        if (!sound) return;

        // Clear existing fade
        if (this.fadeIntervals[id]) clearInterval(this.fadeIntervals[id]);

        if (sound.paused) {
            sound.volume = 0;
            const playPromise = sound.play();
            if (playPromise !== undefined) {
                playPromise.catch(() => {}); // Catch play error silently
            }
        }

        const steps = 20;
        const interval = duration / steps;
        const stepSize = targetVolume / steps;

        let currentStep = 0;
        this.fadeIntervals[id] = window.setInterval(() => {
            currentStep++;
            // Don't exceed target
            const newVol = Math.min(targetVolume, sound.volume + stepSize);
            sound.volume = newVol;

            if (currentStep >= steps || sound.volume >= targetVolume) {
                clearInterval(this.fadeIntervals[id]);
                delete this.fadeIntervals[id];
                sound.volume = targetVolume;
            }
        }, interval);
    }
    
    // Smooth fade out
    public fadeOutLoop(id: 'crackle' | 'hum', duration: number = 500) {
        const sound = this.sounds[id];
        if (!sound || sound.paused) return;

        // Clear existing fade
        if (this.fadeIntervals[id]) clearInterval(this.fadeIntervals[id]);

        const steps = 20;
        const startVol = sound.volume;
        const interval = duration / steps;
        const stepSize = startVol / steps;

        let currentStep = 0;
        this.fadeIntervals[id] = window.setInterval(() => {
            currentStep++;
            const newVol = Math.max(0, sound.volume - stepSize);
            sound.volume = newVol;

            if (currentStep >= steps || sound.volume <= 0) {
                clearInterval(this.fadeIntervals[id]);
                delete this.fadeIntervals[id];
                sound.pause();
                sound.currentTime = 0;
            }
        }, interval);
    }

    public setVolume(id: keyof typeof ASSETS, volume: number) {
        const sound = this.sounds[id];
        if (sound) {
            sound.volume = Math.max(0, Math.min(1, volume));
        }
    }
}

export const SoundManager = new AudioController();