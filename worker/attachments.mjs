import { attachmentRequiresArchive } from '../src/lib/contact-rules.mjs';
import { createAttachmentArchive } from './attachment-archive.mjs';

const encodingChunkSize = 16_384;

function encodeBase64(bytes) {
  let binary = '';
  for (let start = 0; start < bytes.length; start += encodingChunkSize) {
    binary += String.fromCharCode(...bytes.subarray(start, start + encodingChunkSize));
  }
  return btoa(binary);
}

export async function encodeAttachment(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (!attachmentRequiresArchive(file.name)) return { name: file.name, content: encodeBase64(bytes) };
  const archive = createAttachmentArchive(file.name, bytes);
  return { name: `${file.name}.zip`, content: encodeBase64(archive) };
}
