export const DEFAULT_CLIPBOARD_COPY_ERROR_MESSAGE = '클립보드에 복사하지 못했습니다.';

type ClipboardWriter = Pick<Clipboard, 'writeText'>;

export type ClipboardCopyResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export interface ClipboardCopyOptions {
  copiedMessage?: string;
  emptyMessage: string;
  errorMessage?: string;
  clipboard?: ClipboardWriter | null;
}

export async function copyTextToClipboard(
  value: string | null | undefined,
  {
    copiedMessage = '클립보드에 복사했습니다.',
    emptyMessage,
    errorMessage = DEFAULT_CLIPBOARD_COPY_ERROR_MESSAGE,
    clipboard = getBrowserClipboard(),
  }: ClipboardCopyOptions,
): Promise<ClipboardCopyResult> {
  if (!value) {
    return {
      ok: false,
      message: emptyMessage,
    };
  }

  if (!clipboard?.writeText) {
    return {
      ok: false,
      message: errorMessage,
    };
  }

  try {
    await clipboard.writeText(value);

    return {
      ok: true,
      message: copiedMessage,
    };
  } catch {
    return {
      ok: false,
      message: errorMessage,
    };
  }
}

function getBrowserClipboard(): ClipboardWriter | null {
  if (typeof navigator === 'undefined') {
    return null;
  }

  return navigator.clipboard ?? null;
}
