
import React from "react";
import { useEconomyStore } from "../game/stores/useEconomyStore";
import { useDraggable } from "../hooks/useDraggable";

interface EconomyPanelProps {
  isVisible: boolean;
}

const EconomyPanel: React.FC<EconomyPanelProps> = ({ isVisible }) => {
  const {
    coins,
    taxRate,
    happiness,
    population,
    taxIncome,
    tradeIncome,
    setTaxRate,
    calculateTaxes
  } = useEconomyStore();

  const { dragProps, isDragging } = useDraggable({
    defaultPosition: { x: 300, y: 100 }
  });

  if (!isVisible) return null;

  return (
    <div
      {...dragProps}
      className={`absolute bg-gradient-to-br from-yellow-900/95 to-orange-900/95 rounded-xl p-4 shadow-lg border border-yellow-700 min-w-[280px] ${
        isDragging ? "cursor-grabbing" : "cursor-grab"
      }`}
      style={{
        left: dragProps.style?.left,
        top: dragProps.style?.top,
        zIndex: 1000
      }}
    >
      <h2 className="text-white text-lg font-bold mb-4 text-center">💰 Economia</h2>
      
      <div className="space-y-3">
        <div className="bg-black/30 p-3 rounded-lg">
          <h3 className="text-yellow-300 font-semibold mb-2">Finanças</h3>
          <div className="text-white space-y-1">
            <div className="flex justify-between">
              <span>Moedas:</span>
              <span className="font-bold text-yellow-300">{coins}</span>
            </div>
            <div className="flex justify-between">
              <span>Receita de Impostos:</span>
              <span className="text-green-400">+{taxIncome}</span>
            </div>
            <div className="flex justify-between">
              <span>Receita de Comércio:</span>
              <span className="text-green-400">+{tradeIncome}</span>
            </div>
          </div>
        </div>

        <div className="bg-black/30 p-3 rounded-lg">
          <h3 className="text-yellow-300 font-semibold mb-2">População</h3>
          <div className="text-white space-y-1">
            <div className="flex justify-between">
              <span>Cidadãos:</span>
              <span className="font-bold">{population}</span>
            </div>
            <div className="flex justify-between">
              <span>Felicidade:</span>
              <span className={happiness >= 75 ? "text-green-400" : happiness >= 50 ? "text-yellow-400" : "text-red-400"}>
                {happiness}%
              </span>
            </div>
          </div>
        </div>

        <div className="bg-black/30 p-3 rounded-lg">
          <h3 className="text-yellow-300 font-semibold mb-2">Impostos</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-white">
              <span>Taxa de Imposto:</span>
              <span>{(taxRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="50"
              value={taxRate * 100}
              onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
              className="w-full"
            />
            <button
              onClick={calculateTaxes}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded transition-colors"
            >
              Coletar Impostos
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomyPanel;
