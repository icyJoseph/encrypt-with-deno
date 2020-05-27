import { encodeToString } from "https://deno.land/std@v0.50.0/encoding/hex.ts";
import { concat } from "https://deno.land/std/bytes/mod.ts";

import { encrypt } from "./aes.ts";
import { deflate_encode_raw } from "./flate.ts";
import {
  curry,
  pipe,
  randomBytes,
  collectFromBuffer,
  withPadding
} from "./helpers.ts";

const encodeBuffer = async (buffer: Deno.Reader): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer);
  let result: Uint8Array = new Uint8Array();
  for await (const chunk of stream) {
    const encoded = deflate_encode_raw(chunk);
    result = concat(result, encoded);
  }
  return result;
};

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

// read file
const [filename] = Deno.args;
const key = randomBytes(16);

const raw = await Deno.open(filename);

const cipher = curry<Uint8Array, Deno.Reader, Uint8Array>(encryptBuffer)(key);
const encrypted = await pipe(cipher, encodeBuffer)(raw);

const [name, ext] = filename.split(".");
const data = await collectFromBuffer(encrypted);
const encryptedName = `${name}.end.${ext}`;
const keyName = `${name}.key`;

Deno.writeTextFile(encryptedName, encodeToString(data));
Deno.writeTextFile(keyName, encodeToString(key));
console.log(`Saving key at ${keyName}`);
console.log(`${filename} encrypted as ${encryptedName}!`);
