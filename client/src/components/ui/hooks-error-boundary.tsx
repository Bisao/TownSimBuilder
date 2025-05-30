
import React, { Component, ReactNode } from 'react';

interface HooksErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface HooksErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class HooksErrorBoundary extends Component<HooksErrorBoundaryProps, HooksErrorBoundaryState> {
  constructor(props: HooksErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): HooksErrorBoundaryState {
    // Check if it's a hooks-related error
    const isHooksError = error.message.includes('hooks') || 
                        error.message.includes('Rendered fewer hooks than expected');
    
    return { 
      hasError: isHooksError, 
      error: isHooksError ? error : undefined 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (error.message.includes('hooks') || error.message.includes('Rendered fewer hooks than expected')) {
      console.error('Hooks error caught:', error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-800 font-semibold">Erro de Hooks Detectado</h3>
          <p className="text-red-600 text-sm mt-1">
            Componente teve problema com hooks do React. Recarregue a página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
          >
            Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
