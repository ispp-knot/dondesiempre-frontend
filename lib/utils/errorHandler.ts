export function getUploadErrorMessage(err: unknown, defaultMessage: string): string {
  const fetchError = err as { status?: number; response?: { status?: number } };
  const statusCode = fetchError.status || fetchError.response?.status;

  if (statusCode === 413) {
    return 'La imagen es demasiado grande. Por favor, intenta con una que pese menos.';
  }

  return defaultMessage;
}
