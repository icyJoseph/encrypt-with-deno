import { concat } from "https://deno.land/std/bytes/mod.ts";

type Fn<T, G, Z> = (a: T, b: G) => Z | Promise<Z>;
type Pipeable<T> = (buffer: Deno.Reader) => T | Promise<T>;

export const curry = <T, G, R>(fn: Fn<T, G, R>) => (a: T) => (b: G) => fn(a, b);
export const pipe = <T extends Uint8Array>(...fns: Pipeable<T>[]) => async (
  reader: Deno.Reader
) => {
  let next = new Deno.Buffer();

  for await (const fn of fns) {
    let result = await fn(reader);
    next.readFrom(new Deno.Buffer(result));
  }
  return next;
};

export const randomBytes = (len = 16) =>
  crypto.getRandomValues(new Uint8Array(len));

export const collectFromBuffer = async (
  buffer: Deno.Reader
): Promise<Uint8Array> => {
  const stream = Deno.iter(buffer);

  let result: Uint8Array = new Uint8Array();

  for await (const chunk of stream) {
    result = concat(result, chunk);
  }

  return result;
};

export const withPadding = (arr: Uint8Array) =>
  arr.length < 16 ? concat(arr, new Uint8Array(16 - arr.length)) : arr;
