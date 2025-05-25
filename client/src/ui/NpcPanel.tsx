
import { NPC } from "../game/stores/useNpcStore";

interface NpcPanelProps {
  npc: NPC | null;
  onClose: () => void;
}

const NpcPanel = ({ npc, onClose }: NpcPanelProps) => {
  if (!npc) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-4 w-96">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Detalhes do NPC</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        
        <div className="space-y-2">
          <p><strong>Tipo:</strong> {npc.type}</p>
          <p><strong>Estado:</strong> {npc.state}</p>
          <div className="mt-4">
            <h3 className="font-bold mb-2">Inventário:</h3>
            <p>Item: {npc.inventory.type || "Nenhum"}</p>
            <p>Quantidade: {npc.inventory.amount}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NpcPanel;
