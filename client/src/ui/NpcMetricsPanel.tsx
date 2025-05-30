
import React, { useState } from 'react';
import { useNpcStore } from '../game/stores/useNpcStore';
import { useNpcMetrics } from '../game/stores/useNpcMetrics';
import { useDraggable } from '../hooks/useDraggable';
import { useIsMobile } from '../hooks/useIsMobile';

interface NpcMetricsPanelProps {
  isVisible: boolean;
  onClose?: () => void;
}

const NpcMetricsPanel: React.FC<NpcMetricsPanelProps> = ({ isVisible, onClose }) => {
  const { npcs } = useNpcStore();
  const metrics = useNpcMetrics();
  const isMobile = useIsMobile();
  
  const [selectedTab, setSelectedTab] = useState<'overview' | 'individual' | 'performance'>('overview');

  const { dragRef, position, isDragging, handleMouseDown } = useDraggable({
    initialPosition: { x: window.innerWidth - 400, y: 200 },
    disabled: isMobile
  });

  const tabs = {
    overview: { label: 'Visão Geral', icon: 'fa-chart-bar' },
    individual: { label: 'Individual', icon: 'fa-users' },
    performance: { label: 'Performance', icon: 'fa-trophy' }
  };

  const getStateColor = (state: string) => {
    const colorMap: Record<string, string> = {
      working: 'text-green-600',
      moving: 'text-blue-600',
      resting: 'text-yellow-600',
      idle: 'text-gray-600',
      gathering: 'text-purple-600'
    };
    return colorMap[state] || 'text-gray-600';
  };

  const getStateIcon = (state: string) => {
    const iconMap: Record<string, string> = {
      working: 'fa-hammer',
      moving: 'fa-walking',
      resting: 'fa-bed',
      idle: 'fa-pause-circle',
      gathering: 'fa-hand-paper'
    };
    return iconMap[state] || 'fa-question-circle';
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const renderOverviewTab = () => (
    <div className="space-y-4">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-users text-blue-600"></i>
            <span className="text-sm text-gray-600">Total NPCs</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{metrics.totalNpcs}</div>
        </div>

        <div className="bg-white/50 rounded-lg p-3 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-hammer text-green-600"></i>
            <span className="text-sm text-gray-600">Trabalhando</span>
          </div>
          <div className="text-2xl font-bold text-gray-800">{metrics.workingNpcs}</div>
        </div>
      </div>

      {/* State Distribution */}
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-chart-pie"></i>
          Distribuição de Estados
        </h3>
        
        <div className="space-y-2">
          {Object.entries(metrics.stateDistribution).map(([state, count]) => {
            const percentage = metrics.totalNpcs > 0 ? (count / metrics.totalNpcs) * 100 : 0;
            
            return (
              <div key={state} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <i className={`fa-solid ${getStateIcon(state)} ${getStateColor(state)}`}></i>
                  <span className="text-sm text-gray-700 capitalize">{state}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${getStateColor(state).replace('text-', 'bg-')}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Work Distribution */}
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-briefcase"></i>
          Distribuição de Trabalhos
        </h3>
        
        <div className="space-y-2">
          {Object.entries(metrics.workDistribution).map(([work, count]) => {
            const percentage = metrics.totalNpcs > 0 ? (count / metrics.totalNpcs) * 100 : 0;
            
            return (
              <div key={work} className="flex items-center justify-between">
                <span className="text-sm text-gray-700 capitalize">{work || 'Sem trabalho'}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600 w-8">{count}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-tachometer-alt"></i>
          Eficiência Geral
        </h3>
        
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Produtividade</span>
              <span className="font-medium">{formatPercentage(metrics.averageEfficiency)}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                style={{ width: `${metrics.averageEfficiency * 100}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Taxa de Trabalho</span>
              <span className="font-medium">{formatPercentage(metrics.workingNpcs / metrics.totalNpcs)}</span>
            </div>
            <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-500"
                style={{ width: `${(metrics.workingNpcs / metrics.totalNpcs) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderIndividualTab = () => (
    <div className="space-y-3">
      {npcs.length === 0 ? (
        <div className="text-center py-8">
          <i className="fa-solid fa-users text-4xl text-gray-400 mb-3"></i>
          <p className="text-gray-500">Nenhum NPC encontrado</p>
        </div>
      ) : (
        npcs.map((npc) => (
          <div key={npc.id} className="bg-white/50 rounded-lg p-3 backdrop-blur-sm 
                                     hover:bg-white/70 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 
                              rounded-full flex items-center justify-center">
                  <i className="fa-solid fa-user text-white text-sm"></i>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-800 text-sm">{npc.name}</h4>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <i className={`fa-solid ${getStateIcon(npc.state)} ${getStateColor(npc.state)}`}></i>
                    <span className="capitalize">{npc.state}</span>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  {npc.assignedWork || 'Sem trabalho'}
                </div>
                {npc.workProgress > 0 && (
                  <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden mt-1">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300"
                      style={{ width: `${npc.workProgress * 100}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderPerformanceTab = () => (
    <div className="space-y-4">
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-medal"></i>
          Top Performers
        </h3>
        
        {/* This would show top performing NPCs based on various metrics */}
        <div className="text-center py-4 text-gray-500 text-sm">
          Métricas de performance em desenvolvimento
        </div>
      </div>
      
      <div className="bg-white/50 rounded-lg p-4 backdrop-blur-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <i className="fa-solid fa-clock"></i>
          Histórico de Atividade
        </h3>
        
        <div className="text-center py-4 text-gray-500 text-sm">
          Gráficos de atividade em desenvolvimento
        </div>
      </div>
    </div>
  );

  if (!isVisible) return null;

  return (
    <div
      ref={dragRef}
      className={`
        npc-metrics-panel fixed z-40 
        ${isMobile 
          ? 'inset-x-4 top-20 max-h-96' 
          : 'w-96 max-h-screen'
        }
        ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}
      `}
      style={!isMobile ? { 
        left: `${position.x}px`, 
        top: `${position.y}px` 
      } : {}}
    >
      <div className="panel-base bg-glass-bg backdrop-blur-lg border border-glass-border 
                      rounded-xl shadow-lg overflow-hidden">
        {/* Header */}
        <div 
          className="panel-header bg-gradient-to-r from-blue-600 to-indigo-600 
                     p-4 cursor-grab active:cursor-grabbing"
          onMouseDown={!isMobile ? handleMouseDown : undefined}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <i className="fa-solid fa-users text-white text-lg"></i>
              </div>
              <h2 className="text-lg font-bold text-white">NPCs</h2>
            </div>
            
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-lg 
                         flex items-center justify-center transition-colors duration-200"
                aria-label="Fechar painel de NPCs"
              >
                <i className="fa-solid fa-times text-white"></i>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="px-4 pt-4">
          <div className="flex gap-1 bg-white/20 rounded-lg p-1 backdrop-blur-sm">
            {Object.entries(tabs).map(([key, tab]) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`
                  flex-1 px-2 py-1.5 rounded-md text-xs font-medium transition-all duration-200
                  flex items-center justify-center gap-1
                  ${selectedTab === key 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                  }
                `}
              >
                <i className={`fa-solid ${tab.icon}`}></i>
                {!isMobile && <span>{tab.label}</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="panel-content p-4 max-h-96 overflow-y-auto custom-scrollbar">
          {selectedTab === 'overview' && renderOverviewTab()}
          {selectedTab === 'individual' && renderIndividualTab()}
          {selectedTab === 'performance' && renderPerformanceTab()}
        </div>
      </div>
    </div>
  );
};

export default NpcMetricsPanel;
