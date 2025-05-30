
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Book, 
  Gamepad2, 
  Users, 
  Hammer, 
  Coins,
  Keyboard,
  Mouse,
  Info
} from 'lucide-react';

export default function HelpPage() {
  const navigate = useNavigate();

  const controls = [
    { key: 'WASD', description: 'Mover câmera' },
    { key: 'Mouse', description: 'Rotacionar câmera' },
    { key: 'Scroll', description: 'Zoom in/out' },
    { key: 'Click', description: 'Selecionar objeto' },
    { key: 'Shift + Click', description: 'Múltipla seleção' },
    { key: 'Space', description: 'Pausar/Continuar' },
    { key: 'Esc', description: 'Cancelar ação' },
  ];

  const gameplayTips = [
    {
      title: "Começando",
      icon: <Info className="w-5 h-5" />,
      tips: [
        "Comece construindo casas para seus aldeões",
        "Colete recursos básicos: madeira, pedra e comida",
        "Mantenha seus NPCs alimentados e felizes"
      ]
    },
    {
      title: "Construção",
      icon: <Hammer className="w-5 h-5" />,
      tips: [
        "Construa silos para armazenar recursos",
        "Posicione edifícios estrategicamente",
        "Upgrade edifícios para melhorar eficiência"
      ]
    },
    {
      title: "NPCs",
      icon: <Users className="w-5 h-5" />,
      tips: [
        "Atribua tarefas específicas aos NPCs",
        "Treine NPCs em diferentes habilidades",
        "Monitore a felicidade e energia dos NPCs"
      ]
    },
    {
      title: "Economia",
      icon: <Coins className="w-5 h-5" />,
      tips: [
        "Balance produção e consumo de recursos",
        "Use o mercado para trocar recursos",
        "Invista em pesquisas para novas tecnologias"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            size="sm"
            className="border-amber-600/50 text-amber-200 hover:bg-amber-600/20"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-amber-200">Ajuda & Tutorial</h1>
        </div>

        <Tabs defaultValue="controls" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-black/50 border border-amber-600/30">
            <TabsTrigger 
              value="controls" 
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-black text-amber-200"
            >
              <Keyboard className="w-4 h-4 mr-2" />
              Controles
            </TabsTrigger>
            <TabsTrigger 
              value="gameplay" 
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-black text-amber-200"
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Gameplay
            </TabsTrigger>
            <TabsTrigger 
              value="tutorial" 
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-black text-amber-200"
            >
              <Book className="w-4 h-4 mr-2" />
              Tutorial
            </TabsTrigger>
          </TabsList>

          <TabsContent value="controls" className="space-y-6">
            <Card className="bg-black/80 border-amber-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-200">Controles do Jogo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {controls.map((control, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-amber-900/20 rounded-lg">
                      <Badge variant="outline" className="border-amber-600/50 text-amber-300">
                        {control.key}
                      </Badge>
                      <span className="text-amber-200">{control.description}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gameplay" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gameplayTips.map((section, index) => (
                <Card key={index} className="bg-black/80 border-amber-600/50 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="text-amber-200 flex items-center space-x-2">
                      {section.icon}
                      <span>{section.title}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-amber-300/80 text-sm flex items-start space-x-2">
                          <span className="text-amber-400 mt-1">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="tutorial" className="space-y-6">
            <Card className="bg-black/80 border-amber-600/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-amber-200">Tutorial Interativo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-amber-300/80">
                  Aprenda a jogar Medieval Sim com nosso tutorial passo a passo.
                </p>
                
                <div className="space-y-3">
                  <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-600/30">
                    <h3 className="text-lg font-semibold text-amber-200 mb-2">
                      Passo 1: Primeiros Passos
                    </h3>
                    <p className="text-amber-300/70 text-sm">
                      Comece explorando o mundo e coletando recursos básicos. 
                      Use WASD para mover a câmera e o mouse para olhar ao redor.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-600/30">
                    <h3 className="text-lg font-semibold text-amber-200 mb-2">
                      Passo 2: Primeira Construção
                    </h3>
                    <p className="text-amber-300/70 text-sm">
                      Abra o painel de construção e coloque sua primeira casa. 
                      Certifique-se de ter recursos suficientes.
                    </p>
                  </div>
                  
                  <div className="p-4 bg-amber-900/20 rounded-lg border border-amber-600/30">
                    <h3 className="text-lg font-semibold text-amber-200 mb-2">
                      Passo 3: Gerenciando NPCs
                    </h3>
                    <p className="text-amber-300/70 text-sm">
                      Crie seus primeiros NPCs e atribua tarefas. 
                      Monitore suas necessidades através do painel de NPCs.
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={() => navigate('/game')}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-black font-medium"
                >
                  Iniciar Tutorial no Jogo
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
