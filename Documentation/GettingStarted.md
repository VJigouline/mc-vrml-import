# Getting started

## Install

```sh
npm install three github:VJigouline/mc-vrml-import
```

## Open a file

`loadVrml` takes the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files for a model in several files. Zip archives among them are opened. It returns a promise of the model.

```ts
import * as THREE from 'three';
import { loadVrml } from 'mc-vrml-import';

const input = document.querySelector<HTMLInputElement>('input[type=file]')!;
input.multiple = true;
input.addEventListener('change', async () => {
  const result = await loadVrml(input.files!);
  scene.add(result.group);
  for (const warning of result.warnings) console.warn(warning);
});
```

A model in several files is given as all of them together, or as a zip. Textures it refers to are found by file name, wherever the model says they are, ignoring case and folders; those not given are listed in `missing`.

## What you get

- **`group`:** a `THREE.Group` holding the model, named after the file.
- **`stats`:** counts of what was read.
- **`warnings`:** anything that couldn't be read or was left out.

VRML is Y up, in metres, like three.js.

## Options

- **`main`** (default the first .wrl file): The file to open, if several are given.
- **`materialType`** (default 'standard'): `'standard'` makes MeshStandardMaterial; `'original'` keeps the loader's Phong materials.
- **`background`** (default false): Keeps the Background node as sky and ground spheres.
- **`unitScale`** (default 1): Metres per unit.

See the [API](API.md) for every field of the result.
