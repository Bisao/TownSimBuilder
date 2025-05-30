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

  return (
    
      
        
          
            
              <Building className="h-4 w-4 mr-2" />
              Construções
            
            
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            
          
          
            <Badge variant="secondary">
              <Hammer className="h-4 w-4 mr-2" />
              Modo Construção
            </Badge>
          
        

        
          
            {Object.entries(buildingTypes).map(([buildingType, building]) => (
              
                
                  <Building className="h-4 w-4 mr-2" />
                  {building.name}
                
                
                  <Badge variant="outline">
                    <Coins className="h-4 w-4 mr-2" />
                    {building.cost.coins}
                  </Badge>
                  <Badge variant="outline">
                    <Zap className="h-4 w-4 mr-2" />
                    {building.cost.energy}
                  </Badge>
                
                
                  {buildingsByType[buildingType]?.length || 0}
                
                
                  <Button variant="secondary" onClick={() => placeBuilding(buildingType)}>
                    Construir
                  </Button>
                
              
            ))}
          
        
      
    
  );
};

export default BuildingPanel;