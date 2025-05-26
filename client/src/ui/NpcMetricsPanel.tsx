
import React, { useState, useEffect } from 'react';
import { useNpcStore } from '../game/stores/useNpcStore';
import { useNpcMetrics } from '../game/stores/useNpcMetrics';

interface DetailedMetrics {
  npcId: string;
  npcType: string;
  workHours: number;
  restHours: number;
  totalResources: number;
  resourcesByType: Record<string, number>;
  efficiency: number;
  currentState: string;
  currentActivity: string;
  experience: number;
}

const NpcMetricsPanel: React.FC = () => {
  const { npcs } = useNpcStore();
  const { 
    metrics, 
    getWorkHours, 
    getRestHours, 
    getTotalResourcesCollected, 
    generateReport, 
    generateDetailedReport,
    updateActivity,
    initializeNPC
  } = useNpcMetrics();
  
  const [detailedMetrics, setDetailedMetrics] = useState<DetailedMetrics[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);
  const [selectedNpc, setSelectedNpc] = useState<string | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const data: DetailedMetrics[] = npcs.map(npc => {
        // Inicializar métricas se não existir
        if (!metrics[npc.id]) {
          initializeNPC(npc.id);
        }

        // Atualizar atividade atual se mudou
        const currentMetrics = metrics[npc.id];
        if (currentMetrics && currentMetrics.currentActivity !== npc.state) {
          updateActivity(npc.id, npc.state);
        }

        const workHours = getWorkHours(npc.id);
        const restHours = getRestHours(npc.id);
        const totalResources = getTotalResourcesCollected(npc.id);
        
        return {
          npcId: npc.id,
          npcType: npc.type,
          workHours,
          restHours,
          totalResources,
          resourcesByType: currentMetrics?.totalResourcesCollected || {},
          efficiency: npc.skills?.efficiency || 0,
          currentState: npc.state,
          currentActivity: currentMetrics?.currentActivity || npc.state,
          experience: npc.skills?.experience || 0
        };
      });
      
      setDetailedMetrics(data);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 3000); // Atualiza a cada 3 segundos
    
    return () => clearInterval(interval);
  }, [npcs, metrics, getWorkHours, getRestHours, getTotalResourcesCollected, updateActivity, initializeNPC]);

  const handleGenerateReport = () => {
    const report = generateReport();
    console.log(report);
    navigator.clipboard?.writeText(report);
    alert("Relatório geral copiado para o clipboard!");
  };

  const handleGenerateDetailedReport = (npcId: string) => {
    const report = generateDetailedReport(npcId);
    console.log(report);
    navigator.clipboard?.writeText(report);
    alert(`Relatório detalhado do NPC ${npcId} copiado para o clipboard!`);
  };

  const formatTime = (hours: number): string => {
    if (hours < 1) {
      return `${Math.round(hours * 60)}min`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const getStateColor = (state: string): string => {
    switch (state) {
      case 'working':
      case 'gathering':
        return 'text-green-600';
      case 'resting':
        return 'text-blue-600';
      case 'moving':
        return 'text-yellow-600';
      case 'idle':
      case 'searching':
        return 'text-gray-600';
      default:
        return 'text-gray-500';
    }
  };

  const getStateIcon = (state: string): string => {
    switch (state) {
      case 'working':
      case 'gathering':
        return '⚒️';
      case 'resting':
        return '😴';
      case 'moving':
        return '🚶';
      case 'idle':
        return '⏳';
      case 'searching':
        return '🔍';
      default:
        return '❓';
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-md max-h-96 overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Métricas Detalhadas</h3>
        <button
          onClick={handleGenerateReport}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Relatório Geral
        </button>
      </div>

      <div className="space-y-3">
        {detailedMetrics.map(npc => (
          <div key={npc.npcId} className="border rounded p-3">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowDetails(showDetails === npc.npcId ? null : npc.npcId)}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{getStateIcon(npc.currentState)}</span>
                <div>
                  <span className="font-medium">{npc.npcType}</span>
                  <span className={`text-sm ml-2 ${getStateColor(npc.currentState)}`}>
                    ({npc.currentState})
                  </span>
                </div>
              </div>
              <div className="text-right text-sm">
                <div className="text-blue-600 font-medium">⚒️ {formatTime(npc.workHours)}</div>
                <div className="text-green-600">📦 {npc.totalResources}</div>
              </div>
            </div>
            
            {showDetails === npc.npcId && (
              <div className="mt-3 pt-3 border-t space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <div className="text-gray-600">Tempo Trabalhado:</div>
                    <div className="font-medium text-green-700">{formatTime(npc.workHours)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Tempo Descansado:</div>
                    <div className="font-medium text-blue-700">{formatTime(npc.restHours)}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Experiência:</div>
                    <div className="font-medium text-purple-700">{npc.experience} XP</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Eficiência:</div>
                    <div className="font-medium text-orange-700">{npc.efficiency.toFixed(1)}%</div>
                  </div>
                </div>

                <div>
                  <div className="text-gray-600 text-sm mb-1">Recursos Coletados:</div>
                  <div className="text-sm">
                    {Object.entries(npc.resourcesByType).length > 0 
                      ? Object.entries(npc.resourcesByType).map(([type, amount]) => (
                          <div key={type} className="flex justify-between">
                            <span className="capitalize">{type}:</span>
                            <span className="font-medium">{amount}</span>
                          </div>
                        ))
                      : <span className="text-gray-500 italic">Nenhum recurso coletado</span>
                    }
                  </div>
                </div>

                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleGenerateDetailedReport(npc.npcId)}
                    className="flex-1 px-2 py-1 bg-gray-500 text-white rounded text-xs hover:bg-gray-600"
                  >
                    Relatório Detalhado
                  </button>
                </div>

                <div className="text-xs text-gray-500 mt-2">
                  ID: {npc.npcId}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {detailedMetrics.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Nenhum NPC encontrado
        </div>
      )}

      <div className="mt-4 pt-3 border-t text-xs text-gray-600">
        <div className="flex justify-between">
          <span>Total NPCs:</span>
          <span className="font-medium">{detailedMetrics.length}</span>
        </div>
        <div className="flex justify-between">
          <span>Recursos totais:</span>
          <span className="font-medium">
            {detailedMetrics.reduce((sum, npc) => sum + npc.totalResources, 0)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Horas trabalhadas:</span>
          <span className="font-medium">
            {formatTime(detailedMetrics.reduce((sum, npc) => sum + npc.workHours, 0))}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NpcMetricsPanel;
