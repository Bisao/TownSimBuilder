
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { queryClient } from '@/lib/queryClient';
import App from './App';
import './index.css';

// Environment configuration
const isDevelopment = import.meta.env.DEV;
const isProduction = import.meta.env.PROD;

// Performance monitoring
if (isDevelopment) {
  // Enable React DevTools profiler
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.settings && 
  (window.__REACT_DEVTOOLS_GLOBAL_HOOK__.settings.profilerEnabled = true);
}

// Global error handler
const handleGlobalError = (event: ErrorEvent) => {
  console.error('Global error:', event.error);
  
  // Send error to monitoring service in production
  if (isProduction) {
    // TODO: Implement error reporting service
    console.log('Error would be sent to monitoring service');
  }
};

// Global unhandled promise rejection handler
const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
  console.error('Unhandled promise rejection:', event.reason);
  
  // Prevent the default browser behavior
  event.preventDefault();
  
  // Send error to monitoring service in production
  if (isProduction) {
    // TODO: Implement error reporting service
    console.log('Promise rejection would be sent to monitoring service');
  }
};

// Set up global error handlers
window.addEventListener('error', handleGlobalError);
window.addEventListener('unhandledrejection', handleUnhandledRejection);

// Cleanup function for error handlers
const cleanup = () => {
  window.removeEventListener('error', handleGlobalError);
  window.removeEventListener('unhandledrejection', handleUnhandledRejection);
};

// Main error fallback component
const MainErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => (
  <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
    <div className="text-center space-y-6 max-w-md w-full">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-red-600">
          Erro Crítico
        </h1>
        <p className="text-gray-600">
          A aplicação encontrou um erro inesperado e precisa ser reiniciada.
        </p>
      </div>
      
      <div className="bg-red-100 border border-red-200 rounded-lg p-4">
        <h3 className="font-semibold text-red-800 mb-2">
          Detalhes do erro:
        </h3>
        <p className="text-sm text-red-700 font-mono">
          {error.message}
        </p>
      </div>
      
      <div className="space-y-3">
        <button
          onClick={resetError}
          className="w-full btn btn-primary"
        >
          Tentar Novamente
        </button>
        
        <button
          onClick={() => window.location.reload()}
          className="w-full btn btn-secondary"
        >
          Recarregar Página
        </button>
      </div>
      
      {isDevelopment && (
        <details className="text-left bg-gray-100 border rounded-lg p-4">
          <summary className="cursor-pointer font-semibold text-gray-700 mb-2">
            Stack Trace (Desenvolvimento)
          </summary>
          <pre className="text-xs text-gray-600 overflow-auto max-h-32">
            {error.stack}
          </pre>
        </details>
      )}
    </div>
  </div>
);

// App wrapper with providers
const AppWrapper = () => (
  <StrictMode>
    <ErrorBoundary
      fallback={MainErrorFallback}
      onError={(error, errorInfo) => {
        console.error('React Error Boundary:', error, errorInfo);
        
        // Log to monitoring service in production
        if (isProduction) {
          console.log('Error boundary would send to monitoring service');
        }
      }}
    >
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>
);

// Initialize application
const initializeApp = async () => {
  try {
    // Get root element
    const rootElement = document.getElementById('root');
    
    if (!rootElement) {
      throw new Error('Root element not found. Please ensure there is an element with id="root" in your HTML.');
    }

    // Create React root
    const root = createRoot(rootElement);
    
    // Log environment information
    console.log(`🚀 Starting application in ${isDevelopment ? 'development' : 'production'} mode`);
    
    if (isDevelopment) {
      console.log('📊 React DevTools available');
    }

    // Render application
    root.render(<AppWrapper />);
    
    console.log('✅ Application initialized successfully');
    
    return cleanup;
    
  } catch (error) {
    console.error('❌ Failed to initialize application:', error);
    
    // Show fallback UI
    document.body.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 100vh;
        background: #fee2e2;
        padding: 1rem;
      ">
        <div style="
          text-align: center;
          max-width: 400px;
          background: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        ">
          <h1 style="color: #dc2626; margin-bottom: 1rem;">
            Erro de Inicialização
          </h1>
          <p style="color: #374151; margin-bottom: 1.5rem;">
            Não foi possível inicializar a aplicação. Tente recarregar a página.
          </p>
          <button 
            onclick="window.location.reload()" 
            style="
              background: #3b82f6;
              color: white;
              padding: 0.5rem 1rem;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            "
          >
            Recarregar
          </button>
          ${isDevelopment ? `
            <details style="margin-top: 1rem; text-align: left;">
              <summary style="cursor: pointer; font-weight: bold;">
                Detalhes do Erro
              </summary>
              <pre style="
                background: #f3f4f6;
                padding: 0.5rem;
                border-radius: 4px;
                font-size: 0.75rem;
                overflow: auto;
                margin-top: 0.5rem;
              ">${error instanceof Error ? error.stack : String(error)}</pre>
            </details>
          ` : ''}
        </div>
      </div>
    `;
    
    throw error;
  }
};

// Start the application
initializeApp().catch(error => {
  console.error('Critical initialization error:', error);
});

// Hot module replacement for development
if (isDevelopment && import.meta.hot) {
  import.meta.hot.accept();
  
  import.meta.hot.dispose(() => {
    cleanup();
    console.log('🔄 Hot module replacement: cleaning up');
  });
}
