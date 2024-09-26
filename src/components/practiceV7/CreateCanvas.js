/*----CreateCanvas.js----*/

import * as THREE from "three";

export const createCanvasTexture = (image) => {
  const canvas = document.createElement("canvas");
  const imgWidth = image.width;
  const imgHeight = image.height;
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(image, 0, 0, imgWidth, imgHeight);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.rotation = Math.PI * 2;
  texture.flipY = true;
  texture.repeat.set(1, 1);
  texture.center.set(0, 0);

  return texture;
};
