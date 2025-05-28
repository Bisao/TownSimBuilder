import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

export type GamePhase = "login" | "playing" | "ended";

interface PlayerData {
  nickname: string;
  loginTime: string;
}

interface GameState {
  phase: GamePhase;
  playerData: PlayerData | null;
  
  // Actions
  login: (nickname: string) => void;
  start: () => void;
  restart: () => void;
  end: () => void;
  logout: () => void;
}

export const useGame = create<GameState>()(
  subscribeWithSelector((set, get) => {
    // Sempre começar na tela de login, independente dos dados salvos
    const initialPhase: GamePhase = "login";
    const initialPlayerData = null;

    return {
      phase: initialPhase,
      playerData: initialPlayerData,
      
      login: (nickname: string) => {
        const playerData: PlayerData = {
          nickname,
          loginTime: new Date().toISOString()
        };
        
        setLocalStorage("currentPlayer", playerData);
        
        set(() => ({
          phase: "playing",
          playerData
        }));
      },
      
      start: () => {
        set(() => ({ phase: "playing" }));
      },
      
      restart: () => {
        set((state) => ({ 
          phase: "playing",
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
        set(() => ({
          phase: "login",
          playerData: null
        }));
      }
    };
  })
);
