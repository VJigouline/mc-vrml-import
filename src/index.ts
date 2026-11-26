// Reads VRML 2.0 (VRML97) worlds, plain or gzipped, with three.js's VRMLLoader: shapes,
// materials, textures, transforms, lights and backgrounds, with the textures given beside them.

import * as THREE from 'three';
import { gunzipSync } from 'three/examples/jsm/libs/fflate.module.js';
import { VRMLLoader } from 'three/examples/jsm/loaders/VRMLLoader.js';
import { countModel, FileManager, ImportFiles, toStandardMaterials, type ImportInput, type ImportStats } from './common.js';

export { ImportFiles, FileManager, countModel } from './common.js';
export type { ImportInput, ImportFile, ImportData, ImportStats } from './common.js';

export interface VrmlOptions {
  /** The .wrl file to open, if several are given. By default, the first. */
  main?: string;
  /** 'standard' (the default) makes MeshStandardMaterial; 'original' keeps the loader's Phong materials. */
  materialType?: 'standard' | 'original';
  /** Metres per unit. VRML's unit is the metre, the default. */
  unitScale?: number;
  /** Keeps the world's Background node as a sky sphere. Default false: SceneEditor-like editors have their own. */
  background?: boolean;
}

export interface VrmlLoadResult {
  /** The world, in a group named after the file. */
  group: THREE.Group;
  /** Whether the file was gzipped. */
  gzipped: boolean;
  /** Textures the world uses that were not given. */
  missing: string[];
  warnings: string[];
  stats: ImportStats;
}

export class VrmlImportError extends Error {
  override name = 'VrmlImportError';
}

/** Decompresses gzipped text, and checks the header. */
export function vrmlText(bytes: Uint8Array): { text: string; gzipped: boolean } {
  const gzipped = bytes[0] === 0x1f && bytes[1] === 0x8b;
  const text = new TextDecoder().decode(gzipped ? gunzipSync(bytes) : bytes).replace(/^﻿/, '');
  return { text, gzipped };
}

/** Reads a VRML 2.0 world with the textures given beside it. */
export async function loadVrml(input: ImportInput, options: VrmlOptions = {}): Promise<VrmlLoadResult> {
  const files = await ImportFiles.from(input, 'world.wrl');
  const main = files.main(['wrl', 'wrz', 'vrml', 'gz'], options.main) ?? files.files[0];
  if (!main) throw new VrmlImportError('There is no .wrl file to open');
  let source: { text: string; gzipped: boolean };
  try {
    source = vrmlText(main.bytes);
  } catch (error) {
    throw new VrmlImportError(`${main.name} could not be decompressed: ${(error as Error).message}`);
  }
  const header = /^#VRML\s+V(\d\.\d)/.exec(source.text);
  if (!header) throw new VrmlImportError(`${main.name} is not a VRML file: it does not start with #VRML`);
  if (header[1] !== '2.0') throw new VrmlImportError(`${main.name} is VRML ${header[1]}; only VRML 2.0 (VRML97) is read`);

  const warnings: string[] = [];
  for (const [pattern, what] of [[/\bPROTO\b/, 'Prototypes (PROTO)'], [/\bEXTERNPROTO\b/, 'External prototypes'], [/\bInline\b/, 'Inline worlds'], [/\bText\b\s*\{/, 'Text'], [/\bScript\b\s*\{/, 'Scripts'], [/\bROUTE\b/, 'Animation routes']] as const) {
    if (pattern.test(source.text)) warnings.push(`${what} are not read`);
  }

  const fm = new FileManager(files);
  const loader = new VRMLLoader(fm.manager);
  let scene: THREE.Scene;
  const warn = console.warn;
  try {
    // The loader warns about every unsupported node; those warnings are summarised above.
    console.warn = () => {};
    scene = loader.parse(source.text, '');
  } catch (error) {
    throw new VrmlImportError(`${main.name} could not be read: ${(error as Error).message}`);
  } finally {
    console.warn = warn;
  }
  await fm.done();
  fm.dispose();

  const name = main.name.replace(/\\/g, '/').split('/').pop()!.replace(/\.(wrl|wrz|vrml)(\.gz)?$/i, '');
  const group = new THREE.Group();
  group.name = name;
  for (const child of [...scene.children]) group.add(child);
  if (!options.background) {
    // The Background node becomes sky and ground spheres drawn behind everything; they are left out.
    const skies: THREE.Object3D[] = [];
    group.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh && m.geometry instanceof THREE.SphereGeometry && (m.material as THREE.Material).depthTest === false) skies.push(m);
    });
    for (const sky of skies) {
      const parent = sky.parent!;
      parent.remove(sky);
      if (parent !== group && parent.children.length === 0) parent.removeFromParent();
    }
  }
  if (options.materialType !== 'original') toStandardMaterials(group);
  if (options.unitScale && options.unitScale !== 1) group.scale.setScalar(options.unitScale);
  const missing = [...fm.missing];
  return { group, gzipped: source.gzipped, missing, warnings, stats: countModel(group) };
}
