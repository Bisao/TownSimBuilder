
import React from "react";
import { useEventStore } from "../game/stores/useEventStore";

interface EventPanelProps {
  isVisible: boolean;
}

const EventPanel: React.FC<EventPanelProps> = ({ isVisible }) => {
  const { activeEvents, resolveEvent } = useEventStore();

  if (!isVisible || activeEvents.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 space-y-2 z-50">
      {activeEvents.map((event) => (
        <div
          key={event.id}
          className={`max-w-sm p-4 rounded-lg shadow-lg border-2 ${
            event.type === "positive"
              ? "bg-green-900/95 border-green-500"
              : event.type === "negative"
              ? "bg-red-900/95 border-red-500"
              : "bg-blue-900/95 border-blue-500"
          }`}
        >
          <h3 className="text-white font-bold text-lg mb-2">{event.title}</h3>
          <p className="text-gray-200 text-sm mb-3">{event.description}</p>
          
          {event.choices ? (
            <div className="space-y-2">
              {event.choices.map((choice, index) => (
                <button
                  key={index}
                  onClick={() => resolveEvent(event.id, index)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  {choice.text}
                </button>
              ))}
            </div>
          ) : (
            <button
              onClick={() => resolveEvent(event.id)}
              className="w-full bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded text-sm transition-colors"
            >
              OK
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

export default EventPanel;
