/*----DecalMesh.js----*/

import * as THREE from "three";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry.js";

/* export const createDecalMesh = (texture, intersected) => {
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    wireframe: false,
    side: THREE.FrontSide,
  });

  const size = new THREE.Vector3(
    texture.source.data.width / 2000,
    texture.source.data.height / 2000,
    1
  );
  const position = intersected.point.clone();
  const orientation = intersected.face.normal.clone();

  const decalGeometry = new DecalGeometry(
    intersected.object,
    position,
    orientation,
    size
  );
  const decalMesh = new THREE.Mesh(decalGeometry, material);

  return decalMesh;
}; */

export const createDecalMesh = (texture, intersected, sizeFactor = 2000) => {
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    wireframe: false,
    side: THREE.FrontSide,
  });

  // Boyutu ayarlama ve kontrol için console.log ekleyin
  const size = new THREE.Vector3(
    texture.source.data.width / sizeFactor,
    texture.source.data.height / sizeFactor,
    1
  );

  console.log(
    `Decal boyutu: width = ${size.x}, height = ${size.y}, sizeFactor = ${sizeFactor}`
  );

  const position = intersected.point.clone();
  const orientation = intersected.face.normal.clone();

  const decalGeometry = new DecalGeometry(
    intersected.object,
    position,
    orientation,
    size
  );
  const decalMesh = new THREE.Mesh(decalGeometry, material);

  return decalMesh;
};

/* export const updateDecalMesh = (mesh, texture, intersected, image) => {
  if (!mesh || !mesh.geometry) {
    console.error("Seçili decal üzerinde geometry bulunamadı.");
    return;
  }

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    wireframe: false,
    side: THREE.FrontSide,
  });

  const size = new THREE.Vector3(
    texture.source.data.width / 2000,
    texture.source.data.height / 2000,
    1
  );
  const position = intersected.point.clone();
  const orientation = intersected.face.normal.clone();

  const decalGeometry = new DecalGeometry(
    intersected.object,
    position,
    orientation,
    size
  );

  // Mevcut geometry'yi kontrol ettikten sonra güncelleme işlemi yapılıyor
  mesh.geometry.dispose();
  mesh.geometry = decalGeometry;
  mesh.material = material;
}; */

export const updateDecalMesh = (
  mesh,
  texture,
  intersected,
  image,
  sizeFactor = 2000
) => {
  if (!mesh || !mesh.geometry) {
    console.error("Seçili decal üzerinde geometry bulunamadı.");
    return;
  }

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    transparent: true,
    opacity: 1,
    depthTest: true,
    depthWrite: true,
    polygonOffset: true,
    polygonOffsetFactor: -5,
    wireframe: false,
    side: THREE.FrontSide,
  });

  // Boyutu sizeFactor'a göre ayarla
  const size = new THREE.Vector3(
    texture.source.data.width / sizeFactor,
    texture.source.data.height / sizeFactor,
    1
  );
  const position = intersected.point.clone();
  const orientation = intersected.face.normal.clone();

  const decalGeometry = new DecalGeometry(
    intersected.object,
    position,
    orientation,
    size
  );

  // Mevcut geometry'yi kontrol ettikten sonra güncelleme işlemi yapılıyor
  mesh.geometry.dispose();
  mesh.geometry = decalGeometry;
  mesh.material = material;
};
