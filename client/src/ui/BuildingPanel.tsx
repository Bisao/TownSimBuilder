
import React, { useState, useMemo } from 'react';
import { useBuildingStore } from '../game/stores/useBuildingStore';
import { useResourceStore } from '../game/stores/useResourceStore';
import { buildingTypes, BuildingType } from '../game/constants/buildings';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { X, Building, Hammer, Coins, Zap } from 'lucide-react';

interface BuildingPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const BuildingPanel: React.FC<BuildingPanelProps> = ({ isVisible, onClose }) => {
  const buildingStore = useBuildingStore();
  const { 
    buildings = [], 
    placeBuilding = () => {}, 
    selectedBuildingType = null, 
    setSelectedBuildingType = () => {} 
  } = buildingStore || {};

  const resourceStore = useResourceStore();
  const { resources = {} } = resourceStore || {};

  // Group buildings by type for display
  const buildingsByType = useMemo(() => {
    const grouped: Record<string, any[]> = {};

    if (Array.isArray(buildings)) {
      buildings.filter(b => b && b.type).forEach(building => {
        if (!grouped[building.type]) {
          grouped[building.type] = [];
        }
        grouped[building.type].push(building);
      });
    }

    return grouped;
  }, [buildings]);

  if (!isVisible) return null;

  return (
    <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white border border-gray-200 rounded-lg shadow-md">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Construções
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent>
          <div className="mb-4">
            <Badge variant="secondary">
              <Hammer className="h-4 w-4 mr-2" />
              Modo Construção
            </Badge>
          </div>

          <div className="space-y-4">
            {Object.entries(buildingTypes).map(([buildingType, building]) => (
              <div key={buildingType} className="p-3 border rounded-lg bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <Building className="h-4 w-4 mr-2" />
                    <span className="font-medium">{building.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      <Coins className="h-4 w-4 mr-1" />
                      {building.cost.coins}
                    </Badge>
                    <Badge variant="outline">
                      <Zap className="h-4 w-4 mr-1" />
                      {building.cost.energy}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    Construídas: {buildingsByType[buildingType]?.length || 0}
                  </span>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => placeBuilding(buildingType)}
                  >
                    Construir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BuildingPanel;
