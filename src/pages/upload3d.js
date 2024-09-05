import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";

// Birinci GLTF dosyasını yükleyen bileşen
function Model1({ rotate, ...props }) {
  const ref = useRef(); // Referans oluştur
  const { scene } = useGLTF("/hunter_chopper/scene.gltf");

  scene.traverse((object) => {
    if (object.isMesh) {
      object.material = object.material.clone();

      object.material.needsUpdate = true;
    }
  });

  // Frame başına yapılan işlemler (dönüş işlemi)
  useFrame(() => {
    if (ref.current && rotate) {
      ref.current.rotation.y += 0.01; // Her frame'de y ekseninde döner
    }
  });

  return <primitive object={scene} ref={ref} {...props} />;
}

// İkinci GLTF dosyasını yükleyen bileşen
function Model2({ rotate, ...props }) {
  const ref = useRef(); // Referans oluştur
  const { scene } = useGLTF("/alex/scene.gltf");

  scene.traverse((object) => {
    if (object.isMesh) {
      object.material = object.material.clone();
      object.material.color.set("blue");
      object.material.needsUpdate = true;
    }
  });

  // Frame başına yapılan işlemler (dönüş işlemi)
  useFrame(() => {
    if (ref.current && rotate) {
      ref.current.rotation.y += 0.01; // Her frame'de y ekseninde döner
    }
  });

  return <primitive object={scene} ref={ref} {...props} />;
}

// 3D modeli yüklerken gösterilecek bir bekleme bileşeni oluştur
function Loader() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="gray" />
    </mesh>
  );
}

function Upload3d() {
  const model1ScaleRef = useRef(0.4);
  const model2ScaleRef = useRef(1);
  const [rotate, setRotate] = useState(false); // Dönüşü kontrol eden state

  // Kullanıcıdan input alarak ölçeklendirme yapmak için örnek bir fonksiyon
  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    if (!isNaN(newScale)) {
      model1ScaleRef.current = newScale;
      model2ScaleRef.current = newScale;
    }
  };

  // Dönüşü başlat ve durdur fonksiyonları
  const startRotation = () => setRotate(true);
  const stopRotation = () => setRotate(false);

  return (
    <div style={{ display: "flex", width: "100vw", height: "100vh" }}>
      {/* İlk 3D modelin sahnesi */}
      <div style={{ width: "50%", border: "2px solid black" }}>
        <Canvas>
          <Suspense fallback={<Loader />}>
            <Model1
              position={[0, 0, 0]}
              scale={[
                model1ScaleRef.current,
                model1ScaleRef.current,
                model1ScaleRef.current,
              ]}
              rotate={rotate} // Dönüş state'i prop olarak gönderiliyor
            />
            <OrbitControls />
          </Suspense>
        </Canvas>
      </div>

      {/* İkinci 3D modelin sahnesi */}
      <div style={{ width: "50%", border: "2px solid black" }}>
        <Canvas>
          <Suspense fallback={<Loader />}>
            <Model2
              position={[0, 0, 0]}
              scale={[
                model2ScaleRef.current,
                model2ScaleRef.current,
                model2ScaleRef.current,
              ]}
              rotate={rotate} // Dönüş state'i prop olarak gönderiliyor
            />
            <OrbitControls />
          </Suspense>
        </Canvas>
      </div>

      {/* Ölçeklendirme input alanı ve butonlar */}
      <div style={{ position: "absolute", top: "10px", left: "10px" }}>
        <label>Model Ölçeklendirme: </label>
        <input
          type="range"
          min="0.01"
          max="0.1"
          step="0.01"
          onChange={handleScaleChange}
          defaultValue={0.05}
        />
        <div style={{ marginTop: "10px" }}>
          <button onClick={startRotation}>Rotate</button>
          <button onClick={stopRotation}>Stop Rotating</button>
        </div>
      </div>
    </div>
  );
}

export default Upload3d;
