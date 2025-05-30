import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNpcStore } from '../game/stores/useNpcStore';
import { useNotificationStore } from '../lib/stores/useNotificationStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { X, Users, TrendingUp, Activity, Clock } from 'lucide-react';

interface NpcMetricsPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const NpcMetricsPanel: React.FC<NpcMetricsPanelProps> = ({ isVisible, onClose }) => {
  const npcStore = useNpcStore();
  const { npcs = [] } = npcStore || {};
  const { addNotification } = useNotificationStore();

  const [selectedNpcId, setSelectedNpcId] = useState<string | null>(null);
  const [hasShownNoNpcsMessage, setHasShownNoNpcsMessage] = useState(false);

  // Show notification when no NPCs are found, but only once
  useEffect(() => {
    if (!npcs || npcs.length === 0) {
      if (!hasShownNoNpcsMessage) {
        addNotification({
          id: `no-npcs-${Date.now()}`,
          type: 'info',
          message: 'Nenhum NPC encontrado',
          duration: 3000
        });
        setHasShownNoNpcsMessage(true);
      }
    } else {
      setHasShownNoNpcsMessage(false);
    }
  }, [npcs, addNotification, hasShownNoNpcsMessage]);

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!npcs || npcs.length === 0) {
      return {
        total: 0,
        byRole: {},
        byStatus: {},
        averageLevel: 0,
        totalExperience: 0
      };
    }

    const total = npcs.length;
    const byRole: { [role: string]: number } = {};
    const byStatus: { [status: string]: number } = {};
    let totalLevel = 0;
    let totalExperience = 0;

    npcs.forEach(npc => {
      const { role, status, level, experience } = npc;

      byRole[role] = (byRole[role] || 0) + 1;
      byStatus[status] = (byStatus[status] || 0) + 1;
      totalLevel += level;
      totalExperience += experience;
    });

    const averageLevel = total > 0 ? totalLevel / total : 0;

    return {
      total,
      byRole,
      byStatus,
      averageLevel,
      totalExperience
    };
  }, [npcs]);

  // Handlers
  const handleNpcSelection = useCallback((npcId: string) => {
    setSelectedNpcId(prevId => (prevId === npcId ? null : npcId));
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">
            NPC Metrics
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">

            {/* Total NPCs */}
            <div className="flex items-center space-x-4">
              <Users className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total NPCs
                </p>
                <p className="text-2xl font-bold">{metrics.total}</p>
              </div>
            </div>

            {/* Metrics by Role */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">By Role</h3>
              <div className="space-y-2">
                {Object.entries(metrics.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-gray-600">{role}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Metrics by Status */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">By Status</h3>
              <div className="space-y-2">
                {Object.entries(metrics.byStatus).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <span className="text-gray-600">{status}</span>
                    <Badge variant="secondary">{count}</Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* Average Level */}
            <div className="flex items-center space-x-4">
              <TrendingUp className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Average Level
                </p>
                <p className="text-2xl font-bold">{metrics.averageLevel.toFixed(1)}</p>
              </div>
            </div>

            {/* Total Experience */}
            <div className="flex items-center space-x-4">
              <Activity className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Total Experience
                </p>
                <p className="text-2xl font-bold">{metrics.totalExperience}</p>
              </div>
            </div>

            {/* Activity History (Placeholder) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                Activity History
              </h3>
              <p className="text-gray-500 text-sm">
                (Coming Soon: Charts and historical data of NPC activities.)
              </p>
            </div>

            {/* NPC Selection */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Select NPC</h3>
              <div className="space-y-2">
                {npcs && npcs.map(npc => (
                  <Button
                    key={npc.id}
                    variant={selectedNpcId === npc.id ? "secondary" : "outline"}
                    className="w-full justify-start"
                    onClick={() => handleNpcSelection(npc.id)}
                  >
                    {npc.name} - {npc.role}
                  </Button>
                ))}
              </div>
            </div>

            {/* Display details of the selected NPC */}
            {selectedNpcId && (
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Details for {npcs.find(npc => npc.id === selectedNpcId)?.name}
                </h3>
                {/* Add more details here */}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NpcMetricsPanel;