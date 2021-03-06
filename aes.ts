// load wasm
const binary = await Deno.readFile("./wasm_aes_soft.wasm");
const wasmModule = new WebAssembly.Module(binary);
const instance = await WebAssembly.instantiate(wasmModule);
const wasm = instance.exports;

let cachegetUint8Memory0: Uint8Array | null = null;

function getUint8Memory0() {
  if (
    cachegetUint8Memory0 === null ||
    cachegetUint8Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetUint8Memory0 = new Uint8Array(wasm.memory.buffer);
  }
  return cachegetUint8Memory0;
}

let WASM_VECTOR_LEN = 0;

function passArray8ToWasm0(arg: Uint8Array, malloc: (a: number) => number) {
  const ptr = malloc(arg.length * 1);
  getUint8Memory0().set(arg, ptr / 1);
  WASM_VECTOR_LEN = arg.length;
  return ptr;
}

let cachegetInt32Memory0: Int32Array | null = null;

function getInt32Memory0() {
  if (
    cachegetInt32Memory0 === null ||
    cachegetInt32Memory0.buffer !== wasm.memory.buffer
  ) {
    cachegetInt32Memory0 = new Int32Array(wasm.memory.buffer);
  }
  return cachegetInt32Memory0;
}

function getArrayU8FromWasm0(ptr: number, len: number) {
  return getUint8Memory0().subarray(ptr / 1, ptr / 1 + len);
}
/**
 * @param {Uint8Array} data
 * @param {Uint8Array} key
 * @returns {Uint8Array}
 */
export function encrypt(data: Uint8Array, key: Uint8Array) {
  var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  wasm.encrypt(8, ptr0, len0, ptr1, len1);
  var r0 = getInt32Memory0()[8 / 4 + 0];
  var r1 = getInt32Memory0()[8 / 4 + 1];
  var v2 = getArrayU8FromWasm0(r0, r1).slice();
  wasm.__wbindgen_free(r0, r1 * 1);
  return v2;
}

/**
 * @param {Uint8Array} data
 * @param {Uint8Array} key
 * @returns {Uint8Array}
 */
export function decrypt(data: Uint8Array, key: Uint8Array) {
  var ptr0 = passArray8ToWasm0(data, wasm.__wbindgen_malloc);
  var len0 = WASM_VECTOR_LEN;
  var ptr1 = passArray8ToWasm0(key, wasm.__wbindgen_malloc);
  var len1 = WASM_VECTOR_LEN;
  wasm.decrypt(8, ptr0, len0, ptr1, len1);
  var r0 = getInt32Memory0()[8 / 4 + 0];
  var r1 = getInt32Memory0()[8 / 4 + 1];
  var v2 = getArrayU8FromWasm0(r0, r1).slice();
  wasm.__wbindgen_free(r0, r1 * 1);
  return v2;
}
