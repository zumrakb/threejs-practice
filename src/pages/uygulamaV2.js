import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import ThreeScene from "../components/uygulamaV2/ThreeScene";
import ModelLoader from "../components/uygulamaV2/ModelLoader";
import RaycasterControls from "../components/uygulamaV2/RaycasterControls";

function uygulamaV2() {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null); // GLTF model referansı

  const [selectedImage, setSelectedImage] = useState(null); // Seçilen resmi tutan state
  const [selectedPart, setSelectedPart] = useState(null); // Seçilen model kısmını tutan state
  const [meshNames, setMeshNames] = useState([]); // Mesh isimlerini tutan state
  const [modelLoaded, setModelLoaded] = useState(false); // Modelin yüklendiğini takip eden state

  // Model yüklendiğinde mesh isimlerini almak için useEffect
  useEffect(() => {
    if (modelLoaded && modelRef.current && meshNames.length === 0) {
      const meshes = [];
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          meshes.push(child.name); // Tüm mesh isimlerini alıyoruz
        }
      });
      setMeshNames(meshes); // Mesh isimlerini state'e kaydediyoruz
      console.log("Mesh Names:", meshes); // Mesh isimlerini loglayarak kontrol edelim
    }
  }, [modelLoaded, modelRef, meshNames]);

  // Resim dosyasını yükleyip kaydetme
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setSelectedImage(event.target.result); // Seçilen resmi state'e kaydediyoruz
      };
      reader.readAsDataURL(file);
    }
  };

  // Yüzey seçimini işleme fonksiyonu
  const selectPart = (part) => {
    console.log("Selected part:", part); // Seçilen mesh'in adını loglayalım
    setSelectedPart(part); // Hangi yüzeyin seçildiğini state'e kaydediyoruz
  };

  const applyImageToModel = () => {
    if (selectedImage && modelRef.current && selectedPart) {
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(selectedImage, (texture) => {
        texture.flipY = false; // Y eksenini ters çevirmeyi devre dışı bırakıyoruz

        modelRef.current.traverse((child) => {
          if (
            child.isMesh &&
            child.name.trim().toLowerCase() ===
              selectedPart.trim().toLowerCase()
          ) {
            console.log(`Applying texture to selected part: ${selectedPart}`);
            // Her mesh'in materyalini klonlayarak yeni bir materyal oluşturuyoruz
            child.material = child.material.clone();
            child.material.map = texture; // Yeni texture'u sadece bu mesh'e uyguluyoruz
            child.material.needsUpdate = true;
          }
        });
      });
    } else {
      console.log("Seçili mesh veya resim bulunamadı.");
    }
  };

  return (
    <div className="w-screen h-screen gap-4 flex items-center  p-4">
      <div
        ref={mountRef}
        className="w-3/4 h-full  overflow-hidden border border-orange-500 rounded-xl "
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

      <div className="w-1/4  h-full rounded-xl pt-2">
        <div className="h-fit border-b border-b-gray-400 pb-2">
          {/* Resim yükleme input'u */}
          <input type="file" accept="image/*" onChange={handleImageUpload} />

          {/* Dinamik olarak mesh isimlerinden butonlar oluştur */}
          <div className="flex flex-wrap gap-2 mt-4 border-y border-y-gray-200 py-4">
            {meshNames.length > 0 ? (
              meshNames.map((meshName) => (
                <button
                  key={meshName}
                  onClick={() => selectPart(meshName)} // Mesh ismine göre seçim
                  className={`${
                    selectedPart === meshName ? "bg-blue-500" : "bg-orange-500"
                  } text-white font-semibold hover:bg-orange-300 px-2 py-1 rounded-xl text-sm`}
                >
                  {meshName.toUpperCase()} {/* Buton metni */}
                </button>
              ))
            ) : (
              <div>Mesh isimleri yükleniyor...</div>
            )}
          </div>

          {/* Resmi modele uygula butonu */}
          <button
            onClick={applyImageToModel} // Butona tıklanınca resim uygulanır
            className="text-white font-semibold bg-green-600 hover:bg-green-300 w-full py-2 rounded-xl mt-2"
          >
            SEÇİLEN YÜZEYE RESİM EKLE
          </button>

          {/* Önizleme */}
          <div className="mt-4 text-red-500 font-semibold">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Preview"
                className="h-60  object-cover"
              />
            ) : (
              "Önizleme yok"
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default uygulamaV2;
