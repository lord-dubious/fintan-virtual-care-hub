// Validation Hook for Forms with Zod Integration
import { useState, useCallback } from 'react';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';

export interface ValidationError {
  field: string;
  message: string;
}

export interface UseValidationOptions<T> {
  schema: z.ZodSchema<T>;
  onSuccess?: (data: T) => void | Promise<void>;
  onError?: (errors: ValidationError[]) => void;
  showToast?: boolean;
}

export interface UseValidationReturn<T> {
  validate: (data: unknown) => Promise<T | null>;
  validateField: (field: string, value: unknown) => ValidationError | null;
  errors: ValidationError[];
  isValidating: boolean;
  clearErrors: () => void;
  clearFieldError: (field: string) => void;
}

/**
 * Custom hook for form validation using Zod schemas
 * Provides comprehensive validation with error handling and toast notifications
 */
export function useValidation<T>({
  schema,
  onSuccess,
  onError,
  showToast = true,
}: UseValidationOptions<T>): UseValidationReturn<T> {
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const { toast } = useToast();

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors(prev => prev.filter(error => error.field !== field));
  }, []);

  const validateField = useCallback((field: string, value: unknown): ValidationError | null => {
    try {
      // Try to validate just this field if the schema supports it
      const fieldSchema = (schema as { shape?: Record<string, z.ZodType> }).shape?.[field];
      if (fieldSchema) {
        fieldSchema.parse(value);
        clearFieldError(field);
        return null;
      }
      return null;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldError = error.errors[0];
        if (fieldError) {
          const validationError: ValidationError = {
            field,
            message: fieldError.message,
          };
          
          // Update errors state
          setErrors(prev => [
            ...prev.filter(e => e.field !== field),
            validationError,
          ]);
          
          return validationError;
        }
      }
      return null;
    }
  }, [schema, clearFieldError]);

  const validate = useCallback(async (data: unknown): Promise<T | null> => {
    setIsValidating(true);
    clearErrors();

    try {
      const validatedData = schema.parse(data);
      
      if (onSuccess) {
        await onSuccess(validatedData);
      }
      
      if (showToast) {
        toast({
          title: "Validation Successful",
          description: "All fields are valid.",
        });
      }
      
      return validatedData;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const validationErrors: ValidationError[] = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message,
        }));
        
        setErrors(validationErrors);
        
        if (onError) {
          onError(validationErrors);
        }
        
        if (showToast) {
          toast({
            title: "Validation Failed",
            description: `${validationErrors.length} field(s) have errors.`,
            variant: "destructive",
          });
        }
        
        return null;
      } else {
        // Handle non-Zod errors
        const genericError: ValidationError = {
          field: 'general',
          message: error instanceof Error ? error.message : 'Validation failed',
        };
        
        setErrors([genericError]);
        
        if (showToast) {
          toast({
            title: "Validation Error",
            description: genericError.message,
            variant: "destructive",
          });
        }
        
        return null;
      }
    } finally {
      setIsValidating(false);
    }
  }, [schema, onSuccess, onError, showToast, toast, clearErrors]);

  return {
    validate,
    validateField,
    errors,
    isValidating,
    clearErrors,
    clearFieldError,
  };
}

/**
 * Helper hook for real-time field validation
 */
export function useFieldValidation<T>(
  schema: z.ZodSchema<T>,
  field: string,
  debounceMs: number = 300
) {
  const [error, setError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateField = useCallback(
    async (value: unknown) => {
      setIsValidating(true);
      
      // Debounce validation
      const timeoutId = setTimeout(() => {
        try {
          const fieldSchema = (schema as { shape?: Record<string, z.ZodType> }).shape?.[field];
          if (fieldSchema) {
            fieldSchema.parse(value);
            setError(null);
          }
        } catch (err) {
          if (err instanceof z.ZodError) {
            setError(err.errors[0]?.message || 'Invalid value');
          }
        } finally {
          setIsValidating(false);
        }
      }, debounceMs);

      return () => clearTimeout(timeoutId);
    },
    [schema, field, debounceMs]
  );

  return {
    error,
    isValidating,
    validateField,
    clearError: () => setError(null),
  };
}

/**
 * Validation utilities for common use cases
 */
export const validationUtils = {
  /**
   * Get error message for a specific field
   */
  getFieldError: (errors: ValidationError[], field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  },

  /**
   * Check if a field has an error
   */
  hasFieldError: (errors: ValidationError[], field: string): boolean => {
    return errors.some(error => error.field === field);
  },

  /**
   * Get all error messages as a single string
   */
  getAllErrorMessages: (errors: ValidationError[]): string => {
    return errors.map(error => `${error.field}: ${error.message}`).join(', ');
  },

  /**
   * Group errors by field
   */
  groupErrorsByField: (errors: ValidationError[]): Record<string, string[]> => {
    return errors.reduce((acc, error) => {
      if (!acc[error.field]) {
        acc[error.field] = [];
      }
      acc[error.field].push(error.message);
      return acc;
    }, {} as Record<string, string[]>);
  },

  /**
   * Format errors for display in forms
   */
  formatErrorsForForm: (errors: ValidationError[]): Record<string, { message: string }> => {
    return errors.reduce((acc, error) => {
      acc[error.field] = { message: error.message };
      return acc;
    }, {} as Record<string, { message: string }>);
  },
};
