# Formats and support

mc-vrml-import reads VRML with three.js's VRMLLoader.

## What is read

- Shapes: boxes, cones, cylinders, spheres, indexed face and line sets, point sets, elevation grids and extrusions.
- Materials, image and pixel textures, texture transforms, vertex and face colours, normals and crease angles.
- Transforms, groups, switches, DEF and USE.
- Lights. The Background node is left out unless asked for, as editors have their own.
- Gzipped files (.wrz or .wrl.gz).

## Orientation and units

VRML is Y up, in metres, like three.js.

## Limits

VRML 1.0, prototypes (PROTO, EXTERNPROTO), Inline, Text, scripts and animation routes are not read; the warnings say which the file has.
