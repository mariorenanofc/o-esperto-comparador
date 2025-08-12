import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingFallbackProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = "Carregando...", 
  fullScreen = false 
}) => {
  const containerClass = fullScreen 
    ? "min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900"
    : "flex items-center justify-center p-8";

  return (
    <div className={containerClass}>
      <div className="text-center space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-app-primary mx-auto" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};

export const SkeletonCard: React.FC = () => (
  <div className="animate-pulse">
    <div className="bg-gray-200 dark:bg-gray-700 rounded-lg h-32 w-full"></div>
    <div className="mt-4 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
);

export const SkeletonTable: React.FC = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded flex-1"></div>
      </div>
    ))}
  </div>
);