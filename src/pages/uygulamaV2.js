import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import ThreeScene from "../components/uygulamaV2/ThreeScene";
import ModelLoader from "../components/uygulamaV2/ModelLoader";
import RaycasterControls from "../components/uygulamaV2/RaycasterControls";
import { addText } from "../components/uygulamaV2/TextFunctions.js";

function uygulamaV2() {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedPart, setSelectedPart] = useState(null);
  const [meshNames, setMeshNames] = useState([]);
  const [modelLoaded, setModelLoaded] = useState(false);

  const [newText, setNewText] = useState("");
  const [texts, setTexts] = useState([]);

  useEffect(() => {
    if (modelLoaded && modelRef.current && meshNames.length === 0) {
      const meshes = [];
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child.name);
        }
      });
      setMeshNames(meshes);
      console.log("Mesh Names:", meshes);
    }
  }, [modelLoaded, modelRef, meshNames]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const selectPart = (part) => {
    console.log("Selected part:", part);
    setSelectedPart(part);
  };

  const applyImageToModel = () => {
    if (selectedImage && modelRef.current && selectedPart) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(selectedImage, (texture) => {
        texture.flipY = false;

        modelRef.current.traverse((child) => {
          if (
            child.isMesh &&
            child.name.trim().toLowerCase() ===
              selectedPart.trim().toLowerCase()
          ) {
            console.log(`Applying texture to selected part: ${selectedPart}`);
            child.material = child.material.clone();
            child.material.map = texture;
            child.material.needsUpdate = true;
          }
        });
      });
    } else {
      console.log("Seçili mesh veya resim bulunamadı.");
    }
  };

  const handleAddText = () => {
    if (newText.trim() && selectedPart) {
      const newTextObject = addText(
        newText,
        setTexts,
        40,
        "#000000",
        "Arial",
        "#000000",
        0,
        selectedPart
      );
      setNewText(""); // Metin inputunu temizliyoruz
    }
  };

  // Metni modele uygula fonksiyonu
  /*  const applyTextToModel = () => {
    if (modelRef.current && selectedPart) {
      const partTexts = texts.filter((text) => text.meshName === selectedPart);
      if (partTexts.length === 0) {
        console.log("No texts to apply for the selected part");
        return;
      }

      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name === selectedPart) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 512;
          canvas.height = 512;

          // Metni canvas'a ekle
          ctx.font = `${partTexts[0].fontSize}px ${partTexts[0].fontFamily}`;
          ctx.fillStyle = partTexts[0].textColor;
          ctx.fillText(
            partTexts[0].content,
            partTexts[0].offsetX,
            partTexts[0].offsetY
          );

          // Texture'u oluştur
          const texture = new THREE.CanvasTexture(canvas);
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false;
          texture.needsUpdate = true;

          const newMaterial = new THREE.MeshBasicMaterial({ map: texture });
          child.material = newMaterial; // Yeni materyali mesh'e atıyoruz
          child.material.needsUpdate = true; // Material'in güncellenmesini sağlıyoruz
        }
      });
    }
  }; */
  const applyTextToModel = () => {
    if (modelRef.current && selectedPart) {
      const partTexts = texts.filter((text) => text.meshName === selectedPart);
      if (partTexts.length === 0) {
        console.log("No texts to apply for the selected part");
        return;
      }

      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name === selectedPart) {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = 512;
          canvas.height = 512;

          // Arka planı şeffaf hale getirelim (clearRect ile temizleyerek)
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Metin çizimi
          partTexts.forEach((text) => {
            ctx.font = `${text.fontSize}px ${text.fontFamily}`;
            ctx.fillStyle = text.textColor;
            ctx.fillText(text.content, text.offsetX, text.offsetY);

            // Eğer outline varsa onu da çizelim
            if (text.outlineWidth > 0) {
              ctx.strokeStyle = text.outlineColor;
              ctx.lineWidth = text.outlineWidth;
              ctx.strokeText(text.content, text.offsetX, text.offsetY);
            }
          });

          // Canvas'ı texture olarak dönüştürelim
          const texture = new THREE.CanvasTexture(canvas);
          texture.encoding = THREE.sRGBEncoding;
          texture.flipY = false; // Y ekseni ters çevrili olmasın
          texture.needsUpdate = true;

          // Yeni materyal oluşturalım ve mesh'e uygulayalım
          const newMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            transparent: true, // Arka planın şeffaf olmasını sağlıyoruz
          });
          child.material = newMaterial; // Yeni materyali mesh'e atıyoruz
          child.material.needsUpdate = true;
        }
      });
    }
  };
  /* combine fonksiyonu eklencek. + useeffect ile render*/
  return (
    <div className="w-screen h-screen gap-4 flex items-center p-4">
      <div
        ref={mountRef}
        className="w-3/4 h-full overflow-hidden border border-orange-500 rounded-xl"
      >
        <ThreeScene
          mountRef={mountRef}
          cameraRef={cameraRef}
          sceneRef={sceneRef}
          controlsRef={controlsRef}
        />
        <ModelLoader
          sceneRef={sceneRef}
          modelRef={modelRef}
          setModelLoaded={setModelLoaded}
        />
        <RaycasterControls cameraRef={cameraRef} sceneRef={sceneRef} />
      </div>

      <div className="w-1/4 h-full rounded-xl pt-2">
        <div className="h-fit border-b border-b-gray-400 pb-2">
          <h3 className="text-orange-500 font-semibold mb-2">
            RESİM EKLEME KISMI:
          </h3>
          <div className="flex gap-1 justify-between items-center">
            <div className="p-2 border border-gray-200 w-[200px] text-xs rounded-xl">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>
            <button
              onClick={applyImageToModel}
              className="text-white font-semibold bg-green-600 hover:bg-green-300 w-[150px] py-2 rounded-xl text-sm"
            >
              Resmi Yüzeye Ekle
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mt-4 border-y border-y-gray-200 py-4">
            {meshNames.length > 0 ? (
              meshNames.map((meshName) => (
                <button
                  key={meshName}
                  onClick={() => selectPart(meshName)}
                  className={`${
                    selectedPart === meshName ? "bg-blue-500" : "bg-orange-500"
                  } text-white font-semibold hover:bg-orange-300 px-2 py-0.5 rounded-xl text-xs`}
                >
                  {meshName.toUpperCase()}
                </button>
              ))
            ) : (
              <div>Mesh isimleri yükleniyor...</div>
            )}
          </div>

          <div className="mt-4 text-red-500 font-semibold">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                className="h-60 object-cover"
              />
            ) : (
              "Önizleme yok"
            )}
          </div>
        </div>

        <div className="h-fit mt-4 border-b border-b-gray-400 pb-2">
          <h3 className="text-orange-500 font-semibold mb-2">
            METİN EKLEME KISMI:
          </h3>
          <input
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full"
            placeholder="Yeni metin girin"
          />
          <div className="w-full flex gap-2">
            <button
              onClick={handleAddText}
              className="text-white font-semibold bg-blue-500 hover:bg-blue-300 w-1/2 py-1 rounded-xl mt-2 text-sm"
            >
              Metin Ekle
            </button>

            <button
              onClick={applyTextToModel}
              className="text-white font-semibold bg-green-600 hover:bg-green-300 w-1/2 py-1 rounded-xl mt-2 text-sm"
            >
              Metni Yüzeye Ekle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default uygulamaV2;
