
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Ensure React is properly initialized
if (!React) {
  throw new Error("React is not properly loaded");
}

const container = document.getElementById("root");
if (!container) {
  throw new Error("Root element not found");
}

const root = createRoot(container);

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

root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
