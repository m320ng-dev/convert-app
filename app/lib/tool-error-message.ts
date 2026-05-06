export const DEFAULT_TOOL_ERROR_MESSAGE =
  '처리 중 오류가 발생했습니다. 입력값을 확인한 뒤 다시 시도해주세요.';

export const DEFAULT_INPUT_VALIDATION_ERROR_MESSAGE = '입력값을 확인해주세요.';

export const DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE =
  '입력값이 너무 깁니다. 내용을 줄인 뒤 다시 시도해주세요.';

export const ERROR_RECOVERY_MESSAGE = '오류를 해결하면 결과가 표시됩니다.';

export const INPUT_VALIDATION_ERROR_STATE = 'input-validation-error';

export const INPUT_VALIDATION_ERROR_RENDERING = {
  component: 'ToolValidationMessage',
  tone: 'error',
  role: 'alert',
  ariaLive: 'polite',
  dataValidationState: 'error',
} as const;

export const MAX_TEXT_TOOL_INPUT_LENGTH = 100000;

export interface InputValidationFailure {
  state: typeof INPUT_VALIDATION_ERROR_STATE;
  message: string;
  emptyMessage: typeof ERROR_RECOVERY_MESSAGE;
}

export interface ToolConversionResult {
  output: string;
  error: string | null;
  emptyMessage: string;
}

export interface ToolConversionOptions {
  input: string;
  transform: (input: string) => string;
  emptyInputMessage: string;
  emptyResultMessage: string;
  defaultErrorMessage?: string;
  maxInputLength?: number;
  excessiveInputMessage?: string;
}

export function resolveToolErrorMessage(
  error: unknown,
  fallbackMessage = DEFAULT_TOOL_ERROR_MESSAGE,
) {
  if (error instanceof Error) {
    return error.message.trim() || fallbackMessage;
  }

  if (typeof error === 'string') {
    return error.trim() || fallbackMessage;
  }

  return fallbackMessage;
}

export function createInputValidationFailure(
  message: unknown = DEFAULT_INPUT_VALIDATION_ERROR_MESSAGE,
): InputValidationFailure {
  return {
    state: INPUT_VALIDATION_ERROR_STATE,
    message: resolveToolErrorMessage(message, DEFAULT_INPUT_VALIDATION_ERROR_MESSAGE),
    emptyMessage: ERROR_RECOVERY_MESSAGE,
  };
}

export function validateToolTextInput(
  input: string,
  emptyInputMessage: string,
  {
    maxLength = MAX_TEXT_TOOL_INPUT_LENGTH,
    excessiveInputMessage = DEFAULT_EXCESSIVE_INPUT_ERROR_MESSAGE,
  }: {
    maxLength?: number;
    excessiveInputMessage?: string;
  } = {},
): InputValidationFailure | null {
  if (!input.trim()) {
    return createInputValidationFailure(emptyInputMessage);
  }

  if (input.length > maxLength) {
    return createInputValidationFailure(excessiveInputMessage);
  }

  return null;
}

export function executeToolConversion({
  input,
  transform,
  emptyInputMessage,
  emptyResultMessage,
  defaultErrorMessage = DEFAULT_TOOL_ERROR_MESSAGE,
  maxInputLength,
  excessiveInputMessage,
}: ToolConversionOptions): ToolConversionResult {
  const validationFailure = validateToolTextInput(input, emptyInputMessage, {
    maxLength: maxInputLength,
    excessiveInputMessage,
  });

  if (validationFailure) {
    return {
      output: '',
      error: validationFailure.message,
      emptyMessage: validationFailure.emptyMessage,
    };
  }

  try {
    return {
      output: transform(input),
      error: null,
      emptyMessage: emptyResultMessage,
    };
  } catch (error) {
    return {
      output: '',
      error: resolveToolErrorMessage(error, defaultErrorMessage),
      emptyMessage: ERROR_RECOVERY_MESSAGE,
    };
  }
}
