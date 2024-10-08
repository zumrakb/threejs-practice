import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import ThreeScene from "../components/practiceV6/ThreeScene";
import ModelLoader from "../components/practiceV6/ModelLoader";
import RaycasterControls from "../components/practiceV6/RaycasterControls";
import {
  addText,
  createCombinedTexture,
  getTextsForMesh,
  setImageForMesh,
  getImageForMesh,
} from "../components/practiceV6/TextFunctions.js";

function uygulamaV2() {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);

  const [selectedImage, setSelectedImage] = useState(null); // Seçilen resim
  const [selectedPart, setSelectedPart] = useState(null); // Seçilen yüzey
  const [meshNames, setMeshNames] = useState([]);
  const [modelLoaded, setModelLoaded] = useState(false);

  const [newText, setNewText] = useState(""); // Metin ekleme inputu
  const [texts, setTexts] = useState([]); // Eklenen metinler

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
    setTexts(getTextsForMesh(part)); // Seçilen yüzeye ait metinleri çekiyoruz
    setSelectedImage(getImageForMesh(part)); // Seçilen yüzeye ait resmi çekiyoruz
  };

  // Resmi ve metni modele uygula
  const applyCombinedTextureToModel = () => {
    if (
      (selectedImage || texts.length > 0) &&
      modelRef.current &&
      selectedPart
    ) {
      modelRef.current.traverse((child) => {
        if (child.isMesh && child.name === selectedPart) {
          const combinedTexture = createCombinedTexture(
            selectedImage,
            texts,
            1024,
            1024
          );

          const newMaterial = new THREE.MeshBasicMaterial({
            map: combinedTexture,
            transparent: true,
          });

          child.material = newMaterial;
          child.material.needsUpdate = true;
        }
      });
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

  // Metni resmin üzerine koyan buton işlevi
  const handleApplyTextOnImage = () => {
    if (selectedPart) {
      applyCombinedTextureToModel(); // Metni ve resmi birleştirip yüzeye uygula
    }
  };

  const handleApplyImage = () => {
    if (selectedImage && selectedPart) {
      setImageForMesh(selectedPart, selectedImage); // Resmi seçilen yüzeye kaydediyoruz
      applyCombinedTextureToModel(); // Resmi yüzeye uygula
    }
  };

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
              onClick={handleApplyImage}
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

            {/* Yeni "Metni Resmin Üstüne Koy" butonu */}
            <button
              onClick={handleApplyTextOnImage}
              className="text-white font-semibold bg-green-600 hover:bg-green-300 w-1/2 py-1 rounded-xl mt-2 text-sm"
            >
              Metni Resmin Üstüne Koy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default uygulamaV2;
