
import { create } from 'zustand';

export interface ValidationRule {
  required?: boolean;
  min?: number;
  max?: number;
  pattern?: RegExp;
  custom?: (value: any) => string | null;
}

export interface ValidationError {
  field: string;
  message: string;
}

interface ValidationState {
  errors: ValidationError[];
  
  // Actions
  validateField: (field: string, value: any, rules: ValidationRule) => boolean;
  validateForm: (data: Record<string, any>, rules: Record<string, ValidationRule>) => boolean;
  clearErrors: (field?: string) => void;
  addError: (field: string, message: string) => void;
  getFieldError: (field: string) => string | null;
  hasErrors: () => boolean;
}

export const useValidationStore = create<ValidationState>((set, get) => ({
  errors: [],

  validateField: (field, value, rules) => {
    const { clearErrors, addError } = get();
    clearErrors(field);

    // Required validation
    if (rules.required && (!value || value.toString().trim() === '')) {
      addError(field, 'Este campo é obrigatório');
      return false;
    }

    // Skip other validations if field is empty and not required
    if (!value && !rules.required) {
      return true;
    }

    // Min validation
    if (rules.min !== undefined) {
      if (typeof value === 'number' && value < rules.min) {
        addError(field, `Valor mínimo é ${rules.min}`);
        return false;
      }
      if (typeof value === 'string' && value.length < rules.min) {
        addError(field, `Mínimo de ${rules.min} caracteres`);
        return false;
      }
    }

    // Max validation
    if (rules.max !== undefined) {
      if (typeof value === 'number' && value > rules.max) {
        addError(field, `Valor máximo é ${rules.max}`);
        return false;
      }
      if (typeof value === 'string' && value.length > rules.max) {
        addError(field, `Máximo de ${rules.max} caracteres`);
        return false;
      }
    }

    // Pattern validation
    if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
      addError(field, 'Formato inválido');
      return false;
    }

    // Custom validation
    if (rules.custom) {
      const customError = rules.custom(value);
      if (customError) {
        addError(field, customError);
        return false;
      }
    }

    return true;
  },

  validateForm: (data, rules) => {
    const { validateField } = get();
    let isValid = true;

    Object.entries(rules).forEach(([field, rule]) => {
      const fieldValue = data[field];
      if (!validateField(field, fieldValue, rule)) {
        isValid = false;
      }
    });

    return isValid;
  },

  clearErrors: (field) => {
    set(state => ({
      errors: field 
        ? state.errors.filter(error => error.field !== field)
        : []
    }));
  },

  addError: (field, message) => {
    set(state => ({
      errors: [...state.errors.filter(e => e.field !== field), { field, message }]
    }));
  },

  getFieldError: (field) => {
    const error = get().errors.find(e => e.field === field);
    return error ? error.message : null;
  },

  hasErrors: () => {
    return get().errors.length > 0;
  },
}));
