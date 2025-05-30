
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Volume2, VolumeX, Monitor, Gamepad2, Save } from 'lucide-react';
import { useAudio } from '@/lib/stores/useAudio';
import { useLocalStorage } from '@/lib/hooks/useLocalStorage';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { volume, isMuted, setVolume, toggleMute } = useAudio();
  
  const [graphics, setGraphics] = useLocalStorage('graphics-quality', 'medium');
  const [showFPS, setShowFPS] = useLocalStorage('show-fps', false);
  const [autoSave, setAutoSave] = useLocalStorage('auto-save', true);
  const [autoSaveInterval, setAutoSaveInterval] = useLocalStorage('auto-save-interval', 5);

  const handleSave = () => {
    // Aqui você pode adicionar lógica para salvar configurações no servidor
    console.log('Configurações salvas');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 p-4">
      <div className="max-w-2xl mx-auto space-y-6">
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
          <h1 className="text-3xl font-bold text-amber-200">Configurações</h1>
        </div>

        {/* Audio Settings */}
        <Card className="bg-black/80 border-amber-600/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center space-x-2">
              <Volume2 className="w-5 h-5" />
              <span>Áudio</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-amber-300">Volume Principal</Label>
                <span className="text-amber-400">{Math.round(volume * 100)}%</span>
              </div>
              <Slider
                value={[volume]}
                onValueChange={(value) => setVolume(value[0])}
                max={1}
                step={0.1}
                className="w-full"
                disabled={isMuted}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-amber-300">Som Ativado</Label>
              <Switch
                checked={!isMuted}
                onCheckedChange={toggleMute}
              />
            </div>
          </CardContent>
        </Card>

        {/* Graphics Settings */}
        <Card className="bg-black/80 border-amber-600/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center space-x-2">
              <Monitor className="w-5 h-5" />
              <span>Gráficos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label className="text-amber-300">Qualidade Gráfica</Label>
              <div className="grid grid-cols-3 gap-2">
                {['low', 'medium', 'high'].map((quality) => (
                  <Button
                    key={quality}
                    onClick={() => setGraphics(quality)}
                    variant={graphics === quality ? 'default' : 'outline'}
                    className={
                      graphics === quality
                        ? 'bg-amber-600 text-black'
                        : 'border-amber-600/50 text-amber-200 hover:bg-amber-600/20'
                    }
                  >
                    {quality === 'low' ? 'Baixa' : quality === 'medium' ? 'Média' : 'Alta'}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <Label className="text-amber-300">Mostrar FPS</Label>
              <Switch
                checked={showFPS}
                onCheckedChange={setShowFPS}
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card className="bg-black/80 border-amber-600/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-amber-200 flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5" />
              <span>Gameplay</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-amber-300">Auto Save</Label>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            {autoSave && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-amber-300">Intervalo (minutos)</Label>
                  <span className="text-amber-400">{autoSaveInterval}min</span>
                </div>
                <Slider
                  value={[autoSaveInterval]}
                  onValueChange={(value) => setAutoSaveInterval(value[0])}
                  min={1}
                  max={15}
                  step={1}
                  className="w-full"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex space-x-3">
          <Button
            onClick={handleSave}
            className="flex-1 bg-amber-600 hover:bg-amber-700 text-black font-medium"
          >
            <Save className="w-4 h-4 mr-2" />
            Salvar Configurações
          </Button>
          
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="border-amber-600/50 text-amber-200 hover:bg-amber-600/20"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
}
