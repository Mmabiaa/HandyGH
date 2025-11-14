import { useState, useCallback } from 'react';
import {
  FormValidationSchema,
  FormErrors,
  validateField,
  validateForm,
  hasFormErrors,
} from '../utils/formValidation';

/**
 * Hook for form validation with real-time feedback
 * Requirement 16.3: Real-time validation feedback
 */
export function useFormValidation<T extends Record<string, any>>(
  initialValues: T,
  schema: FormValidationSchema<T>
) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors<T>>({});
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>);

  /**
   * Update a single field value
   */
  const setValue = useCallback(
    (field: keyof T, value: any) => {
      setValues((prev) => ({ ...prev, [field]: value }));

      // Validate field if it has been touched
      if (touched[field] && schema[field]) {
        const error = validateField(value, schema[field]!);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
      }
    },
    [schema, touched]
  );

  /**
   * Mark a field as touched
   */
  const setFieldTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  }, []);

  /**
   * Validate a single field
   */
  const validateSingleField = useCallback(
    (field: keyof T) => {
      if (schema[field]) {
        const error = validateField(values[field], schema[field]!);
        setErrors((prev) => ({
          ...prev,
          [field]: error,
        }));
        return !error;
      }
      return true;
    },
    [values, schema]
  );

  /**
   * Validate all fields
   */
  const validate = useCallback(() => {
    const newErrors = validateForm(values, schema);
    setErrors(newErrors);
    return !hasFormErrors(newErrors);
  }, [values, schema]);

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (field: keyof T) => {
      setFieldTouched(field);
      validateSingleField(field);
    },
    [setFieldTouched, validateSingleField]
  );

  /**
   * Reset form
   */
  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({} as Record<keyof T, boolean>);
  }, [initialValues]);

  /**
   * Set multiple values at once
   */
  const setFormValues = useCallback((newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  }, []);

  return {
    values,
    errors,
    touched,
    setValue,
    setFieldTouched,
    validateSingleField,
    validate,
    handleBlur,
    reset,
    setFormValues,
    isValid: !hasFormErrors(errors),
  };
}
