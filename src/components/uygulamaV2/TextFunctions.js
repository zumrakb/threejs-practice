import * as THREE from "three";

// Her yüzey için ayrı metin ve resim listesi tutacağız
const textData = {};
const imageData = {};

// Yeni bir metin ekleme fonksiyonu
export const addText = (
  newText,
  setTexts,
  fontSize = 40,
  textColor = "#000000",
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

  // Her yüzeye göre metinleri kaydediyoruz
  if (!textData[selectedMesh]) {
    textData[selectedMesh] = [];
  }

  textData[selectedMesh].push(newTextObject);
  setTexts(textData[selectedMesh]); // Sadece o yüzeyin metinlerini güncelliyoruz

  return newTextObject;
};

// Resmi her yüzey için ayrı kaydetme fonksiyonu
export const setImageForMesh = (selectedMesh, image) => {
  imageData[selectedMesh] = image;
};

// Belirli bir yüzeye ait resmi al
export const getImageForMesh = (selectedMesh) => {
  return imageData[selectedMesh] || null;
};

// Metin ve resmi birleştirip texture oluşturma fonksiyonu
export const createCombinedTexture = (
  imageSrc,
  texts,
  width = 1024,
  height = 1024
) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = width;
  canvas.height = height;

  // Arka planı temizleyelim
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Eğer bir resim varsa onu çizelim
  if (imageSrc) {
    const img = new Image();
    img.src = imageSrc;
    img.onload = () => {
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Metinleri resmin üzerine çizelim
      texts.forEach((text) => {
        ctx.font = `${text.fontSize}px ${text.fontFamily}`;
        ctx.fillStyle = text.textColor;
        ctx.fillText(text.content, text.offsetX, text.offsetY);

        if (text.outlineWidth > 0) {
          ctx.strokeStyle = text.outlineColor;
          ctx.lineWidth = text.outlineWidth;
          ctx.strokeText(text.content, text.offsetX, text.offsetY);
        }
      });
    };
  } else {
    // Eğer resim yoksa sadece metinleri çizelim
    texts.forEach((text) => {
      ctx.font = `${text.fontSize}px ${text.fontFamily}`;
      ctx.fillStyle = text.textColor;
      ctx.fillText(text.content, text.offsetX, text.offsetY);

      if (text.outlineWidth > 0) {
        ctx.strokeStyle = text.outlineColor;
        ctx.lineWidth = text.outlineWidth;
        ctx.strokeText(text.content, text.offsetX, text.offsetY);
      }
    });
  }

  // Canvas'tan bir texture oluşturuyoruz
  const texture = new THREE.CanvasTexture(canvas);
  texture.encoding = THREE.sRGBEncoding;
  texture.flipY = false;
  texture.needsUpdate = true;

  return texture;
};

// Belirli bir yüzeye ait metinleri al
export const getTextsForMesh = (selectedMesh) => {
  return textData[selectedMesh] || [];
};
