
import React from "react";

const EconomyPanel: React.FC = () => {
  return (
    <div className="bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-lg shadow-xl p-4 text-white">
      <div className="text-center text-slate-400">
        <i className="fa-solid fa-info-circle text-2xl mb-2"></i>
        <p className="text-sm">Sistema Econômico foi desabilitado</p>
      </div>
    </div>
  );
};

export default EconomyPanel;
