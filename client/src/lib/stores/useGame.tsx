import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { getLocalStorage, setLocalStorage } from "@/lib/utils";

export type GamePhase = "login" | "ready" | "playing" | "ended";

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
    // Verificar se há auto-login ativo
    const autoLogin = getLocalStorage("autoLogin");
    const currentPlayer = getLocalStorage("currentPlayer");
    
    const initialPhase: GamePhase = autoLogin && currentPlayer ? "ready" : "login";
    const initialPlayerData = autoLogin && currentPlayer ? currentPlayer : null;

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
          phase: "ready",
          playerData
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
        set(() => ({
          phase: "login",
          playerData: null
        }));
      }
    };
  })
);
