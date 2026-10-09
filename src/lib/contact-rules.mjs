export const attachmentLimit = 5 * 1024 * 1024;
export const attachmentAccept = '.pdf,.doc,.docs,.docx,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.avif,.heic,.heif,.tif,.tiff,.bmp,.ico,.dcx,.jp2,.jxl,.psd,.exr';
const attachmentExtensions = new Set(attachmentAccept.split(','));
const archivedExtensions = new Set(['.docs', '.md', '.webp', '.svg', '.avif', '.heic', '.heif', '.ico', '.dcx', '.jp2', '.jxl', '.psd', '.exr']);

function attachmentExtension(name) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

export function attachmentDeliveryName(name) {
  // Brevo's Unicode attachment headers can fail the receiving service's DKIM check.
  if (/[^\x20-\x7e]/.test(name)) return 'attachment.zip';
  return archivedExtensions.has(attachmentExtension(name)) ? `${name}.zip` : name;
}

export function attachmentRequiresArchive(name) {
  return attachmentDeliveryName(name) !== name;
}

export function attachmentError(file) {
  if (!file || (!file.name && file.size === 0)) return null;
  if (file.size > attachmentLimit) return 'fileSizeError';
  if (file.size === 0) return 'fileEmptyError';
  const extension = attachmentExtension(file.name);
  if (!attachmentExtensions.has(extension) || /[\\/\u0000-\u001f\u007f]/.test(file.name) || file.name.length > 180) {
    return 'fileTypeError';
  }
  return null;
}
