import { create } from "zustand";

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  isInitialized: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  initAudio: () => void;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  isInitialized: false,
  
  initAudio: () => {
    // Verificar se já foi inicializado
    if (get().isInitialized) return;
    
    console.log("Inicializando sistema de áudio");
    
    // Criar elementos de áudio
    const hitSound = new Audio("/sounds/hit.mp3");
    hitSound.volume = 0.3;
    
    const successSound = new Audio("/sounds/success.mp3");
    successSound.volume = 0.3;
    
    // Para o futuro, quando adicionarmos música de fundo
    // const backgroundMusic = new Audio("/sounds/background.mp3");
    // backgroundMusic.loop = true;
    // backgroundMusic.volume = 0.2;
    
    set({
      hitSound,
      successSound,
      // backgroundMusic,
      isInitialized: true
    });
    
    console.log("Sistema de áudio inicializado");
  },
  
  setBackgroundMusic: (music) => set({ backgroundMusic: music }),
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Control background music playback
    if (backgroundMusic) {
      if (newMutedState) {
        // Pause background music when muting
        backgroundMusic.pause();
      } else {
        // Resume background music when unmuting
        backgroundMusic.play().catch(error => {
          console.log("Erro ao reproduzir música de fundo:", error);
        });
      }
    }
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Log the change
    console.log(`Som ${newMutedState ? 'desativado' : 'ativado'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted, isInitialized } = get();
    
    // Se o áudio não foi inicializado ou está mutado, não reproduza
    if (!isInitialized || isMuted) {
      return;
    }
    
    if (hitSound) {
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Erro ao reproduzir som:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted, isInitialized } = get();
    
    // Se o áudio não foi inicializado ou está mutado, não reproduza
    if (!isInitialized || isMuted) {
      return;
    }
    
    if (successSound) {
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Erro ao reproduzir som de sucesso:", error);
      });
    }
  }
}));
