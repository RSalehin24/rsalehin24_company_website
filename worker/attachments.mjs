import { attachmentDeliveryName } from '../src/lib/contact-rules.mjs';
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
  const name = attachmentDeliveryName(file.name);
  const content = name === file.name ? bytes : createAttachmentArchive(file.name, bytes);
  return { name, content: encodeBase64(content) };
}
