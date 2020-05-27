import {
  encodeToString,
  decodeString
} from "https://deno.land/std@v0.50.0/encoding/hex.ts";
import { concat } from "https://deno.land/std/bytes/mod.ts";

import { encrypt, decrypt } from "./aes.ts";
import { deflate_encode_raw, deflate_decode_raw } from "./flate.ts";

// helpers
const randomBytes = (len = 16) => crypto.getRandomValues(new Uint8Array(len));

const encodeBuffer = async (buffer: Deno.Reader): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer);
  let result: Uint8Array = new Uint8Array();
  for await (const chunk of stream) {
    const encoded = deflate_encode_raw(chunk);
    result = concat(result, encoded);
  }
  return result;
};

const decodeBuffer = async (buffer: Deno.Reader): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer);
  let result: Uint8Array = new Uint8Array();

  for await (const chunk of stream) {
    const decoded = deflate_decode_raw(chunk);

    result = concat(result, decoded);
  }

  return result;
};

const withPadding = (arr: Uint8Array) =>
  arr.length < 16 ? concat(arr, new Uint8Array(16 - arr.length)) : arr;

const encryptBuffer = async (
  key: Uint8Array,
  buffer: Deno.Reader
): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer, { bufSize: 16 });

  let result: Uint8Array = new Uint8Array();

  for await (const chunk of stream) {
    const padded = withPadding(chunk);
    const encrypted = encrypt(padded, key);

    result = concat(result, encrypted);
  }

  return result;
};

const decryptBuffer = async (
  key: Uint8Array,
  buffer: Deno.Reader
): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer, { bufSize: 16 });

  let result: Uint8Array = new Uint8Array();

  for await (const chunk of stream) {
    const padded = withPadding(chunk);
    const decrypted = decrypt(padded, key);

    result = concat(result, decrypted);
  }

  return result;
};

const collectFromBuffer = async (buffer: Deno.Reader): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer);

  let result: Uint8Array = new Uint8Array();

  for await (const chunk of stream) {
    result = concat(result, chunk);
  }

  return result;
};

type Fn<T, G, Z> = (a: T, b: G) => Z | Promise<Z>;

const curry = <T, G, R>(fn: Fn<T, G, R>) => (a: T) => (b: G) => fn(a, b);

type Pipeable<T> = (buffer: Deno.Reader) => T | Promise<T>;

const pipe = <T extends Uint8Array>(...fns: Pipeable<T>[]) => async (
  reader: Deno.Reader
) => {
  let next = new Deno.Buffer();

  for await (const fn of fns) {
    let result = await fn(reader);
    next.readFrom(new Deno.Buffer(result));
  }
  return next;
};

// create decoder
const decoder = new TextDecoder("utf-8");

// read file
const [filename] = Deno.args;
const key = randomBytes(16);

const raw = await Deno.open(filename);

const cipher = curry<Uint8Array, Deno.Reader, Uint8Array>(encryptBuffer)(key);
const encrypted = await pipe(cipher, encodeBuffer)(raw);

// save key to a file

const uncipher = curry<Uint8Array, Deno.Reader, Uint8Array>(decryptBuffer)(key);
const decrypted = await pipe(uncipher, decodeBuffer)(encrypted);

// recovery
const recovered = await collectFromBuffer(decrypted);
let text = await decoder.decode(recovered);

console.log(text);
