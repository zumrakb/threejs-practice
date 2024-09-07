import React, { useRef } from "react";
import ThreeScene from "../components/ThreeScene";

const ThreePage = () => {
  const threeSceneRef = useRef(null);

  const handleRotate = () => {
    threeSceneRef.current.startAutoRotate();
  };

  const handleStopRotate = () => {
    threeSceneRef.current.stopAutoRotate();
  };

  const handleShowTop = () => {
    threeSceneRef.current.showFromTop();
  };

  return (
    <div className="flex gap-12 ml-12">
      <div className="flex flex-col gap-4 min-h-screen text-orange-500 w-1/2 mt-4">
        <div className="border border-orange-500  rounded-lg">
          <ThreeScene ref={threeSceneRef} />
        </div>
      </div>
      <div className="flex flex-col mt-16 gap-3">
        <button
          onClick={handleRotate}
          className="bg-orange-500 text-white hover:bg-opacity-35 px-3 py-1 rounded-xl"
        >
          Rotate automatically
        </button>
        <button
          onClick={handleStopRotate}
          className="bg-orange-500 text-white hover:bg-opacity-35 px-3 py-1 rounded-xl"
        >
          Stop auto rotate
        </button>
        <button
          onClick={handleShowTop}
          className="bg-orange-500 text-white hover:bg-opacity-35 px-3 py-1 rounded-xl"
        >
          Show from top
        </button>
      </div>
    </div>
  );
};

export default ThreePage;
