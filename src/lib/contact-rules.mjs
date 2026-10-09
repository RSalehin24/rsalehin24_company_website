export const attachmentLimit = 20 * 1024 * 1024;
export const attachmentAccept = '.pdf,.doc,.docs,.docx,.xls,.xlsx,.txt,.md,.jpg,.jpeg,.png,.gif,.webp,.svg,.avif,.heic,.heif,.tif,.tiff,.bmp,.ico,.dcx,.jp2,.jxl,.psd,.exr';
const attachmentExtensions = new Set(attachmentAccept.split(','));
const archivedExtensions = new Set(['.docs', '.md', '.webp', '.svg', '.avif', '.heic', '.heif', '.ico', '.dcx', '.jp2', '.jxl', '.psd', '.exr']);
const attachmentPrefixes = new Map([
  ['.pdf', 'pdf'], ['.doc', 'doc'], ['.docs', 'doc'], ['.docx', 'doc'],
  ['.xls', 'excel'], ['.xlsx', 'excel'], ['.txt', 'text'], ['.md', 'text'],
]);
const safeFilename = /^[a-zA-Z0-9._ -]+$/;

function attachmentExtension(name) {
  return name.slice(name.lastIndexOf('.')).toLowerCase();
}

function nextAttachmentName(context, name) {
  const originalKey = name.toLowerCase();
  if (safeFilename.test(name) && !context.used.has(originalKey)) {
    context.used.add(originalKey);
    return name;
  }
  const extension = attachmentExtension(name);
  const prefix = attachmentPrefixes.get(extension) || 'pic';
  let sequence = context.counts.get(prefix) || 0;
  let filename;
  do {
    sequence += 1;
    filename = `${prefix}_${String(sequence).padStart(2, '0')}${extension}`;
  } while (context.reserved.has(filename.toLowerCase()) || context.used.has(filename.toLowerCase()));
  context.counts.set(prefix, sequence);
  context.used.add(filename.toLowerCase());
  return filename;
}

export function attachmentSafeNames(files) {
  // Reserve existing safe names before allocating replacements to avoid collisions.
  const reserved = new Set(files.filter(file => safeFilename.test(file.name)).map(file => file.name.toLowerCase()));
  const context = { reserved, used: new Set(), counts: new Map() };
  return files.map(file => nextAttachmentName(context, file.name));
}

export function attachmentSafeName(name) {
  return attachmentSafeNames([{ name }])[0];
}

export function attachmentRequiresArchive(name) {
  return archivedExtensions.has(attachmentExtension(name));
}

export function attachmentDeliveryName(name) {
  const filename = attachmentSafeName(name);
  return attachmentRequiresArchive(filename) ? `${filename}.zip` : filename;
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

export function attachmentsError(files) {
  let total = 0;
  for (const file of files) {
    const error = attachmentError(file);
    if (error) return error;
    total += file.size;
  }
  return total > attachmentLimit ? 'fileSizeError' : null;
}
