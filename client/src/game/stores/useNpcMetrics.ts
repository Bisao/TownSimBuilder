
interface NPCMetrics {
  totalResourcesCollected: Record<string, number>;
  totalWorkTime: number;
  totalIdleTime: number;
  efficiency: number;
  lastHourProduction: Record<string, number>;
}

interface NPCMetricsState {
  metrics: Record<string, NPCMetrics>;
  
  updateMetrics: (npcId: string, action: string, resourceType?: string) => void;
  getProductionRate: (npcId: string, resourceType: string) => number;
  getOverallEfficiency: () => number;
  generateReport: () => string;
}

export const useNpcMetrics = create<NPCMetricsState>((set, get) => ({
  metrics: {},

  updateMetrics: (npcId, action, resourceType) => {
    const state = get();
    const currentMetrics = state.metrics[npcId] || {
      totalResourcesCollected: {},
      totalWorkTime: 0,
      totalIdleTime: 0,
      efficiency: 0,
      lastHourProduction: {}
    };

    if (action === "collect" && resourceType) {
      currentMetrics.totalResourcesCollected[resourceType] = 
        (currentMetrics.totalResourcesCollected[resourceType] || 0) + 1;
      
      // Atualiza produção da última hora
      currentMetrics.lastHourProduction[resourceType] = 
        (currentMetrics.lastHourProduction[resourceType] || 0) + 1;
    }

    set({
      metrics: {
        ...state.metrics,
        [npcId]: currentMetrics
      }
    });
  },

  getProductionRate: (npcId, resourceType) => {
    const metrics = get().metrics[npcId];
    if (!metrics) return 0;
    
    return metrics.lastHourProduction[resourceType] || 0;
  },

  getOverallEfficiency: () => {
    const state = get();
    const allMetrics = Object.values(state.metrics);
    
    if (allMetrics.length === 0) return 0;
    
    const avgEfficiency = allMetrics.reduce((sum, m) => sum + m.efficiency, 0) / allMetrics.length;
    return avgEfficiency;
  },

  generateReport: () => {
    const state = get();
    const npcs = Object.keys(state.metrics);
    
    let report = "=== RELATÓRIO DE PERFORMANCE DOS NPCs ===\n\n";
    
    npcs.forEach(npcId => {
      const metrics = state.metrics[npcId];
      report += `NPC ${npcId}:\n`;
      report += `  Recursos coletados: ${JSON.stringify(metrics.totalResourcesCollected)}\n`;
      report += `  Eficiência: ${metrics.efficiency.toFixed(2)}%\n`;
      report += `  Produção última hora: ${JSON.stringify(metrics.lastHourProduction)}\n\n`;
    });
    
    report += `Eficiência geral: ${get().getOverallEfficiency().toFixed(2)}%`;
    
    return report;
  }
}));
