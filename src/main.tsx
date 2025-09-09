
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Add error boundary wrapper
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    
    // Log additional context about potential extension interference
    const hasExtensionScripts = Array.from(document.scripts).some(script => 
      script.src && script.src.includes('chrome-extension://')
    );
    
    if (hasExtensionScripts) {
      console.warn("Browser extensions detected - this may be related to the error");
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Algo deu errado
            </h1>
            <p className="text-gray-600 mb-4">
              Recarregue a página para tentar novamente.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Enhanced initialization with extension interference protection
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;
let appRoot: ReturnType<typeof createRoot> | null = null;

function initializeApp() {
  try {
    // Ensure React is properly initialized
    if (!React) {
      throw new Error("React is not properly loaded");
    }

    const container = document.getElementById("root");
    if (!container) {
      throw new Error("Root element not found");
    }

    // Clear any potential interference from browser extensions
    if (container.innerHTML && container.innerHTML.trim() !== '') {
      console.warn('Root container has unexpected content, clearing...');
      container.innerHTML = '';
    }

    // Create root only once to avoid warnings
    if (!appRoot) {
      appRoot = createRoot(container);
    }
    
    appRoot.render(
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    );
    
    console.log('App initialized successfully');
  } catch (error) {
    console.error(`Initialization attempt ${initializationAttempts + 1} failed:`, error);
    
    initializationAttempts++;
    if (initializationAttempts < MAX_INIT_ATTEMPTS) {
      console.log(`Retrying initialization in 1 second... (attempt ${initializationAttempts + 1}/${MAX_INIT_ATTEMPTS})`);
      setTimeout(initializeApp, 1000);
    } else {
      // Final fallback - show error message directly in DOM
      const container = document.getElementById("root");
      if (container) {
        container.innerHTML = `
          <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #f9fafb; padding: 20px;">
            <div style="text-align: center; max-width: 500px;">
              <h1 style="color: #dc2626; font-size: 24px; font-weight: bold; margin-bottom: 16px;">
                Erro de Carregamento
              </h1>
              <p style="color: #6b7280; margin-bottom: 20px;">
                A página não conseguiu carregar completamente. Isso pode ser causado por extensões do navegador.
              </p>
              <div style="margin-bottom: 20px;">
                <p style="color: #374151; font-size: 14px; margin-bottom: 8px;">Tente:</p>
                <ul style="color: #6b7280; font-size: 14px; text-align: left; display: inline-block;">
                  <li>• Recarregar a página (F5)</li>
                  <li>• Desabilitar extensões do navegador</li>
                  <li>• Usar modo privado/anônimo</li>
                  <li>• Limpar cache do navegador</li>
                </ul>
              </div>
              <button 
                onclick="window.location.reload()" 
                style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-size: 16px;"
              >
                Recarregar Página
              </button>
            </div>
          </div>
        `;
      }
    }
  }
}

// Wait for DOM to be ready before initializing
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM is already ready
  initializeApp();
}

// This will be handled by the new initializeApp function
