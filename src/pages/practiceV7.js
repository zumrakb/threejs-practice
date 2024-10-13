// uygulamaV3.js

"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  onMouseClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
} from "../components/practiceV7/Mouse";

const uygulamaV3 = () => {
  // References and states
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const selectedMeshRef = useRef(null);
  const usedImagesRef = useRef([]);
  const decalMeshesRef = useRef([]);
  const initialMousePositionRef = useRef({ x: 0, y: 0 });
  const decalOffsetRef = useRef(new THREE.Vector3());

  const [images, setImages] = useState([]);
  const [controlModel, setControlModel] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [decalSizeFactor, setDecalSizeFactor] = useState(4000);

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 1.4);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      physicallyCorrectLights: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    rendererRef.current.appendChild(renderer.domElement); // Attach to the referenced div

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const directLight = new THREE.DirectionalLight(0xffffff, 1);
    directLight.position.set(5, 5, 7.5);
    scene.add(directLight, ambient);

    // Add GLTF loading logic
    const loader = new GLTFLoader();
    loader.load(
      "tufek.glb",
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);
        modelRef.current = model;

        model.traverse((child) => {
          console.log(child, "tufegin childları");
          console.log(child.Group);
          if (child.isMesh) {
            child.material.color.set(selectedColor);
            child.material.needsUpdate = true;
          }
        });

        decalMeshesRef.current.forEach((decal) => {
          scene.add(decal);
        });
      },
      undefined,
      (error) => {
        console.error("GLTF loading error:", error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleClick = (event) => {
      onMouseClick(event, camera, scene, renderer);
    };

    const handleDown = (event) => {
      onMouseDown(
        event,
        camera,
        renderer,
        decalMeshesRef,
        selectedMeshRef,
        initialMousePositionRef,
        decalOffsetRef
      );
    };

    const handleMove = (event) => {
      onMouseMove(
        event,
        camera,
        renderer,
        scene,
        selectedMeshRef,
        initialMousePositionRef,
        decalMeshesRef,
        decalOffsetRef
      );
    };

    const handleUp = () => {
      onMouseUp(selectedMeshRef);
    };

    window.addEventListener("click", handleClick);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      if (rendererRef.current) {
        rendererRef.current.innerHTML = ""; // Clear the content of the referenced div
      }
    };
  }, [selectedImage, selectedColor]);

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = controlModel;
    }
  }, [controlModel]);

  const handleImageChange = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.target.files);
    const newImages = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        newImages.push(reader.result);
        if (newImages.length === files.length) {
          setImages((prevImages) => [...prevImages, ...newImages]);
        }
      };
      reader.onerror = (error) => {
        console.error("Image loading error:", error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageSelect = (image) => {
    setSelectedImage(image);
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(newColor);
          child.material.needsUpdate = true;
        }
      });
    }
  };

  return (
    <div className="flex w-screen min-h-screen">
      <div
        ref={rendererRef}
        className="w-3/4 flex items-center justify-center bg-slate-100 border-r-gray-500 border-r-2"
      />
      <div className="bg-slate-100 p-4 w-1/4 flex flex-col gap-2">
        <div className="flex flex-col gap-1">
          <h6>Decal Size: {decalSizeFactor}</h6>
          <input
            type="range"
            min="4000"
            max="50000"
            value={decalSizeFactor}
            onChange={(e) => setDecalSizeFactor(Number(e.target.value))}
            className="w-full"
          />
        </div>
        <div className="w-full border border-slate-300 p-2 rounded-xl">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>
        <div className="flex flex-col gap-2 p-2 border border-slate-300 rounded-xl">
          <h6 className="text-gray-500 font-semibold">Loaded Images:</h6>
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Image ${index + 1}`}
                onClick={() => handleImageSelect(image)}
                className="rounded-xl"
                style={{
                  height: "200px",
                  border:
                    selectedImage === image
                      ? "2px solid blue"
                      : "1px solid gray",
                  marginTop: "10px",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>

        <div className="w-full flex gap-2">
          <button
            className="bg-red-500 text-white font-semibold w-1/2 rounded-xl text-center py-1 hover:bg-black/50"
            onClick={() => setControlModel(false)}
          >
            LOCK MODEL
          </button>
          <button
            className="bg-green-500 text-white font-semibold w-1/2 rounded-xl text-center py-1 hover:bg-black/50"
            onClick={() => setControlModel(true)}
          >
            UNLOCK MODEL
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <h6>Select Product Color:</h6>
          <select
            value={selectedColor}
            onChange={handleColorChange}
            className="bg-gray-600 w-full py-1 rounded-lg px-2 text-white"
          >
            <option value="#ffffff">White</option>
            <option value="#ff0000">Red</option>
            <option value="#00ff00">Green</option>
            <option value="#0000ff">Blue</option>
            <option value="#000000">Black</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default uygulamaV3;
