import * as THREE from "three";

// Yeni bir metin ekleme fonksiyonu
export const addText = (
  newText,
  setTexts,
  fontSize = 40,
  textColor = "#000000", // Varsayılan siyah renk
  selectedFontFamily = "Arial",
  outlineColor = "#000000",
  outlineWidth = 0,
  selectedMesh
) => {
  const newTextObject = {
    id: Date.now(),
    content: newText,
    fontSize: fontSize,
    textColor: textColor,
    fontFamily: selectedFontFamily,
    offsetX: 275,
    offsetY: 375,
    isDragging: false,
    rotation: 0,
    meshName: selectedMesh,
    outlineColor: outlineColor,
    outlineWidth: outlineWidth,
  };

  setTexts((currentTexts) => [...currentTexts, newTextObject]);

  return newTextObject; // Yeni metin nesnesini döndür
};
