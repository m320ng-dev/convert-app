'use client';

import { useCallback, useState } from 'react';

export type ToolInputValue =
  | string
  | number
  | boolean
  | null
  | string[]
  | number[]
  | boolean[]
  | Record<string, unknown>;

export type ToolInputValues = Record<string, ToolInputValue>;

export interface ToolInputState<TValues extends ToolInputValues> {
  values: TValues;
  touchedFields: Partial<Record<keyof TValues, boolean>>;
  lastChangedField: keyof TValues | null;
  revision: number;
  updatedAt: number | null;
}

export function createToolInputState<TValues extends ToolInputValues>(
  values: TValues,
): ToolInputState<TValues> {
  return {
    values,
    touchedFields: {},
    lastChangedField: null,
    revision: 0,
    updatedAt: null,
  };
}

export function updateToolInputValue<
  TValues extends ToolInputValues,
  TField extends keyof TValues,
>(
  state: ToolInputState<TValues>,
  field: TField,
  value: TValues[TField],
  updatedAt = Date.now(),
): ToolInputState<TValues> {
  return {
    values: {
      ...state.values,
      [field]: value,
    },
    touchedFields: {
      ...state.touchedFields,
      [field]: true,
    },
    lastChangedField: field,
    revision: state.revision + 1,
    updatedAt,
  };
}

export function updateToolInputValues<TValues extends ToolInputValues>(
  state: ToolInputState<TValues>,
  values: Partial<TValues>,
  updatedAt = Date.now(),
): ToolInputState<TValues> {
  const fields = Object.keys(values) as Array<keyof TValues>;
  const lastChangedField = fields.at(-1) ?? state.lastChangedField;

  return {
    values: {
      ...state.values,
      ...values,
    },
    touchedFields: fields.reduce<Partial<Record<keyof TValues, boolean>>>(
      (currentFields, field) => ({
        ...currentFields,
        [field]: true,
      }),
      state.touchedFields,
    ),
    lastChangedField,
    revision: state.revision + fields.length,
    updatedAt,
  };
}

export function parseToolNumberInput(value: string, fallbackValue: number): number {
  const normalizedValue = value.trim();

  if (!normalizedValue) {
    return fallbackValue;
  }

  const parsedValue = Number(normalizedValue);

  return Number.isFinite(parsedValue) ? parsedValue : fallbackValue;
}

export function useToolInputState<TValues extends ToolInputValues>(
  initialValues: TValues,
) {
  const [inputState, setInputState] = useState(() => createToolInputState(initialValues));

  const setInputValue = useCallback(<TField extends keyof TValues>(
    field: TField,
    value: TValues[TField],
  ) => {
    setInputState((currentState) => updateToolInputValue(currentState, field, value));
  }, []);

  const setInputValues = useCallback((values: Partial<TValues>) => {
    setInputState((currentState) => updateToolInputValues(currentState, values));
  }, []);

  return {
    inputState,
    setInputState,
    setInputValue,
    setInputValues,
  };
}
