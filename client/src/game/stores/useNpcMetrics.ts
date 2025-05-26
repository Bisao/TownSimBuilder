
import { create } from "zustand";

interface NPCMetrics {
  // Recursos coletados por tipo
  totalResourcesCollected: Record<string, number>;
  
  // Tempo de atividades (em segundos)
  totalWorkTime: number;
  totalRestTime: number;
  totalTravelTime: number;
  totalIdleTime: number;
  
  // Performance
  efficiency: number;
  
  // Produção por hora
  lastHourProduction: Record<string, number>;
  
  // Sessão atual
  sessionStartTime: number;
  currentActivityStartTime: number;
  currentActivity: string;
  
  // Histórico diário
  dailyStats: {
    date: string;
    hoursWorked: number;
    hoursRested: number;
    resourcesCollected: Record<string, number>;
    efficiency: number;
  }[];
  
  // Estatísticas de vida
  totalDaysActive: number;
  averageProductionPerDay: Record<string, number>;
  bestProductionDay: Record<string, number>;
}

interface NPCMetricsState {
  metrics: Record<string, NPCMetrics>;
  
  // Actions
  initializeNPC: (npcId: string) => void;
  updateActivity: (npcId: string, newActivity: string) => void;
  recordResourceCollection: (npcId: string, resourceType: string, amount?: number) => void;
  updateEfficiency: (npcId: string, efficiency: number) => void;
  generateDailyReport: (npcId: string) => void;
  
  // Getters
  getWorkHours: (npcId: string) => number;
  getRestHours: (npcId: string) => number;
  getTotalResourcesCollected: (npcId: string, resourceType?: string) => number;
  getProductionRate: (npcId: string, resourceType: string) => number;
  getOverallEfficiency: () => number;
  generateReport: () => string;
  generateDetailedReport: (npcId: string) => string;
}

const createDefaultMetrics = (): NPCMetrics => ({
  totalResourcesCollected: {},
  totalWorkTime: 0,
  totalRestTime: 0,
  totalTravelTime: 0,
  totalIdleTime: 0,
  efficiency: 0,
  lastHourProduction: {},
  sessionStartTime: Date.now(),
  currentActivityStartTime: Date.now(),
  currentActivity: "idle",
  dailyStats: [],
  totalDaysActive: 0,
  averageProductionPerDay: {},
  bestProductionDay: {}
});

