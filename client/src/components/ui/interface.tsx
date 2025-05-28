import { useEffect } from "react";
import { useGame } from "@/lib/stores/useGame";
import { Login } from "./login";
import { CharacterCreation } from "./character-creation";
import { CharacterSelection } from "./character-selection";
import App from "@/App";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { Confetti } from "../game/Confetti";
import { VolumeX, Volume2, RotateCw, Trophy } from "lucide-react";

export function Interface() {
  const { phase, login, createCharacter, selectCharacter, logout } = useGame();
  const { isMuted, toggleMute } = useAudio();
  const restart = useGame((state) => state.restart);

  // Handle clicks on the interface in the ready phase to start the game
  useEffect(() => {
    if (phase === "ready") {
      const handleClick = () => {
        document.activeElement?.blur(); // Remove focus from any button
        const event = new KeyboardEvent("keydown", { code: "Space" });
        window.dispatchEvent(event);
      };

      window.addEventListener("click", handleClick);
      return () => window.removeEventListener("click", handleClick);
    }
  }, [phase]);

  // Debug: log current phase
  useEffect(() => {
    console.log("Current game phase:", phase);
  }, [phase]);


  if (phase === "login") {
    return <Login onLogin={login} />;
  }

  if (phase === "character-creation") {
    return (
      <CharacterCreation
        onCharacterCreated={createCharacter}
        onBack={logout}
      />
    );
  }

  if (phase === "character-selection") {
    return (
      <CharacterSelection
        onCharacterSelected={selectCharacter}
        onCreateNewCharacter={() => useGame.setState({ phase: "character-creation" })}
        onBack={logout}
      />
    );
  }

  return <App />;
}