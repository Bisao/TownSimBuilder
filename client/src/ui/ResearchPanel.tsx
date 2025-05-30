
import React, { useState } from "react";
import { useResearchStore } from "../game/stores/useResearchStore";
import { getPanelClasses, getHeaderClasses, getContentClasses, getButtonClasses, cn } from "../lib/ui-system";
import { BookOpen, Zap, Cog, Leaf } from "lucide-react";

interface ResearchPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const ResearchPanel: React.FC<ResearchPanelProps> = ({ isVisible, onClose }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('technology');

  if (!isVisible) return null;

  // Mock research data
  const categories = [
    { id: 'technology', name: 'Tecnologia', icon: Cog, color: 'text-blue-400' },
    { id: 'magic', name: 'Magia', icon: Zap, color: 'text-purple-400' },
    { id: 'nature', name: 'Natureza', icon: Leaf, color: 'text-green-400' }
  ];

  const researches = {
    technology: [
      { id: 'advanced_tools', name: 'Ferramentas Avançadas', description: 'Melhora a eficiência dos trabalhadores', cost: 100, completed: false },
      { id: 'automation', name: 'Automação', description: 'NPCs trabalham mais independentemente', cost: 200, completed: false }
    ],
    magic: [
      { id: 'enchanting', name: 'Encantamento', description: 'Permite encantar ferramentas', cost: 150, completed: false },
      { id: 'alchemy', name: 'Alquimia', description: 'Criação de poções', cost: 180, completed: false }
    ],
    nature: [
      { id: 'crop_rotation', name: 'Rotação de Culturas', description: 'Melhora a produção agrícola', cost: 80, completed: false },
      { id: 'animal_husbandry', name: 'Criação de Animais', description: 'Permite criar animais', cost: 120, completed: false }
    ]
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cn(getPanelClasses('modal'), "w-[600px] max-h-[700px]")}>
        {/* Header */}
        <div className={getHeaderClasses()}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Pesquisa</h2>
                <p className="text-sm text-gray-400">Desenvolva novas tecnologias</p>
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

        {/* Categories */}
        <div className="flex border-b border-gray-600">
          {categories.map(category => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={cn(
                  "flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-2",
                  selectedCategory === category.id
                    ? "bg-purple-600 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                )}
              >
                <IconComponent className="w-4 h-4" />
                {category.name}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className={getContentClasses()}>
          <div className="space-y-4">
            {researches[selectedCategory]?.map(research => (
              <div 
                key={research.id}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-600"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-white mb-2">{research.name}</h4>
                    <p className="text-sm text-gray-300 mb-3">{research.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="text-yellow-400">
                        <i className="fa-solid fa-flask mr-1" />
                        Custo: {research.cost} pontos
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded-full text-xs",
                        research.completed 
                          ? "bg-green-600 text-white" 
                          : "bg-gray-600 text-gray-300"
                      )}>
                        {research.completed ? 'Concluída' : 'Disponível'}
                      </div>
                    </div>
                  </div>

                  <button
                    disabled={research.completed}
                    className={cn(
                      getButtonClasses('primary', 'sm'),
                      research.completed && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {research.completed ? 'Concluída' : 'Pesquisar'}
                  </button>
                </div>
              </div>
            )) || (
              <div className="text-center py-8 text-gray-400">
                <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma pesquisa disponível nesta categoria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchPanel;
