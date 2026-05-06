export type LocalFileReadMode = 'text' | 'arrayBuffer' | 'dataUrl';

export interface LocalFileInput {
  file: File;
  name: string;
  size: number;
  type: string;
  text?: string;
  arrayBuffer?: ArrayBuffer;
  dataUrl?: string;
}

export function getLocalFileValidationError(
  files: File[],
  accept?: string,
): string | null {
  const emptyFile = files.find((file) => file.size === 0);

  if (emptyFile) {
    return `빈 파일은 처리할 수 없습니다. 내용이 있는 파일을 선택해주세요: ${emptyFile.name}`;
  }

  const unsupportedFile = files.find((file) => !isAcceptedLocalFile(file, accept));

  if (unsupportedFile) {
    return `지원하지 않는 파일 형식입니다. 다른 형식의 파일을 선택해주세요: ${unsupportedFile.name}`;
  }

  return null;
}

export function isAcceptedLocalFile(file: File, accept?: string): boolean {
  if (!accept?.trim()) {
    return true;
  }

  const fileName = file.name.toLowerCase();
  const fileType = file.type.toLowerCase();
  const acceptTokens = accept
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);

  return acceptTokens.some((token) => {
    if (token.startsWith('.')) {
      return fileName.endsWith(token);
    }

    if (token.endsWith('/*')) {
      return fileType.startsWith(token.slice(0, -1));
    }

    return fileType === token;
  });
}

export function readLocalFileInput(
  file: File,
  mode: LocalFileReadMode = 'text',
): Promise<LocalFileInput> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const baseInput = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
      };

      if (mode === 'arrayBuffer') {
        resolve({
          ...baseInput,
          arrayBuffer: reader.result as ArrayBuffer,
        });
        return;
      }

      if (mode === 'dataUrl') {
        resolve({
          ...baseInput,
          dataUrl: String(reader.result ?? ''),
        });
        return;
      }

      resolve({
        ...baseInput,
        text: String(reader.result ?? ''),
      });
    };

    reader.onerror = () => {
      reject(new Error('파일을 브라우저에서 읽는 중 오류가 발생했습니다.'));
    };

    if (mode === 'arrayBuffer') {
      reader.readAsArrayBuffer(file);
      return;
    }

    if (mode === 'dataUrl') {
      reader.readAsDataURL(file);
      return;
    }

    reader.readAsText(file);
  });
}

export function readLocalFileInputs(
  files: File[],
  mode: LocalFileReadMode = 'text',
): Promise<LocalFileInput[]> {
  return Promise.all(files.map((file) => readLocalFileInput(file, mode)));
}
