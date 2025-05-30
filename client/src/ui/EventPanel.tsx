
import React from "react";
import { useEventStore } from "../game/stores/useEventStore";
import { getPanelClasses, getHeaderClasses, getContentClasses, cn } from "../lib/ui-system";
import { Calendar, Clock, AlertTriangle, CheckCircle } from "lucide-react";

interface EventPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

const EventPanel: React.FC<EventPanelProps> = ({ isVisible, onClose }) => {
  const { events, activeEvents, completeEvent } = useEventStore();

  if (!isVisible) return null;

  const recentEvents = events.slice(-10); // Show last 10 events

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'warning': return AlertTriangle;
      case 'success': return CheckCircle;
      case 'info': return Calendar;
      default: return Clock;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'warning': return 'text-yellow-400 bg-yellow-900/20';
      case 'error': return 'text-red-400 bg-red-900/20';
      case 'success': return 'text-green-400 bg-green-900/20';
      case 'info': return 'text-blue-400 bg-blue-900/20';
      default: return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className={cn(getPanelClasses('modal'), "w-96 max-h-[600px]")}>
        {/* Header */}
        <div className={getHeaderClasses()}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Eventos</h2>
                <p className="text-sm text-gray-400">Histórico e notificações</p>
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

        {/* Content */}
        <div className={getContentClasses()}>
          {recentEvents.length > 0 ? (
            <div className="space-y-3">
              {recentEvents.map(event => {
                const IconComponent = getEventIcon(event.type);
                return (
                  <div 
                    key={event.id}
                    className={cn(
                      "p-3 rounded-lg border transition-all duration-200",
                      getEventColor(event.type)
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <h4 className="font-medium text-white">{event.title}</h4>
                        <p className="text-sm text-gray-300 mt-1">{event.description}</p>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(event.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhum evento registrado</p>
              <p className="text-sm mt-1">Os eventos do jogo aparecerão aqui</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventPanel;
