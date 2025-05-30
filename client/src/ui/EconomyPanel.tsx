
import React, { useState } from "react";
import { getPanelClasses, getHeaderClasses, getContentClasses, cn } from "../lib/ui-system";
import { TrendingUp, DollarSign, BarChart3, PieChart } from "lucide-react";

interface EconomyPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const EconomyPanel: React.FC<EconomyPanelProps> = ({ isVisible, onClose }) => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'income' | 'expenses'>('overview');

  if (!isVisible) return null;

  // Mock economic data
  const economicData = {
    totalWealth: 2450,
    dailyIncome: 120,
    dailyExpenses: 80,
    netProfit: 40,
    incomeBreakdown: [
      { source: 'Venda de Recursos', amount: 80, percentage: 67 },
      { source: 'Comércio', amount: 25, percentage: 21 },
      { source: 'Serviços', amount: 15, percentage: 12 }
    ],
    expenseBreakdown: [
      { source: 'Manutenção', amount: 30, percentage: 38 },
      { source: 'Salários NPCs', amount: 25, percentage: 31 },
      { source: 'Materiais', amount: 25, percentage: 31 }
    ]
  };

  const tabs = [
    { id: 'overview', name: 'Visão Geral', icon: BarChart3 },
    { id: 'income', name: 'Receitas', icon: TrendingUp },
    { id: 'expenses', name: 'Despesas', icon: DollarSign }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cn(getPanelClasses('modal'), "w-[500px] max-h-[600px]")}>
        {/* Header */}
        <div className={getHeaderClasses()}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Economia</h2>
                <p className="text-sm text-gray-400">Gestão financeira</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-2"
            >
              <i className="fa-solid fa-times" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-600">
          {tabs.map(tab => {
            const IconComponent = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={cn(
                  "flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-2",
                  selectedTab === tab.id
                    ? "bg-green-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
              >
                <IconComponent className="w-4 h-4" />
                {tab.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className={getContentClasses()}>
          {selectedTab === 'overview' && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-900/30 rounded-lg p-4 border border-green-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    <span className="text-sm text-green-300">Patrimônio Total</span>
                  </div>
                  <div className="text-2xl font-bold text-green-400">
                    {economicData.totalWealth}
                  </div>
                </div>

                <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-600/30">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                    <span className="text-sm text-blue-300">Lucro Líquido/Dia</span>
                  </div>
                  <div className="text-2xl font-bold text-blue-400">
                    +{economicData.netProfit}
                  </div>
                </div>
              </div>

              {/* Daily Summary */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-600">
                <h3 className="font-medium text-white mb-3">Resumo Diário</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Receita:</span>
                    <span className="text-green-400">+{economicData.dailyIncome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Despesas:</span>
                    <span className="text-red-400">-{economicData.dailyExpenses}</span>
                  </div>
                  <hr className="border-gray-600" />
                  <div className="flex justify-between font-medium">
                    <span className="text-white">Lucro:</span>
                    <span className={economicData.netProfit > 0 ? "text-green-400" : "text-red-400"}>
                      {economicData.netProfit > 0 ? '+' : ''}{economicData.netProfit}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedTab === 'income' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400 mb-2">
                  {economicData.dailyIncome}
                </div>
                <div className="text-sm text-gray-400">Receita Diária Total</div>
              </div>

              <div className="space-y-3">
                {economicData.incomeBreakdown.map((item, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white">{item.source}</span>
                      <span className="text-green-400 font-medium">{item.amount}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedTab === 'expenses' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400 mb-2">
                  {economicData.dailyExpenses}
                </div>
                <div className="text-sm text-gray-400">Despesas Diárias Totais</div>
              </div>

              <div className="space-y-3">
                {economicData.expenseBreakdown.map((item, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-600">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white">{item.source}</span>
                      <span className="text-red-400 font-medium">{item.amount}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EconomyPanel;
