import { attachmentDeliveryName, attachmentRequiresArchive, attachmentSafeName, attachmentSafeNames } from '../src/lib/contact-rules.mjs';
import { createAttachmentArchive } from './attachment-archive.mjs';

const encodingChunkSize = 16_384;

function encodeBase64(bytes) {
  let binary = '';
  for (let start = 0; start < bytes.length; start += encodingChunkSize) {
    binary += String.fromCharCode(...bytes.subarray(start, start + encodingChunkSize));
  }
  return btoa(binary);
}

export async function encodeAttachment(file, name = attachmentSafeName(file.name)) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const content = attachmentRequiresArchive(name) ? createAttachmentArchive(name, bytes) : bytes;
  return { name: attachmentDeliveryName(name), content: encodeBase64(content) };
}

export async function encodeAttachments(files) {
  const names = attachmentSafeNames(files);
  const attachments = [];
  for (const [index, file] of files.entries()) attachments.push(await encodeAttachment(file, names[index]));
  return attachments;
}
