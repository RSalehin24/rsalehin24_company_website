export const attachmentLimit = 5 * 1024 * 1024;
export const attachmentAccept = '.pdf,.doc,.docx,.txt,.png,.jpg,.jpeg';
const attachmentExtensions = new Set(attachmentAccept.split(','));

export function attachmentError(file) {
  if (!file || (!file.name && file.size === 0)) return null;
  if (file.size > attachmentLimit) return 'fileSizeError';
  if (file.size === 0) return 'fileEmptyError';
  const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
  if (!attachmentExtensions.has(extension) || /[\\/\u0000-\u001f\u007f]/.test(file.name) || file.name.length > 180) {
    return 'fileTypeError';
  }
  return null;
}
