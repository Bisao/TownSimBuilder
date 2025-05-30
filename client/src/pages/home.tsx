
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Settings, Users, Trophy, Info } from 'lucide-react';
import { useGame } from '@/lib/stores/useGame';

export default function HomePage() {
  const navigate = useNavigate();
  const { login } = useGame();

  const handleStartGame = () => {
    login('player'); // Login automático para simplificar
    navigate('/game');
  };

  const features = [
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gerenciamento de NPCs",
      description: "Controle aldeões, mineradores e outros personagens"
    },
    {
      icon: <Trophy className="w-6 h-6" />,
      title: "Sistema de Habilidades",
      description: "Desenvolva habilidades e especializações"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Construção e Recursos",
      description: "Construa edifícios e gerencie recursos"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4 pt-8">
          <h1 className="text-5xl font-bold text-amber-200">
            Medieval Sim
          </h1>
          <p className="text-xl text-amber-300/80 max-w-2xl mx-auto">
            Construa sua aldeia medieval, gerencie recursos e desenvolva uma civilização próspera
          </p>
          <Badge variant="secondary" className="bg-amber-600/20 text-amber-300 border-amber-600/50">
            Versão Alpha 0.1.0
          </Badge>
        </div>

        {/* Main Action */}
        <div className="flex justify-center">
          <Card className="w-full max-w-md bg-black/80 border-amber-600/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl text-amber-200">Iniciar Jogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button
                onClick={handleStartGame}
                className="w-full bg-amber-600 hover:bg-amber-700 text-black font-medium text-lg py-3"
              >
                <Play className="w-5 h-5 mr-2" />
                Jogar Agora
              </Button>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => navigate('/settings')}
                  variant="outline"
                  className="border-amber-600/50 text-amber-200 hover:bg-amber-600/20"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </Button>
                
                <Button
                  onClick={() => navigate('/help')}
                  variant="outline"
                  className="border-amber-600/50 text-amber-200 hover:bg-amber-600/20"
                >
                  <Info className="w-4 h-4 mr-2" />
                  Ajuda
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="bg-black/60 border-amber-600/30 backdrop-blur-sm">
              <CardContent className="p-6 text-center space-y-3">
                <div className="flex justify-center text-amber-400">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-amber-200">
                  {feature.title}
                </h3>
                <p className="text-sm text-amber-300/70">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center text-amber-400/60 text-sm">
          <p>Medieval Sim - Desenvolvido com React & Three.js</p>
        </div>
      </div>
    </div>
  );
}
