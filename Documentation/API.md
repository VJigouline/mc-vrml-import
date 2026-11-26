# API

## `loadVrml(input, options?)`

Reads `.wrl` (VRML 2.0 / VRML97), plain or gzipped, with its textures and returns a promise of a `VrmlLoadResult`.

`input` is the file's contents (`ArrayBuffer`, `Uint8Array` or string), a browser `File`, `{ name, data }`, or an iterable of files for a model in several files. Zip archives among them are opened.

It throws a `VrmlImportError` for input that isn't VRML.

### Options

| Option | Default | Meaning |
| --- | --- | --- |
| `main` | the first .wrl file | The file to open, if several are given. |
| `materialType` | 'standard' | `'standard'` makes MeshStandardMaterial; `'original'` keeps the loader's Phong materials. |
| `background` | false | Keeps the Background node as sky and ground spheres. |
| `unitScale` | 1 | Metres per unit. |

### `VrmlLoadResult`

| Field | Type | Meaning |
| --- | --- | --- |
| `group` | `THREE.Group` | The model. |
| `gzipped` | `boolean` | Whether the file was gzipped. |
| `missing` | `string[]` | Textures that were not given. |
| `warnings` | `string[]` | Problems that didn't stop the import. |
| `stats` | object | Counts of meshes, triangles, lines and points. |

See the package's `index.d.ts` for every exported type and helper.
