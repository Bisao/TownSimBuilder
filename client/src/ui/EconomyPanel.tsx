
import React from "react";
import { useEconomyStore } from "../game/stores/useEconomyStore";
import { useDraggable } from "../hooks/useDraggable";

const EconomyPanel: React.FC = () => {
  const {
    coins,
    taxRate,
    happiness,
    population,
    marketPrices,
    taxIncome,
    tradeIncome,
    setTaxRate,
  } = useEconomyStore();

  const { isDragging, position, handleMouseDown } = useDraggable("economy-panel");

  return (
    <div
      className={`absolute bg-gray-800 text-white p-4 rounded-lg shadow-lg w-80 ${
        isDragging ? "z-50" : "z-10"
      }`}
      style={{
        left: position.x,
        top: position.y,
        pointerEvents: "auto",
      }}
    >
      <div
        className="cursor-move mb-3 font-bold text-lg border-b border-gray-600 pb-2"
        onMouseDown={handleMouseDown}
      >
        💰 Economia
      </div>

      <div className="space-y-3">
        {/* Status Geral */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-yellow-400 font-semibold">Moedas</div>
            <div className="text-lg">{coins.toLocaleString()}</div>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-blue-400 font-semibold">Felicidade</div>
            <div className="text-lg">{happiness.toFixed(1)}%</div>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-green-400 font-semibold">População</div>
            <div className="text-lg">{population}</div>
          </div>
          <div className="bg-gray-700 p-2 rounded">
            <div className="text-purple-400 font-semibold">Taxa de Imposto</div>
            <div className="text-lg">{(taxRate * 100).toFixed(1)}%</div>
          </div>
        </div>

        {/* Controle de Impostos */}
        <div className="bg-gray-700 p-3 rounded">
          <label className="block text-sm font-semibold mb-2">Taxa de Imposto</label>
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={taxRate}
            onChange={(e) => setTaxRate(parseFloat(e.target.value))}
            className="w-full"
          />
          <div className="text-xs text-gray-400 mt-1">
            {(taxRate * 100).toFixed(1)}% - Renda por ciclo: {Math.floor(population * taxRate * 10)}
          </div>
        </div>

        {/* Receitas */}
        <div className="bg-gray-700 p-3 rounded">
          <h4 className="font-semibold text-sm mb-2">Receitas</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Impostos:</span>
              <span className="text-green-400">+{taxIncome}</span>
            </div>
            <div className="flex justify-between">
              <span>Comércio:</span>
              <span className="text-green-400">+{tradeIncome}</span>
            </div>
          </div>
        </div>

        {/* Preços do Mercado */}
        <div className="bg-gray-700 p-3 rounded">
          <h4 className="font-semibold text-sm mb-2">Preços do Mercado</h4>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {Object.entries(marketPrices).map(([resource, price]) => (
              <div key={resource} className="flex justify-between">
                <span className="capitalize">{resource}:</span>
                <span className="text-yellow-400">{price} moedas</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EconomyPanel;
