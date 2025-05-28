import { useEffect } from "react";
import { useGame } from "@/lib/stores/useGame";
import { Login } from "./login";
import App from "@/App";
import { useAudio } from "@/lib/stores/useAudio";
import { Button } from "./button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./card";
import { VolumeX, Volume2, RotateCw, Trophy } from "lucide-react";

export function Interface() {
  const { phase, login, logout } = useGame();
  const { isMuted, toggleMute } = useAudio();
  const restart = useGame((state) => state.restart);

  

  // Debug: log current phase
  useEffect(() => {
    console.log("Current game phase:", phase);
  }, [phase]);


  if (phase === "login") {
    return <Login onLogin={login} />;
  }

  if (phase === "playing") {
    return <App />;
  }

  if (phase === "ended") {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-background text-foreground">
        <Card className="w-96 bg-gradient-to-b from-amber-950/90 to-red-950/90 border-2 border-amber-600/50">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-amber-300 flex items-center justify-center gap-2">
              <Trophy className="w-8 h-8" />
              Game Over
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-amber-200">
              Obrigado por jogar!
            </div>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              onClick={() => useGame.getState().restart()}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold border border-green-400"
            >
              <RotateCw className="w-4 h-4 mr-2" />
              Jogar Novamente
            </Button>
            <Button
              onClick={logout}
              className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-500 hover:to-gray-600 text-white font-bold border border-gray-400"
            >
              Sair
            </Button>
            <Button
              onClick={toggleMute}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold border border-purple-400 px-3"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return <Login onLogin={login} />;
}