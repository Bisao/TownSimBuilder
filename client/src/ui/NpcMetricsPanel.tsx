
import React, { useState, useEffect } from 'react';
import { useNpcStore } from '../game/stores/useNpcStore';

interface MetricsData {
  npcId: string;
  type: string;
  resourcesCollected: Record<string, number>;
  efficiency: number;
  currentState: string;
  experience: number;
}

const NpcMetricsPanel: React.FC = () => {
  const { npcs } = useNpcStore();
  const [metricsData, setMetricsData] = useState<MetricsData[]>([]);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  useEffect(() => {
    const updateMetrics = () => {
      const data: MetricsData[] = npcs.map(npc => ({
        npcId: npc.id,
        type: npc.type,
        resourcesCollected: { [npc.inventory.type]: npc.inventory.amount },
        efficiency: npc.skills?.efficiency || 0,
        currentState: npc.state,
        experience: npc.skills?.experience || 0
      }));
      
      setMetricsData(data);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000); // Atualiza a cada 5 segundos
    
    return () => clearInterval(interval);
  }, [npcs]);

  const generateReport = () => {
    let report = "=== RELATÓRIO DE PERFORMANCE ===\n\n";
    
    metricsData.forEach(npc => {
      report += `${npc.type.toUpperCase()} (${npc.npcId}):\n`;
      report += `  Estado: ${npc.currentState}\n`;
      report += `  Experiência: ${npc.experience}\n`;
      report += `  Eficiência: ${npc.efficiency.toFixed(1)}%\n`;
      report += `  Inventário: ${JSON.stringify(npc.resourcesCollected)}\n\n`;
    });

    const avgEfficiency = metricsData.reduce((sum, npc) => sum + npc.efficiency, 0) / metricsData.length;
    report += `Eficiência média: ${avgEfficiency.toFixed(1)}%`;
    
    console.log(report);
    navigator.clipboard?.writeText(report);
    alert("Relatório copiado para o clipboard!");
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg max-w-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Métricas dos NPCs</h3>
        <button
          onClick={generateReport}
          className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
        >
          Gerar Relatório
        </button>
      </div>

      <div className="space-y-3">
        {metricsData.map(npc => (
          <div key={npc.npcId} className="border rounded p-3">
            <div 
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowDetails(showDetails === npc.npcId ? null : npc.npcId)}
            >
              <div>
                <span className="font-medium">{npc.type}</span>
                <span className="text-gray-500 text-sm ml-2">({npc.currentState})</span>
              </div>
              <div className="text-right">
                <div className="text-sm">XP: {npc.experience}</div>
                <div className="text-sm text-blue-600">{npc.efficiency.toFixed(1)}%</div>
              </div>
            </div>
            
            {showDetails === npc.npcId && (
              <div className="mt-2 pt-2 border-t text-sm text-gray-600">
                <div>ID: {npc.npcId}</div>
                <div>Inventário: {Object.entries(npc.resourcesCollected).map(([type, amount]) => 
                  `${type}: ${amount}`
                ).join(', ') || 'Vazio'}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {metricsData.length === 0 && (
        <div className="text-center text-gray-500 py-4">
          Nenhum NPC encontrado
        </div>
      )}
    </div>
  );
};

export default NpcMetricsPanel;
