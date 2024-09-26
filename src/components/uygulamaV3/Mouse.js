import * as THREE from "three";
import { loadImage } from "./LoadImage";
import { createCanvasTexture } from "./CreateCanvas";
import { createDecalMesh, updateDecalMesh } from "./DecalMesh";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export const onMouseClick = async (
  event,
  camera,
  scene,
  renderer,
  selectedImage,
  usedImages,
  decalMeshes,
  selectedMesh
) => {
  // Disable interaction when a decal is being dragged
  if (selectedMesh.current) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersected = intersects[0];
    const intersectedObj = intersected.object;

    // Skip decal interaction if the intersected object is a decal
    if (decalMeshes.current.includes(intersectedObj)) {
      console.log("Seçili decal üzerinde işlem yapılamaz.");
      return;
    }

    if (usedImages.current.includes(selectedImage)) {
      console.log("Bu resim zaten eklenmiş.");
      return;
    }

    try {
      const image = await loadImage(selectedImage);
      const texture = createCanvasTexture(image);
      const decalMesh = createDecalMesh(texture, intersected);
      decalMeshes.current.push(decalMesh);
      scene.add(decalMesh);
      usedImages.current.push(selectedImage);
    } catch (error) {
      console.error("Resim yükleme hatası:", error);
    }
  } else {
    console.log("Nesneye tıklanmadı.");
  }
};

export const onMouseDown = (
  event,
  camera,
  renderer,
  decalMeshes,
  selectedMesh,
  initialMousePositionRef
) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(decalMeshes.current, true);

  if (intersects.length > 0) {
    const intersected = intersects[0];
    const intersectedObj = intersected.object;
    selectedMesh.current = intersectedObj;
    initialMousePositionRef.current = { x: mouse.x, y: mouse.y };
  }
};

export const onMouseMove = async (
  event,
  camera,
  renderer,
  scene,
  windowSize,
  selectedMesh,
  initialMousePositionRef,
  selectedImage
) => {
  if (!selectedMesh.current) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersected = intersects[0];

    const deltaX = (mouse.x - initialMousePositionRef.current.x) / windowSize.w;
    const deltaY = (mouse.y - initialMousePositionRef.current.y) / windowSize.h;

    selectedMesh.current.position.x += deltaX;
    selectedMesh.current.position.y += deltaY;

    initialMousePositionRef.current = { x: mouse.x, y: mouse.y };

    // Ensure texture update only if necessary
    if (selectedMesh.current.material && selectedMesh.current.material.map) {
      const texture = selectedMesh.current.material.map;
      const image = await loadImage(selectedImage);
      await updateDecalMesh(selectedMesh.current, texture, intersected, image);
    } else {
      console.error("Seçili decal üzerinde geometry bulunamadı.");
    }
  }
};

export const onMouseUp = (event, selectedMesh) => {
  selectedMesh.current = null;
};
