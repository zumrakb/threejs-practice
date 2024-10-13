import * as THREE from "three";
import { loadImage } from "./LoadImage";
import { createCanvasTexture } from "./CreateCanvas";
import { createDecalMesh } from "./DecalMesh";

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Export the onMouseClick function
export const onMouseClick = async (
  event,
  camera,
  scene,
  renderer,
  selectedImage,
  usedImages,
  decalMeshes,
  selectedMesh,
  sizeFactor = 2000 // Default parameter
) => {
  if (selectedMesh.current) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersected = intersects[0];
    const intersectedObj = intersected.object;

    // Check if the clicked object is already a decal
    if (decalMeshes.current.includes(intersectedObj)) {
      console.log("Cannot interact with the selected decal.");
      return;
    }

    if (usedImages.current.includes(selectedImage)) {
      console.log("This image has already been added.");
      return;
    }

    try {
      const image = await loadImage(selectedImage);
      const texture = createCanvasTexture(image);
      const decalMesh = createDecalMesh(texture, intersected, sizeFactor);
      decalMeshes.current.push(decalMesh);
      scene.add(decalMesh);
      usedImages.current.push(selectedImage);
    } catch (error) {
      console.error("Image loading error:", error);
    }
  } else {
    console.log("No object was clicked.");
  }
};

// Function to handle mouse movement
/* export const onMouseMove = (
  event,
  camera,
  renderer,
  scene,
  selectedMesh,
  initialMousePositionRef,
  decalMeshes,
  decalOffsetRef
) => {
  if (!selectedMesh.current) return;

  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0) {
    const intersected = intersects[0];

    // Update the decal's position based on the intersection point and the offset
    const newPosition = intersected.point.clone().sub(decalOffsetRef.current);
    selectedMesh.current.position.copy(newPosition);

    // Orient the decal to match the surface normal
    const normalMatrix = new THREE.Matrix3().getNormalMatrix(
      intersected.object.matrixWorld
    );
    const normal = intersected.face.normal
      .clone()
      .applyMatrix3(normalMatrix)
      .normalize();
    selectedMesh.current.lookAt(
      newPosition.x + normal.x,
      newPosition.y + normal.y,
      newPosition.z + normal.z
    );

    // Update mouse position
    initialMousePositionRef.current = { x: mouse.x, y: mouse.y };
  }
}; */
export const onMouseMove = (
  event,
  cameraRef,
  rendererRef,
  sceneRef,
  modelRef,
  images,
  setOverlayPosition,
  setTexts,
  isDragging,
  draggedImageIndex,
  draggedImage,
  controlsRef,
  setImages
) => {
  if (!rendererRef.current || !isDragging || draggedImageIndex === null) return;

  const rect = rendererRef.current.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  const deltaX = event.clientX - initialMousePosition.x;
  const deltaY = event.clientY - initialMousePosition.y;

  if (selectedHandle) {
    const updatedImages = images.map((img, index) => {
      if (index === draggedImageIndex) {
        if (selectedHandle === "resize") {
          // Resize the decal proportionally
          const newScale = Math.max(img.scale + deltaX * 0.01, 0.1); // Adjust scale change sensitivity
          return { ...img, scale: newScale };
        } else if (selectedHandle === "rotate") {
          // Rotate the decal
          const rotationChange = deltaX * 0.1; // Adjust rotation sensitivity
          return { ...img, rotation: img.rotation + rotationChange };
        }
      }
      return img;
    });

    setImages(updatedImages);
    applyTextureToModel(
      modelRef,
      updatedImages,
      rendererRef,
      sceneRef,
      cameraRef,
      [], // texts
      setImages
    );
    return; // Skip other logic when interacting with handles
  }
};

// Function to handle mouse down
/* export const onMouseDown = (
  event,
  camera,
  renderer,
  decalMeshes,
  selectedMesh,
  initialMousePositionRef,
  decalOffsetRef
) => {
  const rect = renderer.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(decalMeshes.current, true);

  if (intersects.length > 0) {
    const intersected = intersects[0];
    selectedMesh.current = intersected.object;
    initialMousePositionRef.current = { x: mouse.x, y: mouse.y };

    // Update decalOffsetRef
    if (decalOffsetRef.current) {
      decalOffsetRef.current
        .copy(intersected.point)
        .sub(selectedMesh.current.position);
    }
  }
}; */

export const onMouseDown = (
  event,
  cameraRef,
  rendererRef,
  sceneRef,
  images,
  setDraggedImageIndex,
  setDraggedImage,
  setIsDragging,
  selectedImageIndex,
  controlsRef,
  setInitialOffset // Newly added
) => {
  if (!rendererRef.current) return;

  const rect = rendererRef.current.domElement.getBoundingClientRect();
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

  raycaster.setFromCamera(mouse, cameraRef.current);
  const intersects = raycaster.intersectObjects(
    sceneRef.current.children,
    true
  );

  if (intersects.length > 0) {
    const intersect = intersects[0];
    selectedObject = intersect.object;

    // Detect if the user clicks on the rotate or resize handle
    if (selectedObject.userData && selectedObject.userData.handleType) {
      selectedHandle = selectedObject.userData.handleType; // Either 'resize' or 'rotate'
      setIsDragging(true);
      initialMousePosition.set(event.clientX, event.clientY);
      return;
    }

    // Handle normal decal dragging
    if (intersect.object.isMesh) {
      setDraggedImageIndex(selectedImageIndex);
      setDraggedImage(images[selectedImageIndex]);
      setIsDragging(true);
      initialMousePosition.set(event.clientX, event.clientY);

      setInitialOffset({
        offsetX: event.clientX - rect.left,
        offsetY: event.clientY - rect.top,
      });

      if (controlsRef.current) {
        controlsRef.current.enabled = false;
      }
    }
  }
};

// Function to handle mouse up
/* export const onMouseUp = (selectedMesh) => {
  selectedMesh.current = null;
}; */
export const onMouseUp = (
  setIsDragging,
  setDraggedImage,
  setDraggedImageIndex,
  controlsRef
) => {
  setIsDragging(false);
  setDraggedImage(null);
  setDraggedImageIndex(null);
  selectedHandle = null; // Reset the handle after the user releases the mouse

  if (controlsRef.current) {
    controlsRef.current.enabled = true;
  }
};
