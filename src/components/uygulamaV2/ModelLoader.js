/* GLTF Model Yükleyici */
import React, { useEffect } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

function ModelLoader({ sceneRef, modelRef }) {
  useEffect(() => {
    const loader = new GLTFLoader();
    loader.load(
      "bag.glb",
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        model.scale.set(8, 8, 8);

        sceneRef.current.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => {
        console.error("Model yükleme hatası:", error);
      }
    );
  }, [sceneRef]);

  return null;
}

export default ModelLoader;
