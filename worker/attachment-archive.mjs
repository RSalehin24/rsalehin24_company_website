const utf8Flag = 0x0800;
const zipVersion = 20;
const dosEpochDate = 0x0021;
const checksumPolynomial = 0xedb88320;

const checksumTable = Object.freeze(Array.from({ length: 256 }, (_, value) => {
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ ((value & 1) ? checksumPolynomial : 0);
  return value >>> 0;
}));

function checksumFor(bytes) {
  let checksum = 0xffffffff;
  for (const byte of bytes) checksum = (checksum >>> 8) ^ checksumTable[(checksum ^ byte) & 0xff];
  return (checksum ^ 0xffffffff) >>> 0;
}

function zipHeader(length, fields) {
  const bytes = new Uint8Array(length);
  const view = new DataView(bytes.buffer);
  for (const [offset, bits, value] of fields) {
    if (bits === 16) view.setUint16(offset, value, true);
    else view.setUint32(offset, value, true);
  }
  return bytes;
}

function localHeader(entry) {
  return zipHeader(30, [
    [0, 32, 0x04034b50], [4, 16, zipVersion], [6, 16, utf8Flag],
    [12, 16, dosEpochDate], [14, 32, entry.checksum],
    [18, 32, entry.content.length], [22, 32, entry.content.length], [26, 16, entry.name.length],
  ]);
}

function directoryHeader(entry) {
  return zipHeader(46, [
    [0, 32, 0x02014b50], [4, 16, zipVersion], [6, 16, zipVersion], [8, 16, utf8Flag],
    [14, 16, dosEpochDate], [16, 32, entry.checksum],
    [20, 32, entry.content.length], [24, 32, entry.content.length], [28, 16, entry.name.length],
    [38, 32, 0x20],
  ]);
}

function joinBytes(parts) {
  const result = new Uint8Array(parts.reduce((length, part) => length + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

// A stored ZIP preserves files that Brevo cannot attach under their original extensions.
export function createAttachmentArchive(name, content) {
  const entry = { name: new TextEncoder().encode(name), content, checksum: checksumFor(content) };
  const local = localHeader(entry);
  const directory = directoryHeader(entry);
  const end = zipHeader(22, [
    [0, 32, 0x06054b50], [8, 16, 1], [10, 16, 1],
    [12, 32, directory.length + entry.name.length],
    [16, 32, local.length + entry.name.length + content.length],
  ]);
  return joinBytes([local, entry.name, content, directory, entry.name, end]);
}
