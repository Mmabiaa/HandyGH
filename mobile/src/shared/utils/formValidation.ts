// Form validation utilities - no imports needed

/**
 * Form validation utilities
 * Requirement 16.3: Form validation with inline error display
 */

export type ValidationRule<T = any> = {
  validate: (value: T) => boolean;
  message: string;
};

export type FieldValidation<T = any> = {
  rules: ValidationRule<T>[];
  required?: boolean;
};

export type FormValidationSchema<T extends Record<string, any>> = {
  [K in keyof T]?: FieldValidation<T[K]>;
};

export type FormErrors<T extends Record<string, any>> = {
  [K in keyof T]?: string;
};

/**
 * Common validation rules
 */
export const validationRules = {
  required: (message = 'This field is required'): ValidationRule<string> => ({
    validate: (value) => value?.trim().length > 0,
    message,
  }),

  email: (message = 'Please enter a valid email address'): ValidationRule<string> => ({
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message,
  }),

  ghanaPhone: (message = 'Please enter a valid Ghana phone number'): ValidationRule<string> => ({
    validate: (value) => {
      const cleaned = value.replace(/[\s-]/g, '');
      const patterns = [/^\+233\d{9}$/, /^233\d{9}$/, /^0\d{9}$/];
      return patterns.some((pattern) => pattern.test(cleaned));
    },
    message,
  }),

  minLength: (
    min: number,
    message = `Must be at least ${min} characters`
  ): ValidationRule<string> => ({
    validate: (value) => value?.trim().length >= min,
    message,
  }),

  maxLength: (
    max: number,
    message = `Must be no more than ${max} characters`
  ): ValidationRule<string> => ({
    validate: (value) => value?.trim().length <= max,
    message,
  }),

  pattern: (
    regex: RegExp,
    message = 'Invalid format'
  ): ValidationRule<string> => ({
    validate: (value) => regex.test(value),
    message,
  }),

  numeric: (message = 'Must be a number'): ValidationRule<string> => ({
    validate: (value) => /^\d+$/.test(value),
    message,
  }),

  min: (
    min: number,
    message = `Must be at least ${min}`
  ): ValidationRule<number> => ({
    validate: (value) => value >= min,
    message,
  }),

  max: (
    max: number,
    message = `Must be no more than ${max}`
  ): ValidationRule<number> => ({
    validate: (value) => value <= max,
    message,
  }),

  url: (message = 'Please enter a valid URL'): ValidationRule<string> => ({
    validate: (value) => {
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    },
    message,
  }),

  custom: <T>(
    validator: (value: T) => boolean,
    message: string
  ): ValidationRule<T> => ({
    validate: validator,
    message,
  }),
};

/**
 * Validate a single field
 */
export function validateField<T>(
  value: T,
  validation: FieldValidation<T>
): string | undefined {
  // Check required
  if (validation.required && !value) {
    return 'This field is required';
  }

  // Skip other validations if not required and empty
  if (!validation.required && !value) {
    return undefined;
  }

  // Run validation rules
  for (const rule of validation.rules) {
    if (!rule.validate(value)) {
      return rule.message;
    }
  }

  return undefined;
}

/**
 * Validate entire form
 */
export function validateForm<T extends Record<string, any>>(
  values: T,
  schema: FormValidationSchema<T>
): FormErrors<T> {
  const errors: FormErrors<T> = {};

  for (const field in schema) {
    const validation = schema[field];
    if (validation) {
      const error = validateField(values[field], validation);
      if (error) {
        errors[field] = error;
      }
    }
  }

  return errors;
}

/**
 * Check if form has errors
 */
export function hasFormErrors<T extends Record<string, any>>(
  errors: FormErrors<T>
): boolean {
  return Object.keys(errors).length > 0;
}

/**
 * Sanitize input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validate and sanitize input
 */
export function validateAndSanitize(
  input: string,
  validation: FieldValidation<string>
): { value: string; error?: string } {
  const error = validateField(input, validation);
  const sanitized = sanitizeInput(input.trim());

  return { value: sanitized, error };
}
