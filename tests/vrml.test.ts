import * as THREE from 'three';
import { gzipSync } from 'three/examples/jsm/libs/fflate.module.js';
import { describe, expect, it } from 'vitest';
import { loadVrml, VrmlImportError } from '../src/index.js';
import { allSamples, sample } from './files.js';

const BOX = `#VRML V2.0 utf8
Background { skyColor [ 0 0 1 ] }
Transform {
  translation 1 0 0
  children [
    Shape {
      appearance Appearance { material Material { diffuseColor 1 0 0 shininess 0.5 } }
      geometry Box { size 2 2 2 }
    }
  ]
}
`;

const meshes = (g: THREE.Object3D) => {
  const out: THREE.Mesh[] = [];
  g.traverse((o) => (o as THREE.Mesh).isMesh && out.push(o as THREE.Mesh));
  return out;
};

describe('VRML', () => {
  it('reads shapes and materials, without the background', async () => {
    const r = await loadVrml({ name: 'box.wrl', data: BOX });
    const [box, ...others] = meshes(r.group);
    expect(others).toEqual([]);
    const m = box!.material as THREE.MeshStandardMaterial;
    expect(m).toBeInstanceOf(THREE.MeshStandardMaterial);
    expect(m.color.r).toBeCloseTo(1);
    const size = new THREE.Box3().setFromObject(r.group).getSize(new THREE.Vector3());
    expect(size.x).toBeCloseTo(2);
    expect(r.group.name).toBe('box');
  });

  it('keeps the background and Phong materials when asked, and reads gzipped files', async () => {
    const r = await loadVrml({ name: 'box.wrz', data: gzipSync(new TextEncoder().encode(BOX)) }, { background: true, materialType: 'original' });
    expect(r.gzipped).toBe(true);
    expect(meshes(r.group).length).toBe(2);
    expect(meshes(r.group).some((m) => m.material instanceof THREE.MeshPhongMaterial)).toBe(true);
  });

  it('reads a textured mesh with its image', async () => {
    const r = await loadVrml([sample('meshWithTexture.wrl'), sample('map.gif')]);
    expect(r.missing).toEqual([]);
    expect(r.stats.textures).toBe(1);
    const without = await loadVrml(sample('meshWithTexture.wrl'));
    expect(without.missing).toEqual(['map.gif']);
  });

  it('reads every sample', async () => {
    for (const file of allSamples().filter((f) => f.name.endsWith('.wrl'))) {
      const r = await loadVrml(file);
      expect(r.stats.meshes + r.stats.lines + r.stats.points, file.name).toBeGreaterThan(0);
    }
  });

  it('refuses VRML 1.0 and other files', async () => {
    await expect(loadVrml('#VRML V1.0 ascii\nSeparator {}\n')).rejects.toThrow(/only VRML 2.0/);
    await expect(loadVrml('hello')).rejects.toThrow(VrmlImportError);
  });
});
