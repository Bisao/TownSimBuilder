import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

export type GamePhase = "login" | "character-creation" | "character-selection" | "ready" | "playing" | "ended";

interface CharacterData {
  name: string;
  gender: "male" | "female";
  face: number;
  skinColor: number;
  hairStyle: number;
  hairColor: number;
  beard: number;
}

interface PlayerData {
  nickname: string;
  loginTime: string;
  character?: CharacterData;
}

interface GameState {
  phase: GamePhase;
  playerData: PlayerData | null;
  
  // Actions
  login: (nickname: string) => void;
  createCharacter: (character: CharacterData) => void;
  selectCharacter: (character: CharacterData) => void;
  start: () => void;
  restart: () => void;
  end: () => void;
  logout: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => {
    // Verificar se há auto-login ativo
    const autoLogin = getLocalStorage("autoLogin");
    const currentPlayer = getLocalStorage("currentPlayer");
    const characterData = getLocalStorage("characterData");
    
    const initialPhase: GamePhase = autoLogin && currentPlayer && characterData ? "character-selection" : "login";
    const initialPlayerData = autoLogin && currentPlayer ? {
      ...currentPlayer,
      character: characterData
    } : null;

    return {
      phase: initialPhase,
      playerData: initialPlayerData,
      
      login: (nickname: string) => {
        const existingCharacter = getLocalStorage("characterData");
        const playerData: PlayerData = {
          nickname,
          loginTime: new Date().toISOString(),
          character: existingCharacter
        };
        
        setLocalStorage("currentPlayer", playerData);
        
        set(() => ({
          phase: existingCharacter ? "character-selection" : "character-creation",
          playerData
        }));
      },
      
      createCharacter: (character: CharacterData) => {
        setLocalStorage("characterData", character);
        
        set((state) => ({
          phase: "character-selection",
          playerData: state.playerData ? {
            ...state.playerData,
            character
          } : null
        }));
      },
      
      selectCharacter: (character: CharacterData) => {
        set((state) => ({
          phase: "ready",
          playerData: state.playerData ? {
            ...state.playerData,
            character
          } : null
        }));
      },
      
      start: () => {
        set((state) => {
          // Only transition from ready to playing
          if (state.phase === "ready") {
            return { phase: "playing" };
          }
          return {};
        });
      },
      
      restart: () => {
        set((state) => ({ 
          phase: "ready",
          playerData: state.playerData 
        }));
      },
      
      end: () => {
        set((state) => {
          // Only transition from playing to ended
          if (state.phase === "playing") {
            return { phase: "ended" };
          }
          return {};
        });
      },
      
      logout: () => {
        setLocalStorage("currentPlayer", null);
        setLocalStorage("autoLogin", false);
        setLocalStorage("characterData", null);
        set(() => ({
          phase: "login",
          playerData: null
        }));
      }
    };
  })
);
