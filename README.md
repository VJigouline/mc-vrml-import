# mc-vrml-import

A VRML importer for [three.js](https://threejs.org/), written in TypeScript. It reads VRML 2.0 (VRML97) worlds, plain or gzipped, with their shapes, materials, textures, transforms and lights, still written by many CAD, engineering and scientific programs. It was made for [SceneEditor](https://github.com/VJigouline/SceneEditor), and works in any three.js application.

```ts
import { loadVrml } from 'mc-vrml-import';

const result = await loadVrml(input.files);   // the .wrl and its textures
scene.add(result.group);
console.log(result.warnings);       // anything that couldn't be read
```

## What it reads

- Shapes: boxes, cones, cylinders, spheres, indexed face and line sets, point sets, elevation grids and extrusions.
- Materials, image and pixel textures, texture transforms, vertex and face colours, normals and crease angles.
- Transforms, groups, switches, DEF and USE.
- Lights. The Background node is left out unless asked for, as editors have their own.
- Gzipped files (.wrz or .wrl.gz).

VRML 1.0, prototypes (PROTO, EXTERNPROTO), Inline, Text, scripts and animation routes are not read; the warnings say which the file has. See [Formats and support](Documentation/Support.md) for the details.

## Install

The package is not on the npm registry. Install it from GitHub:

```sh
npm install github:VJigouline/mc-vrml-import
```

`three` (r160 or later) is a peer dependency. The package builds itself on install.

## Documentation

- [Getting started](Documentation/GettingStarted.md)
- [API](Documentation/API.md)
- [Formats and support](Documentation/Support.md)
- [Using it in SceneEditor](Documentation/SceneEditor.md)

## Development

```sh
npm install
npm test           # unit tests, with Vitest
npm run typecheck
npm run build      # dist/
```

The tests load real VRML files, kept in [`tests/samples`](tests/samples/README.md) with their licences. It needs Node.js 22 or later.

## Licence

[MIT](LICENSE)
