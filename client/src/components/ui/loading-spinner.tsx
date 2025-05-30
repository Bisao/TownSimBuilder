import React from 'react';

export const LoadingSpinner: React.FC<{ className?: string }> = ({ className = "" }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white opacity-75"></div>
    </div>
  );
};

export default LoadingSpinner;