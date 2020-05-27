# Encrypt and Decrypt files under Deno runtime

Using the Deno runtime to encrypt, compress, and recover a file.

## Credit

- This package uses `wasm-flate.wasm` built from [this repository](https://github.com/drbh/wasm-flate) to compress/decompress files.
- The `wasm-flate` module is a thin wasm wrapper around the [flate2](https://docs.rs/crate/flate2/1.0.14) crate.

- The aes128 encryption/decryption is done using `wasm-aes-soft.asm` built from [this repository](https://github.com/icyJoseph/wasm-aes-soft).
- The `wasm-aes-soft` module is a thin wasm wrapper around the [aes-soft](https://docs.rs/crate/aes-soft/0.3.3) crate.

## Encrypt a file

```
deno run --allow-read --allow-write encrypt.ts sample.txt
```

Running this will create two files:

- `sample.enc.txt`
- `sample.key`

## Decrypt a file

At this point, because padding is used while decrypting, for text files one has to filter out the null character.

```
 deno run --allow-read --allow-write decrypt.ts sample.enc.txt sample.key true
```

For any other file type the last flag can be ignored.
