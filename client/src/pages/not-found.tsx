
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, ArrowLeft, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black/80 border-amber-600/50 backdrop-blur-sm">
        <CardHeader className="text-center space-y-4">
          <div className="text-6xl font-bold text-amber-400">404</div>
          <CardTitle className="text-2xl text-amber-200">Página Não Encontrada</CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-amber-300/80">
              A página que você está procurando não existe ou foi movida.
            </p>
            <p className="text-sm text-amber-400/60">
              Verifique o URL ou use a navegação abaixo.
            </p>
          </div>

          <div className="space-y-3">
            <Button
              onClick={() => navigate('/')}
              className="w-full bg-amber-600 hover:bg-amber-700 text-black font-medium"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir para Início
            </Button>
            
            <Button
              onClick={() => navigate(-1)}
              variant="outline"
              className="w-full border-amber-600/50 text-amber-200 hover:bg-amber-600/20"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          </div>

          <div className="pt-4 border-t border-amber-600/30">
            <div className="flex items-center justify-center space-x-2 text-sm text-amber-400/60">
              <Search className="w-4 h-4" />
              <span>Código de erro: 404</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
