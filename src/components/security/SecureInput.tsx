import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Shield } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SecureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel';
  placeholder?: string;
  required?: boolean;
  maxLength?: number;
  pattern?: string;
  customValidation?: (value: string) => string | null;
  sanitize?: boolean;
  className?: string;
}

export const SecureInput: React.FC<SecureInputProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  maxLength = 500,
  pattern,
  customValidation,
  sanitize = true,
  className
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isTouched, setIsTouched] = useState(false);

  const sanitizeInput = useCallback((input: string): string => {
    if (!sanitize) return input;
    
    // Remove potential XSS characters
    return input
      .trim()
      .replace(/[<>\"'&]/g, '')
      .substring(0, maxLength);
  }, [sanitize, maxLength]);

  const validateInput = useCallback((input: string): string | null => {
    // Required field validation
    if (required && !input.trim()) {
      return `${label} é obrigatório`;
    }

    // Length validation
    if (input.length > maxLength) {
      return `${label} deve ter no máximo ${maxLength} caracteres`;
    }

    // Pattern validation
    if (pattern && input && !new RegExp(pattern).test(input)) {
      if (type === 'email') {
        return 'Email inválido';
      }
      return `${label} tem formato inválido`;
    }

    // Email validation
    if (type === 'email' && input) {
      const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(input)) {
        return 'Email inválido';
      }
    }

    // Custom validation
    if (customValidation) {
      return customValidation(input);
    }

    return null;
  }, [label, required, maxLength, pattern, type, customValidation]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const sanitizedValue = sanitizeInput(rawValue);
    const validationError = validateInput(sanitizedValue);
    
    setError(validationError);
    onChange(sanitizedValue);
  }, [sanitizeInput, validateInput, onChange]);

  const handleBlur = useCallback(() => {
    setIsTouched(true);
    const validationError = validateInput(value);
    setError(validationError);
  }, [value, validateInput]);

  const showError = error && isTouched;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        {sanitize && (
          <div className="flex items-center gap-1" title="Entrada sanitizada">
            <Shield className="h-3 w-3 text-muted-foreground" />
          </div>
        )}
      </div>
      
      <Input
        id={label.toLowerCase().replace(/\s+/g, '-')}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        className={showError ? 'border-destructive' : ''}
        aria-invalid={showError}
        aria-describedby={showError ? `${label}-error` : undefined}
      />
      
      {showError && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription id={`${label}-error`}>
            {error}
          </AlertDescription>
        </Alert>
      )}
      
      {maxLength && (
        <div className="text-xs text-muted-foreground text-right">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
  );
};