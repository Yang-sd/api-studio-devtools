(function(global) {
  'use strict';

  var MAX_VERSION = 40;
  var ECC_CODEWORDS_PER_BLOCK = [
    0,
    7, 10, 15, 20, 26, 18, 20, 24, 30, 18,
    20, 24, 26, 30, 22, 24, 28, 30, 28, 28,
    28, 28, 30, 30, 26, 28, 30, 30, 30, 30,
    30, 30, 30, 30, 30, 30, 30, 30, 30, 30
  ];
  var ERROR_CORRECTION_BLOCKS = [
    0,
    1, 1, 1, 1, 1, 2, 2, 2, 2, 4,
    4, 4, 4, 4, 6, 6, 6, 6, 7, 8,
    8, 9, 9, 10, 12, 12, 12, 13, 14, 15,
    16, 17, 18, 19, 19, 20, 21, 22, 24, 25
  ];

  var EXP = [];
  var LOG = [];
  var generatorCache = {};

  (function initGaloisField() {
    var x = 1;
    for (var i = 0; i < 255; i++) {
      EXP[i] = x;
      LOG[x] = i;
      x <<= 1;
      if (x & 0x100) x ^= 0x11d;
    }
    for (var j = 255; j < 512; j++) EXP[j] = EXP[j - 255];
  })();

  function create(text) {
    var bytes = utf8Bytes(String(text || ''));
    if (!bytes.length) throw new Error('EMPTY_INPUT');
    var version = chooseVersion(bytes.length);
    var info = getVersionInfo(version);
    var dataCodewords = makeDataCodewords(bytes, info, version);
    var blocks = makeBlocks(dataCodewords, info);
    var codewords = interleaveCodewords(blocks, info.ecc);
    var modules = buildMatrix(version, codewords, info.align);
    return {
      version: version,
      size: modules.length,
      bytes: bytes.length,
      modules: modules
    };
  }

  function utf8Bytes(text) {
    if (typeof TextEncoder !== 'undefined') return Array.prototype.slice.call(new TextEncoder().encode(text));
    var encoded = unescape(encodeURIComponent(text));
    var out = [];
    for (var i = 0; i < encoded.length; i++) out.push(encoded.charCodeAt(i));
    return out;
  }

  function chooseVersion(byteLength) {
    for (var version = 1; version <= MAX_VERSION; version++) {
      if (byteLength <= getByteCapacity(version)) return version;
    }
    throw new Error('TOO_LONG');
  }

  function getByteCapacity(version) {
    var info = getVersionInfo(version);
    var capacityBits = sum(info.data) * 8;
    var countBits = version < 10 ? 8 : 16;
    return Math.floor((capacityBits - 4 - countBits) / 8);
  }

  function getVersionInfo(version) {
    var ecc = ECC_CODEWORDS_PER_BLOCK[version];
    var blockCount = ERROR_CORRECTION_BLOCKS[version];
    var rawCodewords = Math.floor(getNumRawDataModules(version) / 8);
    var shortBlockCount = blockCount - rawCodewords % blockCount;
    var shortBlockDataLength = Math.floor(rawCodewords / blockCount) - ecc;
    var data = [];
    for (var i = 0; i < blockCount; i++) data.push(shortBlockDataLength + (i < shortBlockCount ? 0 : 1));
    return { data: data, ecc: ecc, align: getAlignmentPatternPositions(version) };
  }

  function getNumRawDataModules(version) {
    var result = (16 * version + 128) * version + 64;
    if (version >= 2) {
      var numAlign = Math.floor(version / 7) + 2;
      result -= (25 * numAlign - 10) * numAlign - 55;
      if (version >= 7) result -= 36;
    }
    return result;
  }

  function getAlignmentPatternPositions(version) {
    if (version === 1) return [];
    var size = version * 4 + 17;
    var numAlign = Math.floor(version / 7) + 2;
    var step = version === 32 ? 26 : Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2;
    var positions = [6];
    for (var pos = size - 7; positions.length < numAlign; pos -= step) positions.splice(1, 0, pos);
    return positions;
  }

  function makeDataCodewords(bytes, info, version) {
    var bits = [];
    var capacityBits = sum(info.data) * 8;
    appendBits(bits, 0x4, 4);
    appendBits(bits, bytes.length, version < 10 ? 8 : 16);
    for (var i = 0; i < bytes.length; i++) appendBits(bits, bytes[i], 8);
    var terminator = Math.min(4, capacityBits - bits.length);
    appendBits(bits, 0, terminator);
    while (bits.length % 8 !== 0) bits.push(0);

    var codewords = [];
    for (var j = 0; j < bits.length; j += 8) {
      var value = 0;
      for (var k = 0; k < 8; k++) value = (value << 1) | bits[j + k];
      codewords.push(value);
    }
    var pad = 0xec;
    while (codewords.length < sum(info.data)) {
      codewords.push(pad);
      pad = pad === 0xec ? 0x11 : 0xec;
    }
    return codewords;
  }

  function appendBits(bits, value, length) {
    for (var i = length - 1; i >= 0; i--) bits.push((value >>> i) & 1);
  }

  function makeBlocks(dataCodewords, info) {
    var blocks = [];
    var offset = 0;
    for (var i = 0; i < info.data.length; i++) {
      var length = info.data[i];
      var data = dataCodewords.slice(offset, offset + length);
      offset += length;
      blocks.push({ data: data, ecc: reedSolomonRemainder(data, info.ecc) });
    }
    return blocks;
  }

  function interleaveCodewords(blocks, eccLength) {
    var result = [];
    var maxDataLength = 0;
    blocks.forEach(function(block) { maxDataLength = Math.max(maxDataLength, block.data.length); });
    for (var i = 0; i < maxDataLength; i++) {
      blocks.forEach(function(block) {
        if (i < block.data.length) result.push(block.data[i]);
      });
    }
    for (var j = 0; j < eccLength; j++) {
      blocks.forEach(function(block) { result.push(block.ecc[j]); });
    }
    return result;
  }

  function reedSolomonRemainder(data, degree) {
    var gen = reedSolomonGenerator(degree);
    var rem = new Array(degree);
    for (var i = 0; i < degree; i++) rem[i] = 0;
    data.forEach(function(byte) {
      var factor = byte ^ rem[0];
      rem.shift();
      rem.push(0);
      if (!factor) return;
      for (var j = 0; j < degree; j++) rem[j] ^= gfMultiply(gen[j + 1], factor);
    });
    return rem;
  }

  function reedSolomonGenerator(degree) {
    if (generatorCache[degree]) return generatorCache[degree];
    var poly = [1];
    for (var i = 0; i < degree; i++) {
      var next = new Array(poly.length + 1);
      for (var n = 0; n < next.length; n++) next[n] = 0;
      for (var j = 0; j < poly.length; j++) {
        next[j] ^= poly[j];
        next[j + 1] ^= gfMultiply(poly[j], EXP[i]);
      }
      poly = next;
    }
    generatorCache[degree] = poly;
    return poly;
  }

  function gfMultiply(a, b) {
    if (!a || !b) return 0;
    return EXP[LOG[a] + LOG[b]];
  }

  function buildMatrix(version, codewords, alignPositions) {
    var size = version * 4 + 17;
    var modules = makeGrid(size, null);
    var functions = makeGrid(size, false);

    function setFunction(x, y, dark) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      modules[y][x] = !!dark;
      functions[y][x] = true;
    }

    function reserve(x, y) {
      if (x < 0 || y < 0 || x >= size || y >= size) return;
      if (modules[y][x] === null) modules[y][x] = false;
      functions[y][x] = true;
    }

    drawFinder(setFunction, 0, 0, size);
    drawFinder(setFunction, size - 7, 0, size);
    drawFinder(setFunction, 0, size - 7, size);
    drawTiming(setFunction, size);
    drawAlignments(setFunction, functions, alignPositions, size);
    reserveFormatAreas(reserve, size);
    if (version >= 7) drawVersionInfo(setFunction, version, size);
    setFunction(8, size - 8, true);
    placeDataBits(modules, functions, codewords);

    var best = null;
    var bestPenalty = Infinity;
    for (var mask = 0; mask < 8; mask++) {
      var candidate = applyMask(modules, functions, mask);
      drawFormatInfo(candidate, mask);
      var penalty = getPenalty(candidate);
      if (penalty < bestPenalty) {
        bestPenalty = penalty;
        best = candidate;
      }
    }
    return best;
  }

  function makeGrid(size, value) {
    var grid = [];
    for (var y = 0; y < size; y++) {
      var row = [];
      for (var x = 0; x < size; x++) row.push(value);
      grid.push(row);
    }
    return grid;
  }

  function drawFinder(setFunction, left, top, size) {
    for (var dy = -1; dy <= 7; dy++) {
      for (var dx = -1; dx <= 7; dx++) {
        var x = left + dx;
        var y = top + dy;
        if (x < 0 || y < 0 || x >= size || y >= size) continue;
        var dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 &&
          (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        setFunction(x, y, dark);
      }
    }
  }

  function drawTiming(setFunction, size) {
    for (var i = 8; i < size - 8; i++) {
      setFunction(i, 6, i % 2 === 0);
      setFunction(6, i, i % 2 === 0);
    }
  }

  function drawAlignments(setFunction, functions, positions, size) {
    if (!positions || positions.length === 0) return;
    positions.forEach(function(cx) {
      positions.forEach(function(cy) {
        if (isFinderOverlap(cx, cy, size)) return;
        for (var dy = -2; dy <= 2; dy++) {
          for (var dx = -2; dx <= 2; dx++) {
            setFunction(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
          }
        }
      });
    });
  }

  function isFinderOverlap(cx, cy, size) {
    return (cx <= 8 && cy <= 8) ||
      (cx >= size - 9 && cy <= 8) ||
      (cx <= 8 && cy >= size - 9);
  }

  function reserveFormatAreas(reserve, size) {
    for (var i = 0; i <= 8; i++) {
      if (i !== 6) {
        reserve(8, i);
        reserve(i, 8);
      }
    }
    for (var j = 0; j < 8; j++) {
      reserve(size - 1 - j, 8);
      reserve(8, size - 1 - j);
    }
  }

  function drawVersionInfo(setFunction, version, size) {
    var bits = getVersionBits(version);
    for (var i = 0; i < 18; i++) {
      var dark = ((bits >>> i) & 1) !== 0;
      setFunction(size - 11 + (i % 3), Math.floor(i / 3), dark);
      setFunction(Math.floor(i / 3), size - 11 + (i % 3), dark);
    }
  }

  function getVersionBits(version) {
    var rem = version << 12;
    for (var i = 17; i >= 12; i--) {
      if (((rem >>> i) & 1) !== 0) rem ^= 0x1f25 << (i - 12);
    }
    return (version << 12) | (rem & 0xfff);
  }

  function placeDataBits(modules, functions, codewords) {
    var bits = [];
    codewords.forEach(function(codeword) { appendBits(bits, codeword, 8); });
    var size = modules.length;
    var bitIndex = 0;
    var upward = true;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right--;
      for (var vert = 0; vert < size; vert++) {
        var y = upward ? size - 1 - vert : vert;
        for (var j = 0; j < 2; j++) {
          var x = right - j;
          if (functions[y][x]) continue;
          modules[y][x] = bitIndex < bits.length ? bits[bitIndex] === 1 : false;
          bitIndex++;
        }
      }
      upward = !upward;
    }
  }

  function applyMask(modules, functions, mask) {
    var size = modules.length;
    var out = [];
    for (var y = 0; y < size; y++) {
      var row = [];
      for (var x = 0; x < size; x++) {
        var dark = modules[y][x] === true;
        if (!functions[y][x] && maskCondition(mask, x, y)) dark = !dark;
        row.push(dark);
      }
      out.push(row);
    }
    return out;
  }

  function maskCondition(mask, x, y) {
    switch (mask) {
      case 0: return (x + y) % 2 === 0;
      case 1: return y % 2 === 0;
      case 2: return x % 3 === 0;
      case 3: return (x + y) % 3 === 0;
      case 4: return (Math.floor(y / 2) + Math.floor(x / 3)) % 2 === 0;
      case 5: return ((x * y) % 2 + (x * y) % 3) === 0;
      case 6: return (((x * y) % 2 + (x * y) % 3) % 2) === 0;
      case 7: return (((x + y) % 2 + (x * y) % 3) % 2) === 0;
      default: return false;
    }
  }

  function drawFormatInfo(modules, mask) {
    var size = modules.length;
    var bits = getFormatBits(mask);
    function bit(i) { return ((bits >>> i) & 1) !== 0; }
    for (var i = 0; i <= 5; i++) modules[i][8] = bit(i);
    modules[7][8] = bit(6);
    modules[8][8] = bit(7);
    modules[8][7] = bit(8);
    for (var j = 9; j < 15; j++) modules[8][14 - j] = bit(j);
    for (var k = 0; k < 8; k++) modules[8][size - 1 - k] = bit(k);
    for (var m = 8; m < 15; m++) modules[size - 15 + m][8] = bit(m);
    modules[size - 8][8] = true;
  }

  function getFormatBits(mask) {
    var data = (1 << 3) | mask;
    var rem = data << 10;
    for (var i = 14; i >= 10; i--) {
      if (((rem >>> i) & 1) !== 0) rem ^= 0x537 << (i - 10);
    }
    return ((data << 10) | (rem & 0x3ff)) ^ 0x5412;
  }

  function getPenalty(modules) {
    var size = modules.length;
    var penalty = 0;
    for (var y = 0; y < size; y++) penalty += penaltyLine(modules[y]);
    for (var x = 0; x < size; x++) {
      var col = [];
      for (var cy = 0; cy < size; cy++) col.push(modules[cy][x]);
      penalty += penaltyLine(col);
    }
    for (var yy = 0; yy < size - 1; yy++) {
      for (var xx = 0; xx < size - 1; xx++) {
        var c = modules[yy][xx];
        if (c === modules[yy][xx + 1] && c === modules[yy + 1][xx] && c === modules[yy + 1][xx + 1]) penalty += 3;
      }
    }
    for (var r = 0; r < size; r++) penalty += penaltyPattern(modules[r]);
    for (var c2 = 0; c2 < size; c2++) {
      var line = [];
      for (var r2 = 0; r2 < size; r2++) line.push(modules[r2][c2]);
      penalty += penaltyPattern(line);
    }
    var dark = 0;
    for (var py = 0; py < size; py++) for (var px = 0; px < size; px++) if (modules[py][px]) dark++;
    penalty += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
    return penalty;
  }

  function penaltyLine(line) {
    var penalty = 0;
    var runColor = line[0];
    var runLength = 1;
    for (var i = 1; i < line.length; i++) {
      if (line[i] === runColor) {
        runLength++;
      } else {
        if (runLength >= 5) penalty += 3 + runLength - 5;
        runColor = line[i];
        runLength = 1;
      }
    }
    if (runLength >= 5) penalty += 3 + runLength - 5;
    return penalty;
  }

  function penaltyPattern(line) {
    var penalty = 0;
    var pattern = [true, false, true, true, true, false, true];
    for (var i = 0; i <= line.length - 7; i++) {
      var match = true;
      for (var j = 0; j < 7; j++) {
        if (line[i + j] !== pattern[j]) { match = false; break; }
      }
      if (!match) continue;
      var before = i >= 4 && !line[i - 1] && !line[i - 2] && !line[i - 3] && !line[i - 4];
      var after = i + 11 <= line.length && !line[i + 7] && !line[i + 8] && !line[i + 9] && !line[i + 10];
      if (before || after) penalty += 40;
    }
    return penalty;
  }

  function sum(values) {
    var total = 0;
    values.forEach(function(value) { total += value; });
    return total;
  }

  global.ApiStudioQr = { create: create, maxBytes: getByteCapacity(MAX_VERSION) };
})(this);
