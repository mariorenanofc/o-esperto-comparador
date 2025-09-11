import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
  mobileClassName?: string;
  desktopClassName?: string;
}

export const MobileOptimized: React.FC<MobileOptimizedProps> = ({
  children,
  className,
  mobileClassName,
  desktopClassName,
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        className,
        isMobile ? mobileClassName : desktopClassName
      )}
    >
      {children}
    </div>
  );
};

// Touch-friendly button component
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const TouchButton: React.FC<TouchButtonProps> = ({
  children,
  size = 'md',
  className,
  ...props
}) => {
  const touchSizes = {
    sm: 'min-h-[40px] min-w-[40px] px-3 py-2',
    md: 'min-h-[44px] min-w-[44px] px-4 py-3',
    lg: 'min-h-[48px] min-w-[48px] px-6 py-4',
  };

  return (
    <button
      className={cn(
        'touch-manipulation select-none',
        'focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2',
        'active:scale-95 transition-transform duration-150',
        touchSizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

// Mobile-optimized card component
interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  touchable?: boolean;
  onClick?: () => void;
}

export const MobileCard: React.FC<MobileCardProps> = ({
  children,
  className,
  touchable = false,
  onClick,
}) => {
  const isMobile = useIsMobile();

  return (
    <div
      className={cn(
        'bg-card rounded-lg border border-border shadow-sm',
        isMobile ? 'p-4' : 'p-6',
        touchable && 'cursor-pointer touch-manipulation',
        touchable && 'hover:shadow-md active:scale-[0.98] transition-all duration-150',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// Mobile-optimized input component
interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  error,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full rounded-md border border-input bg-background px-3 text-sm',
          'focus:outline-none focus:ring-2 focus:ring-app-primary focus:ring-offset-2',
          'placeholder:text-muted-foreground',
          isMobile ? 'min-h-[44px] py-3' : 'h-10 py-2',
          error && 'border-destructive focus:ring-destructive',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
};

// Mobile-optimized modal/sheet component
interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const isMobile = useIsMobile();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative bg-background rounded-t-xl sm:rounded-xl border border-border shadow-lg',
          'w-full max-h-[90vh] overflow-hidden',
          isMobile 
            ? 'max-w-full' 
            : 'max-w-md mx-4'
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
            <TouchButton
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </TouchButton>
          </div>
        )}
        
        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(90vh-80px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// Mobile-optimized grid component
interface MobileGridProps {
  children: React.ReactNode;
  className?: string;
  cols?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
}

export const MobileGrid: React.FC<MobileGridProps> = ({
  children,
  className,
  cols = { mobile: 1, tablet: 2, desktop: 3 },
}) => {
  const gridClasses = `grid gap-4 grid-cols-${cols.mobile} sm:grid-cols-${cols.tablet} lg:grid-cols-${cols.desktop}`;

  return (
    <div className={cn(gridClasses, className)}>
      {children}
    </div>
  );
};