export const useNpcMetrics = create<NPCMetricsState>((set, get) => ({
  metrics: {},

  initializeNPC: (npcId) => {
    const state = get();
    if (!state.metrics[npcId]) {
      set({
        metrics: {
          ...state.metrics,
          [npcId]: createDefaultMetrics()
        }
      });
    }
  },

  updateActivity: (npcId, newActivity) => {
    const state = get();
    const currentMetrics = state.metrics[npcId];
    
    if (!currentMetrics) {
      get().initializeNPC(npcId);
      return get().updateActivity(npcId, newActivity);
    }

    const now = Date.now();
    const timeDiff = (now - currentMetrics.currentActivityStartTime) / 1000; // em segundos

    // Atualizar tempo da atividade anterior
    const updatedMetrics = { ...currentMetrics };
    
    switch (currentMetrics.currentActivity) {
      case "working":
      case "gathering":
        updatedMetrics.totalWorkTime += timeDiff;
        break;
      case "resting":
        updatedMetrics.totalRestTime += timeDiff;
        break;
      case "moving":
        updatedMetrics.totalTravelTime += timeDiff;
        break;
      case "idle":
      case "searching":
        updatedMetrics.totalIdleTime += timeDiff;
        break;
    }

    // Atualizar para nova atividade
    updatedMetrics.currentActivity = newActivity;
    updatedMetrics.currentActivityStartTime = now;

    set({
      metrics: {
        ...state.metrics,
        [npcId]: updatedMetrics
      }
    });
  },

  recordResourceCollection: (npcId, resourceType, amount = 1) => {
    const state = get();
    const currentMetrics = state.metrics[npcId] || createDefaultMetrics();

    const updatedMetrics = {
      ...currentMetrics,
      totalResourcesCollected: {
        ...currentMetrics.totalResourcesCollected,
        [resourceType]: (currentMetrics.totalResourcesCollected[resourceType] || 0) + amount
      },
      lastHourProduction: {
        ...currentMetrics.lastHourProduction,
        [resourceType]: (currentMetrics.lastHourProduction[resourceType] || 0) + amount
      }
    };

    set({
      metrics: {
        ...state.metrics,
        [npcId]: updatedMetrics
      }
    });
  },

  updateEfficiency: (npcId, efficiency) => {
    const state = get();
    const currentMetrics = state.metrics[npcId];
    
    if (currentMetrics) {
      set({
        metrics: {
          ...state.metrics,
          [npcId]: {
            ...currentMetrics,
            efficiency
          }
        }
      });
    }
  },

  generateDailyReport: (npcId) => {
    const state = get();
    const metrics = state.metrics[npcId];
    
    if (!metrics) return;

    const today = new Date().toDateString();
    const hoursWorked = metrics.totalWorkTime / 3600; // converter para horas
    const hoursRested = metrics.totalRestTime / 3600;

    const dailyStat = {
      date: today,
      hoursWorked,
      hoursRested,
      resourcesCollected: { ...metrics.totalResourcesCollected },
      efficiency: metrics.efficiency
    };

    const updatedDailyStats = [...metrics.dailyStats];
    const existingDayIndex = updatedDailyStats.findIndex(stat => stat.date === today);
    
    if (existingDayIndex >= 0) {
      updatedDailyStats[existingDayIndex] = dailyStat;
    } else {
      updatedDailyStats.push(dailyStat);
    }

    set({
      metrics: {
        ...state.metrics,
        [npcId]: {
          ...metrics,
          dailyStats: updatedDailyStats,
          totalDaysActive: updatedDailyStats.length
        }
      }
    });
  },

  getWorkHours: (npcId) => {
    const metrics = get().metrics[npcId];
    return metrics ? metrics.totalWorkTime / 3600 : 0;
  },

  getRestHours: (npcId) => {
    const metrics = get().metrics[npcId];
    return metrics ? metrics.totalRestTime / 3600 : 0;
  },

  getTotalResourcesCollected: (npcId, resourceType) => {
    const metrics = get().metrics[npcId];
    if (!metrics) return 0;
    
    if (resourceType) {
      return metrics.totalResourcesCollected[resourceType] || 0;
    }
    
    return Object.values(metrics.totalResourcesCollected).reduce((sum, amount) => sum + amount, 0);
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
    
    let report = "=== RELATÓRIO GERAL DE PERFORMANCE ===\n\n";
    
    npcs.forEach(npcId => {
      const metrics = state.metrics[npcId];
      const workHours = (metrics.totalWorkTime / 3600).toFixed(1);
      const restHours = (metrics.totalRestTime / 3600).toFixed(1);
      const totalResources = Object.values(metrics.totalResourcesCollected).reduce((sum, amount) => sum + amount, 0);
      
      report += `NPC ${npcId}:\n`;
      report += `  Horas trabalhadas: ${workHours}h\n`;
      report += `  Horas de descanso: ${restHours}h\n`;
      report += `  Total de recursos: ${totalResources}\n`;
      report += `  Recursos por tipo: ${JSON.stringify(metrics.totalResourcesCollected)}\n`;
      report += `  Eficiência: ${metrics.efficiency.toFixed(1)}%\n`;
      report += `  Dias ativos: ${metrics.totalDaysActive}\n\n`;
    });
    
    report += `Eficiência geral: ${get().getOverallEfficiency().toFixed(1)}%`;
    
    return report;
  },

  generateDetailedReport: (npcId) => {
    const metrics = get().metrics[npcId];
    if (!metrics) return "NPC não encontrado";

    const workHours = (metrics.totalWorkTime / 3600).toFixed(1);
    const restHours = (metrics.totalRestTime / 3600).toFixed(1);
    const travelHours = (metrics.totalTravelTime / 3600).toFixed(1);
    const idleHours = (metrics.totalIdleTime / 3600).toFixed(1);
    const totalHours = (metrics.totalWorkTime + metrics.totalRestTime + metrics.totalTravelTime + metrics.totalIdleTime) / 3600;

    let report = `=== RELATÓRIO DETALHADO - NPC ${npcId} ===\n\n`;
    
    report += `TEMPO DE ATIVIDADES:\n`;
    report += `  Trabalho: ${workHours}h (${((metrics.totalWorkTime / 3600 / totalHours) * 100).toFixed(1)}%)\n`;
    report += `  Descanso: ${restHours}h (${((metrics.totalRestTime / 3600 / totalHours) * 100).toFixed(1)}%)\n`;
    report += `  Viagem: ${travelHours}h (${((metrics.totalTravelTime / 3600 / totalHours) * 100).toFixed(1)}%)\n`;
    report += `  Idle: ${idleHours}h (${((metrics.totalIdleTime / 3600 / totalHours) * 100).toFixed(1)}%)\n`;
    report += `  Total: ${totalHours.toFixed(1)}h\n\n`;

    report += `RECURSOS COLETADOS:\n`;
    Object.entries(metrics.totalResourcesCollected).forEach(([type, amount]) => {
      const rate = totalHours > 0 ? (amount / totalHours).toFixed(2) : '0';
      report += `  ${type}: ${amount} (${rate}/hora)\n`;
    });

    report += `\nPERFORMANCE:\n`;
    report += `  Eficiência atual: ${metrics.efficiency.toFixed(1)}%\n`;
    report += `  Dias ativos: ${metrics.totalDaysActive}\n`;

    if (metrics.dailyStats.length > 0) {
      const lastDay = metrics.dailyStats[metrics.dailyStats.length - 1];
      report += `  Último dia:\n`;
      report += `    Horas trabalhadas: ${lastDay.hoursWorked.toFixed(1)}h\n`;
      report += `    Horas descansadas: ${lastDay.hoursRested.toFixed(1)}h\n`;
      report += `    Recursos coletados: ${JSON.stringify(lastDay.resourcesCollected)}\n`;
    }

    return report;
  }
}));
