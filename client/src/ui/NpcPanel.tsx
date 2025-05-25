
import { NPC } from "../game/stores/useNpcStore";
import { npcTypes } from "../game/constants/npcs";

interface NpcPanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const NpcPanel = ({ npc, onClose }: NpcPanelProps) => {
  if (!npc) return null;

  const npcType = npcTypes[npc.type];

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes do NPC</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-bold mb-2">Informações Básicas</h3>
            <p><strong>ID:</strong> {npc.id}</p>
            <p><strong>Tipo:</strong> {npcType?.name || npc.type}</p>
            <p><strong>Profissão:</strong> {npcType?.profession}</p>
            <p><strong>Descrição:</strong> {npcType?.description}</p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Estado Atual</h3>
            <p><strong>Estado:</strong> {npc.state}</p>
            <p><strong>Posição:</strong> [{npc.position.map(p => p.toFixed(2)).join(', ')}]</p>
            <p><strong>Casa ID:</strong> {npc.homeId}</p>
            {npc.targetPosition && (
              <p><strong>Destino:</strong> [{npc.targetPosition.map(p => p.toFixed(2)).join(', ')}]</p>
            )}
            {npc.workProgress > 0 && (
              <p><strong>Progresso:</strong> {(npc.workProgress * 100).toFixed(1)}%</p>
            )}
          </div>

          <div>
            <h3 className="font-bold mb-2">Necessidades</h3>
            <p><strong>Energia:</strong> {npc.needs.energy.toFixed(1)}</p>
            <p><strong>Satisfação:</strong> {npc.needs.satisfaction.toFixed(1)}</p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Inventário</h3>
            <p><strong>Item:</strong> {npc.inventory.type || "Nenhum"}</p>
            <p><strong>Quantidade:</strong> {npc.inventory.amount}</p>
          </div>

          <div>
            <h3 className="font-bold mb-2">Memória</h3>
            <p><strong>Posições Visitadas:</strong> {npc.memory.lastVisitedPositions.length}</p>
            <p><strong>Recursos Conhecidos:</strong> {npc.memory.knownResources.length}</p>
            <p><strong>Tentativas Falhas:</strong> {npc.memory.failedAttempts}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NpcPanel;
