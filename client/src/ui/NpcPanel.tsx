import { NPC, useNpcStore } from "../game/stores/useNpcStore";
import { npcTypes } from "../game/constants/npcs";
import { useBuildingStore } from "../game/stores/useBuildingStore";

interface NpcPanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const NpcPanel = ({ npc, onClose }: NpcPanelProps) => {
  if (!npc) return null;

  // Inicia ciclo de trabalho automaticamente se estiver idle
  if (npc.state === "idle") {
    const buildings = useBuildingStore.getState().buildings;
    const home = buildings.find(b => b.id === npc.homeId);

    if (home) {
      useNpcStore.setState(state => ({
        npcs: state.npcs.map(n => {
          if (n.id !== npc.id) return n;

          return {
            ...n,
            position: [home.position[0] + 0.5, 0, home.position[1] + 0.5],
            state: "searching",
            workProgress: 0,
            targetResource: null,
            targetPosition: null,
            needs: {
              energy: Math.max(n.needs.energy, 50),
              satisfaction: Math.max(n.needs.satisfaction, 50)
            }
          };
        })
      }));
    }
  }

  const npcType = npcTypes[npc.type];
  const stateTranslations: { [key: string]: string } = {
    idle: "Descansando",
    moving: "Movendo",
    working: "Trabalhando",
    gathering: "Coletando",
    resting: "Descansando",
    searching: "Procurando"
  };

  const handleWorkClick = () => {
    console.log(`Iniciando trabalho para NPC ${npc.type} - Estado atual: ${npc.state}`);

    const buildings = useBuildingStore.getState().buildings;
    const home = buildings.find(b => b.id === npc.homeId);

    if (!home) {
      console.error(`Casa não encontrada para NPC ${npc.id}`);
      return;
    }

    // Usar getState e setState separadamente para garantir a atualização
    const npcStore = useNpcStore.getState();
    const updatedNpcs = npcStore.npcs.map(n => {
      if (n.id !== npc.id) return n;

      console.log(`Atualizando NPC ${n.type}: estado ${n.state} -> idle para buscar recursos`);

      return {
        ...n,
        position: [home.position[0], 0, home.position[1]], // Posição exata da casa
        state: "idle" as const, // Força para idle para que a lógica de busca de recursos funcione
        workProgress: 0,
        targetResource: null,
        targetPosition: null,
        targetBuildingId: null,
        needs: {
          energy: Math.max(n.needs.energy, 70), // Aumenta energia para trabalhar
          satisfaction: Math.max(n.needs.satisfaction, 70)
        }
      };
    });

    useNpcStore.setState({ npcs: updatedNpcs });
    console.log(`Trabalho iniciado para NPC ${npc.type}`);
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] pointer-events-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
        e.stopPropagation();
      }}
    >
      <div className="bg-white rounded-xl p-6 w-96 max-h-[90vh] overflow-y-auto relative">
        <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                npc.type === "miner" ? "bg-blue-100" :
                npc.type === "lumberjack" ? "bg-green-100" :
                npc.type === "farmer" ? "bg-yellow-100" : "bg-orange-100"
              }`}>
                <i className={`fa-solid ${
                  npc.type === "miner" ? "fa-helmet-safety" :
                  npc.type === "lumberjack" ? "fa-tree" :
                  npc.type === "farmer" ? "fa-wheat-awn" : "fa-bread-slice"
                } text-xl ${
                  npc.type === "miner" ? "text-blue-600" :
                  npc.type === "lumberjack" ? "text-green-600" :
                  npc.type === "farmer" ? "text-yellow-600" : "text-orange-600"
                }`}></i>
              </div>
              <h2 className="text-xl font-bold">{npcType?.name || npc.type}</h2>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  // Disparar evento para focar a câmera no NPC
                  window.dispatchEvent(new CustomEvent('focusOnNpc', { 
                    detail: { 
                      position: npc.position,
                      npcId: npc.id 
                    } 
                  }));
                }}
                className="text-blue-500 hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50"
                title="Focar câmera no NPC"
              >
                👁️
              </button>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
          </div>

        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Status</h3>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-2">
                <i className="fa-solid fa-circle-dot text-green-500"></i>
                <span>{stateTranslations[npc.state]}</span>
              </div>
              {npc.workProgress > 0 && (
                <div className="col-span-2 mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-300" 
                      style={{width: `${npc.workProgress * 100}%`}}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Necessidades</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Energia</span>
                  <span>{npc.needs.energy.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{width: `${npc.needs.energy}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span>Satisfação</span>
                  <span>{npc.needs.satisfaction.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500" 
                    style={{width: `${npc.needs.satisfaction}%`}}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Inventário</h3>
            <p className="flex items-center gap-2">
              <i className="fa-solid fa-box text-gray-500"></i>
              {npc.inventory.type ? (
                <span>{npc.inventory.type}: {npc.inventory.amount}</span>
              ) : (
                <span className="text-gray-500">Vazio</span>
              )}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-gray-700">Trabalho</h3>
            {npc.type === "miner" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleWorkClick();
                }}
                className={`w-full px-4 py-2 rounded-lg pointer-events-auto relative z-[10000] ${
                  npc.state === "gathering" || npc.state === "moving"
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                } font-medium transition-colors`}
                disabled={npc.state === "gathering" || npc.state === "moving"}
              >
                {npc.state === "gathering" ? "Minerando..." : 
                 npc.state === "searching" ? "Procurando Pedra..." : 
                 npc.state === "moving" ? "Movendo..." : "Iniciar Mineração"}
              </button>
            )}
             {npc.type === "lumberjack" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleWorkClick();
                }}
                className={`w-full px-4 py-2 rounded-lg ${
                  npc.state === "gathering" || npc.state === "moving"
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-green-500 hover:bg-green-600"
                } text-white font-medium transition-colors`}
                disabled={npc.state === "gathering" || npc.state === "moving"}
              >
                {npc.state === "gathering" ? "Cortando..." : 
                 npc.state === "searching" ? "Procurando Madeira..." : 
                 npc.state === "moving" ? "Movendo..." : "Iniciar Corte"}
              </button>
            )}
            {npc.type === "farmer" && (
              <button
                onClick={() => {
                  const updatedNpc = {
                    ...npc,
                    state: npc.state === "idle" ? "working" : "idle",
                    workProgress: 0,
                    targetResource: null,
                    targetPosition: null,
                    needs: {
                      ...npc.needs,
                      energy: Math.max(npc.needs.energy, 50),
                      satisfaction: Math.max(npc.needs.satisfaction, 50)
                    }
                  };

                  useNpcStore.setState(state => ({
                    npcs: state.npcs.map(n => n.id === npc.id ? updatedNpc : n)
                  }));
                }}
                className={`w-full px-4 py-2 rounded-lg ${
                  npc.state === "working" 
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-yellow-500 hover:bg-yellow-600"
                } text-white font-medium transition-colors`}
                disabled={npc.state === "working"}
              >
                {npc.state === "working" ? "Cultivando..." : "Cultivar"}
              </button>
            )}
            {npc.type === "baker" && (
              <button
                onClick={() => {
                  if (npc.state === "idle") {
                    npc.state = "working";
                    npc.workProgress = 0;
                  }
                }}
                className={`w-full px-4 py-2 rounded-lg ${
                  npc.state === "working" 
                    ? "bg-gray-200 cursor-not-allowed" 
                    : "bg-orange-500 hover:bg-orange-600"
                } text-white font-medium transition-colors`}
                disabled={npc.state === "working"}
              >
                {npc.state === "working" ? "Assando..." : "Assar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NpcPanel;