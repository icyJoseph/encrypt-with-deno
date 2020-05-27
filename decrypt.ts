import { decodeString } from "https://deno.land/std@v0.50.0/encoding/hex.ts";
import { concat } from "https://deno.land/std/bytes/mod.ts";

import { decrypt } from "./aes.ts";
import { deflate_decode_raw } from "./flate.ts";
import { curry, pipe, collectFromBuffer, withPadding } from "./helpers.ts";

const decodeBuffer = async (buffer: Deno.Reader): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer);
  let result: Uint8Array = new Uint8Array();

  for await (const chunk of stream) {
    const decoded = deflate_decode_raw(chunk);

    result = concat(result, decoded);
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

// read file
const [filename, keyLocation, asTxt = false] = Deno.args;

const hexKey = await Deno.readTextFile(keyLocation);
const key = decodeString(hexKey);

const raw = await Deno.readTextFile(filename);
const buffer = new Deno.Buffer(decodeString(raw));

const uncipher = curry<Uint8Array, Deno.Reader, Uint8Array>(decryptBuffer)(key);
const decrypted = await pipe(uncipher, decodeBuffer)(buffer);

const [name, , ext] = filename.split(".");

const recovered = await collectFromBuffer(decrypted);

const recoveredName = `${name}.dec.${ext}`;

if (asTxt) {
  // little hack to remove the padding added during the encryption process
  const data = new TextDecoder().decode(recovered.filter((e) => e));
  console.log("Saving as text file");
  await Deno.writeTextFile(recoveredName, data);
} else {
  await Deno.writeFile(recoveredName, recovered);
}

console.log(`Recovered ${filename} as ${recoveredName}!`);
