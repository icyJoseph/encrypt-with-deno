const [filename] = Deno.args;
const file = await Deno.open(filename);
await Deno.copy(file, Deno.stdout);

file.close();
