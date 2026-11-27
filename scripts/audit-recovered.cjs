'use strict';

const { createHash } = require('node:crypto');
const { existsSync, readdirSync, readFileSync } = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '..');
const source = path.join(repo, 'Licenciatura 2026-2');
const controls = ['compressed_example.sfs', 'directory_example.sfs', 'encrypted_example.sfs'];
const fixtureBase = 'https://raw.githubusercontent.com/epozzobon/sfs/f04c52617eb4c9aae6164af070109ca071ad81eb/test/assets/';

// AidAim SFSEngine.pas and SFSPassword.pas define the packed header and fast XOR.
const layout = {
  prefixSize: 280, headerSize: 256, pageHeaderSize: 32, directoryEntrySize: 512,
  pageSize: 296, directoryRoot: 320, directoryEntries: 324,
  questionMarker: 400, archiveEncryption: 504, pageEncryption: 9
};

function sha256(bytes) {
  return createHash('sha256').update(bytes).digest('hex');
}

function fastChecksum(bytes) {
  let result = 0;
  for (let offset = 0; offset + 4 <= bytes.length; offset += 4) result ^= bytes.readUInt32LE(offset);
  return result >>> 0;
}

function inspectDat(file, bytes) {
  const result = { file, bytes: bytes.length, sha256: sha256(bytes) };
  if (!bytes.length) return { ...result, format: 'empty' };
  if (bytes.toString('ascii', 0, 8) !== 'AAMVHFSS') return { ...result, format: 'unidentified' };

  const { prefixSize, headerSize, pageHeaderSize, directoryEntrySize } = layout;
  const headerEnd = prefixSize + headerSize;
  const pageSize = bytes.length >= headerEnd ? bytes.readUInt32LE(layout.pageSize) : 0;
  if (bytes.toString('ascii', prefixSize, prefixSize + 8) !== 'AASFSSGN' || pageSize !== 4096) {
    return { ...result, format: 'SFS', error: 'Unsupported or truncated SFS header' };
  }

  const root = bytes.readUInt32LE(layout.directoryRoot);
  const lastPage = Math.floor((bytes.length - prefixSize) / pageSize) - 1;
  if (root < 1 || root > lastPage) return { ...result, format: 'SFS', error: 'Root page out of range' };

  const page = index => {
    const start = prefixSize + pageSize * index;
    return bytes.subarray(start, start + pageSize);
  };
  const directory = page(root);
  let nonEmptyRootEntries = 0;
  let plausibleRootPointers = 0;
  for (let pos = pageHeaderSize; pos + directoryEntrySize <= pageSize; pos += directoryEntrySize) {
    if (directory.subarray(pos, pos + directoryEntrySize).every(byte => byte === 0)) continue;
    nonEmptyRootEntries++;
    const pointer = directory.readInt32LE(pos);
    if (pointer === -1 || (pointer >= 0 && pointer <= lastPage)) plausibleRootPointers++;
  }
  let plainCompressedPages = 0;
  for (let index = 1; index <= lastPage; index++) {
    const candidate = page(index);
    if (candidate[layout.pageEncryption] === 0 &&
        candidate.toString('ascii', pageHeaderSize, pageHeaderSize + 4) === 'AACS' &&
        fastChecksum(candidate.subarray(pageHeaderSize)) === candidate.readUInt32LE(4)) {
      plainCompressedPages++;
    }
  }

  const headerChecksumValid = fastChecksum(bytes.subarray(prefixSize + 12, headerEnd)) === bytes.readUInt32LE(prefixSize + 8);
  const archiveEncryption = bytes[layout.archiveEncryption];
  return {
    ...result, format: 'SFS', version: bytes.readFloatLE(prefixSize + 12).toFixed(2), pageSize,
    headerChecksumValid, archiveEncryption, directoryEncryption: directory[layout.pageEncryption],
    directoryChecksumValid: fastChecksum(directory.subarray(pageHeaderSize)) === directory.readUInt32LE(4),
    declaredDirectoryEntries: bytes.readUInt32LE(layout.directoryEntries), root,
    nonEmptyRootEntries, plausibleRootPointers, plainCompressedPages,
    hasControlQuestion: headerChecksumValid ? archiveEncryption !== 0 && bytes.readUInt32LE(layout.questionMarker) !== 0 : null
  };
}

function inspectDistribution(file) {
  const bytes = readFileSync(path.join(source, file));
  const sfs = Buffer.from('AAMVHFSS');
  const zipEnd = Buffer.from('504b0506', 'hex');
  let sfsCandidates = 0;
  let zipCandidates = 0;
  for (let at = bytes.indexOf(sfs); at !== -1; at = bytes.indexOf(sfs, at + 1)) {
    if (at + 364 > bytes.length || bytes.toString('ascii', at + 280, at + 288) !== 'AASFSSGN') continue;
    const size = bytes.readUInt32LE(at + layout.pageSize);
    const root = bytes.readUInt32LE(at + layout.directoryRoot);
    if (size >= 512 && size <= 65536 && (size & (size - 1)) === 0 && root > 0 &&
        at + layout.prefixSize + (root + 1) * size <= bytes.length) sfsCandidates++;
  }
  for (let at = bytes.indexOf(zipEnd); at !== -1; at = bytes.indexOf(zipEnd, at + 1)) {
    if (at + 22 > bytes.length || at + 22 + bytes.readUInt16LE(at + 20) > bytes.length) continue;
    const entries = bytes.readUInt16LE(at + 10);
    const size = bytes.readUInt32LE(at + 12);
    const directoryOffset = at - size;
    if (entries && size >= 46 && directoryOffset >= 0 &&
        bytes.readUInt32LE(directoryOffset) === 0x02014b50 && bytes.readUInt32LE(at + 16) <= directoryOffset) zipCandidates++;
  }
  return { file, sha256: sha256(bytes), sfsCandidates, zipCandidates };
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length > 1 || (args.length && args[0] !== '--controls')) {
    throw new Error('Uso: node scripts/audit-recovered.cjs [--controls]');
  }
  const dat = readdirSync(source).filter(file => /^excoba.*\.dat$/i.test(file)).sort()
    .map(file => inspectDat(file, readFileSync(path.join(source, file))));
  const distribution = ['DemoExcoba.exe', 'qtintf70.dll', 'SKINS/qtintf70.dll', 'unins000.exe']
    .filter(file => existsSync(path.join(source, file))).map(inspectDistribution);
  const result = { recoveredExists: existsSync(path.join(repo, 'recovered')), dat, distribution };
  if (args.length) {
    result.controls = await Promise.all(controls.map(async file => {
      const response = await fetch(fixtureBase + file, { signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
      return inspectDat(file, Buffer.from(await response.arrayBuffer()));
    }));
  }
  console.log(JSON.stringify(result, null, 2));
}

main().catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
