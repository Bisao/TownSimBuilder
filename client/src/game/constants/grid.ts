
// Constantes centralizadas do grid
export const GRID_CONFIG = {
  // Tamanho padrão do grid para o jogo
  DEFAULT_SIZE: 50,
  
  // Tamanho para validação de posicionamento de edifícios
  BUILDING_GRID_SIZE: 50,
  
  // Margem das bordas para recursos naturais
  RESOURCE_MARGIN: 8,
  
  // Distância mínima entre recursos naturais
  MIN_RESOURCE_DISTANCE: 3,
  
  // Limites para o editor de mapa
  EDITOR_MIN_SIZE: 10,
  EDITOR_MAX_SIZE: 200,
};

// Função utilitária para validar posições no grid
export const isPositionWithinGrid = (x: number, z: number, gridSize: number = GRID_CONFIG.BUILDING_GRID_SIZE): boolean => {
  return x >= 0 && x < gridSize && z >= 0 && z < gridSize;
};

// Função para validar posições de edifícios
export const canPlaceBuildingAt = (
  x: number, 
  z: number, 
  sizeX: number, 
  sizeZ: number, 
  gridSize: number = GRID_CONFIG.BUILDING_GRID_SIZE
): boolean => {
  return x >= 0 && x + sizeX <= gridSize && z >= 0 && z + sizeZ <= gridSize;
};

// Função para gerar posições válidas para recursos
export const generateValidResourcePosition = (
  gridSize: number = GRID_CONFIG.DEFAULT_SIZE,
  margin: number = GRID_CONFIG.RESOURCE_MARGIN
): [number, number] => {
  const x = Math.round((Math.random() - 0.5) * (gridSize - margin * 2));
  const z = Math.round((Math.random() - 0.5) * (gridSize - margin * 2));
  return [x, z];
};
