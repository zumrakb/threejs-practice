import React, { useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function ModelLoader({ sceneRef, modelRef, setModelLoaded }) {
  useEffect(() => {
    if (modelRef.current) {
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      "bag.glb",
      (gltf) => {
        const model = gltf.scene;

        // Mesh'lerin yüklenme anında bir kere loglanmasını sağlıyoruz
        model.traverse((child) => {
          if (child.isMesh) {
            console.log("Mesh Name:", child.name); // Mesh'lerin isimlerini kontrol edin
          }
        });

        model.position.set(0, 0, 0);
        model.scale.set(8, 8, 8);

        sceneRef.current.add(model);
        modelRef.current = model;
        setModelLoaded(true); // Modelin yüklendiğini işaretleyelim
      },
      undefined,
      (error) => {
        console.error("Model yükleme hatası:", error);
      }
    );
  }, [sceneRef, modelRef, setModelLoaded]);

  return null;
}

export default ModelLoader;
