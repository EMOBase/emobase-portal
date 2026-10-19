import * as React from "react";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

type UseFormOptions<T> = {
  defaultValues: T;
  /**
   * Validates the whole form and returns a message per invalid field.
   * Returning an empty value for a field means it is valid.
   */
  validate?: (values: T) => FormErrors<T>;
  /** Runs once every field passes validation. Throwing surfaces `formError`. */
  onSubmit: (values: T) => Promise<unknown> | void;
};

/**
 * Small, dependency-free form state with per-field validation.
 *
 * Errors only appear after a submit attempt and clear as the field is edited,
 * while failures thrown from `onSubmit` (e.g. API errors) are exposed through
 * `formError`.
 *
 * @example
 * ```tsx
 * const form = useForm({
 *   defaultValues: { name: "" },
 *   validate: (values) => ({
 *     name: values.name.trim() ? undefined : "Name is required",
 *   }),
 *   onSubmit: (values) => save(values),
 * });
 *
 * if (await form.handleSubmit()) {
 *   close();
 * }
 * ```
 */
export function useForm<T extends Record<string, unknown>>({
  defaultValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = React.useState<T>(defaultValues);
  const [errors, setErrors] = React.useState<FormErrors<T>>({});
  const [formError, setFormError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  /**
   * Attach to the form container so the first invalid field can be focused
   * after a failed submit. Falls back to the whole document when omitted.
   */
  const formRef = React.useRef<HTMLDivElement | null>(null);
  const shouldFocusFirstError = React.useRef(false);

  const setField = React.useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setValues((prev) => ({ ...prev, [key]: value }));
      setErrors((prev) =>
        prev[key] !== undefined ? { ...prev, [key]: undefined } : prev,
      );
      setFormError(null);
    },
    [],
  );

  const reset = React.useCallback(() => {
    setValues(defaultValues);
    setErrors({});
    setFormError(null);
    setSubmitting(false);
  }, [defaultValues]);

  /** Validates and submits. Resolves to `true` only when submit succeeded. */
  const handleSubmit = React.useCallback(async (): Promise<boolean> => {
    const nextErrors = validate?.(values) ?? {};
    if (Object.values(nextErrors).some(Boolean)) {
      setErrors(nextErrors);
      setFormError(null);
      shouldFocusFirstError.current = true;
      return false;
    }

    setErrors({});
    setFormError(null);
    setSubmitting(true);
    try {
      await onSubmit(values);
      return true;
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Something went wrong");
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [values, validate, onSubmit]);

  React.useEffect(() => {
    if (!shouldFocusFirstError.current) return;
    shouldFocusFirstError.current = false;
    const root = formRef.current ?? document;
    root.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  }, [errors]);

  return {
    values,
    errors,
    formError,
    submitting,
    setField,
    reset,
    handleSubmit,
    formRef,
  };
}
