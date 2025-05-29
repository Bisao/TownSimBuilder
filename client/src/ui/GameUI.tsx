
import React from "react";
import { useGameStore } from "../game/stores/useGameStore";
import BuildingPanel from "./BuildingPanel";
import NpcPanel from "./NpcPanel";
import ResourcePanel from "./ResourcePanel";
import MarketWindow from "./MarketWindow";
import NpcMetricsPanel from "./NpcMetricsPanel";
import SeedSelectionPanel from "./SeedSelectionPanel";
import SiloPanel from "./SiloPanel";
import ResearchPanel from "./ResearchPanel";
import EconomyPanel from "./EconomyPanel";
import EventPanel from "./EventPanel";
import TaskPanel from "./TaskPanel";

const GameUI: React.FC = () => {
  const {
    showBuildingPanel,
    showNpcPanel,
    showResourcePanel,
    showMarketWindow,
    showNpcMetrics,
    showSeedSelection,
    showSiloPanel,
    showResearchPanel,
    showEconomyPanel,
    showEventPanel,
    isPaused,
    timeSpeed,
    pauseTime,
    resumeTime,
    increaseTimeSpeed,
    decreaseTimeSpeed,
  } = useGameStore();

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Time Controls */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <div className="bg-black/80 text-white p-3 rounded-lg flex items-center gap-3">
          <button
            onClick={isPaused ? resumeTime : pauseTime}
            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded text-sm font-medium"
          >
            {isPaused ? "▶️" : "⏸️"}
          </button>
          <button
            onClick={decreaseTimeSpeed}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
          >
            -
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {timeSpeed}x
          </span>
          <button
            onClick={increaseTimeSpeed}
            className="px-2 py-1 bg-gray-600 hover:bg-gray-700 rounded text-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* Panels */}
      {showResourcePanel && <ResourcePanel />}
      {showBuildingPanel && <BuildingPanel />}
      {showNpcPanel && <NpcPanel />}
      {showMarketWindow && <MarketWindow />}
      {showNpcMetrics && <NpcMetricsPanel />}
      {showSeedSelection && <SeedSelectionPanel />}
      {showSiloPanel && <SiloPanel />}
      {showResearchPanel && <ResearchPanel />}
      {showEconomyPanel && <EconomyPanel />}
      {showEventPanel && <EventPanel />}
      <TaskPanel />
    </div>
  );
};

export default GameUI;
