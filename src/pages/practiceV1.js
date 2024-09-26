import React, { useRef } from "react";
import ThreeScene from "../components/practiceV1/ThreeScene";

const practiceV1 = () => {
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
    <div className="flex w-screen ">
      <div className="w-4/5">
        <ThreeScene ref={threeSceneRef} />
      </div>

      <div className="flex flex-col mx-4 mt-5 gap-3 w-1/5">
        <h4 className="text-gray-700 text-center font-semibold">
          DÖNDÜRME BUTONLARI
        </h4>
        <div>
          <button
            onClick={handleRotate}
            className="bg-orange-500 text-white hover:bg-opacity-35 px-3 py-1 rounded-xl w-full"
          >
            Rotate automatically
          </button>
          <p className="text-xs italic text-gray-500 mt-1 ml-0.5">
            Bu buton, küpü kendi etrafında döndürür.
          </p>
        </div>

        <div>
          <button
            onClick={handleStopRotate}
            className="bg-orange-500 text-white hover:bg-opacity-35 px-3 py-1 rounded-xl w-full"
          >
            Stop auto rotate
          </button>
          <p className="text-xs italic text-gray-500 mt-1 ml-0.5">
            Bu buton, küpün kendi etrafında dönmesini durdurur.
          </p>
        </div>

        <div>
          <button
            onClick={handleShowTop}
            className="bg-orange-500 text-white hover:bg-opacity-35 px-3 py-1 rounded-xl w-full"
          >
            Show from top
          </button>
          <p className="text-xs italic text-gray-500 mt-1 ml-0.5">
            Bu buton, küpün top(yukarı) bakış açısından gösterir. Top, bottom,
            left, right vs gibi yönler isteğe göre eklenebilir.
          </p>
        </div>
      </div>
    </div>
  );
};

export default practiceV1;
