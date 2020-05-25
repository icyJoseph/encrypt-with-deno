import {
  encodeToString,
  decodeString
} from "https://deno.land/std@v0.50.0/encoding/hex.ts";

import { deflate_encode_raw, deflate_decode_raw } from "./flate.ts";

// create string decoder
const decoder = new TextDecoder("utf-8");

// read file
const [filename] = Deno.args;

const file = await Deno.readFile(filename);
const content = decoder.decode(file);

console.log(content);

// compress

const compressed: Uint8Array = deflate_encode_raw(file);

console.log(compressed);
const hexed = encodeToString(compressed);
console.log(hexed);

// encrypt

// decrypt

// uncompress

const unhexed = decodeString(hexed);

const decompressed = deflate_decode_raw(unhexed);

const recovered = await decoder.decode(decompressed);

console.log(recovered);

// write file

// stream

const raw = await Deno.open(filename);

const stream = Deno.iter(raw, { bufSize: 8 });

for await (const chunk of stream) {
  console.log("chunk", chunk);
}

raw.close();
