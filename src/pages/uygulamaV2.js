import React, { useRef } from "react";
import ThreeScene from "../components/uygulamaV2/ThreeScene";
import ModelLoader from "../components/uygulamaV2/ModelLoader";
import RaycasterControls from "../components/uygulamaV2/RaycasterControls";

function uygulamaV2() {
  const mountRef = useRef(null);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);

  return (
    <div ref={mountRef} className="w-screen h-screen overflow-hidden">
      <ThreeScene
        mountRef={mountRef}
        cameraRef={cameraRef}
        sceneRef={sceneRef}
        controlsRef={controlsRef}
      />
      <ModelLoader sceneRef={sceneRef} modelRef={modelRef} />
      <RaycasterControls cameraRef={cameraRef} sceneRef={sceneRef} />
    </div>
  );
}

export default uygulamaV2;
