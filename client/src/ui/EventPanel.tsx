
import React from "react";
import { useEventStore } from "../game/stores/useEventStore";
import { useDraggable } from "../hooks/useDraggable";

const EventPanel: React.FC = () => {
  const { activeEvents, resolveEvent } = useEventStore();
  const { isDragging, position, handleMouseDown } = useDraggable("event-panel");

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
        📅 Eventos Ativos
      </div>

      {activeEvents.length === 0 ? (
        <div className="text-gray-400 text-center py-4">
          Nenhum evento ativo no momento
        </div>
      ) : (
        <div className="space-y-3 max-h-60 overflow-y-auto">
          {activeEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded border-l-4 ${
                event.type === "positive"
                  ? "border-green-500 bg-green-900/30"
                  : event.type === "negative"
                  ? "border-red-500 bg-red-900/30"
                  : "border-yellow-500 bg-yellow-900/30"
              }`}
            >
              <h3 className="font-semibold text-sm mb-1">{event.title}</h3>
              <p className="text-xs text-gray-300 mb-2">{event.description}</p>

              {event.choices ? (
                <div className="space-y-2">
                  {event.choices.map((choice, index) => (
                    <button
                      key={index}
                      onClick={() => resolveEvent(event.id, index)}
                      className="w-full text-left text-xs bg-gray-700 hover:bg-gray-600 p-2 rounded transition-colors"
                    >
                      {choice.text}
                    </button>
                  ))}
                </div>
              ) : (
                <button
                  onClick={() => resolveEvent(event.id)}
                  className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded transition-colors"
                >
                  Aceitar
                </button>
              )}

              {event.duration && (
                <div className="mt-2 text-xs text-gray-400">
                  Duração: {Math.ceil(event.duration)}s restantes
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventPanel;
