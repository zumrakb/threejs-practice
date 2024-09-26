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
} from "../components/uygulamaV3/Mouse";

const uygulamaV3 = () => {
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null); // OrbitControls reference
  const selectedMeshRef = useRef(null);
  const usedImagesRef = useRef([]); // Track used images
  const decalMeshesRef = useRef([]); // Store decal meshes
  const initialMousePositionRef = useRef({ x: 0, y: 0 });
  const [images, setImages] = useState([]);
  const [controlModel, setControlModel] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 });

  useEffect(() => {
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      60,
      window.innerWidth / window.innerHeight,
      0.1, // bu değer 1 idi. 0.1 yaptım ve 3d model büyütüp küçültünce model kaybolmadı
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

    if (rendererRef.current) {
      rendererRef.current.appendChild(renderer.domElement);
    }

    // Create OrbitControls and link them to the camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25; // Smoothness of controls
    controlsRef.current = controls;

    const ambient = new THREE.AmbientLight(0xffffff, 0.7);
    const directLight = new THREE.DirectionalLight(0xffffff, 1);
    directLight.position.set(5, 5, 7.5);
    scene.add(directLight, ambient);

    setWindowSize({ w: window.innerWidth, h: window.innerHeight });

    const loader = new GLTFLoader();
    loader.load(
      "bag.glb",
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);

        // Add previously placed decals back to the scene
        decalMeshesRef.current.forEach((decal) => {
          scene.add(decal);
        });
      },
      undefined,
      (error) => {
        console.error("GLTF yükleme hatası:", error);
      }
    );

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update(); // Update OrbitControls in the animation loop
      renderer.render(scene, camera);
    };

    animate();

    // Mouse events
    const handleClick = (event) => {
      onMouseClick(
        event,
        camera,
        scene,
        renderer,
        selectedImage,
        usedImagesRef,
        decalMeshesRef,
        selectedMeshRef
      );
    };

    const handleDown = (event) => {
      onMouseDown(
        event,
        camera,
        renderer,
        decalMeshesRef,
        selectedMeshRef,
        initialMousePositionRef
      );
    };

    const handleMove = (event) => {
      onMouseMove(
        event,
        camera,
        renderer,
        scene,
        windowSize,
        selectedMeshRef,
        initialMousePositionRef,
        selectedImage
      );
    };

    const handleUp = (event) => {
      onMouseUp(event, selectedMeshRef);
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
        rendererRef.current.removeChild(renderer.domElement);
      }
    };
  }, [selectedImage]);

  // useEffect to update controls.enabled when controlModel changes
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = controlModel;
    }
  }, [controlModel]);

  const handleImageChange = (event) => {
    // Prevent default behavior
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.target.files);
    const imagePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises)
      .then((newImages) =>
        setImages((prevImages) => [...prevImages, ...newImages])
      )
      .catch((error) => console.error("Resim yükleme hatası:", error));
  };

  const handleImageSelect = (image) => {
    // Prevent default refresh behavior
    setSelectedImage(image);
  };

  return (
    <div className="flex w-screen h-screen">
      <div
        ref={rendererRef}
        className=" w-3/4 bg-slate-100 border-r border-r-black border-r-2"
      />
      <div className="bg-slate-100 p-4 w-1/4 flex flex-col gap-4">
        <div className="w-full border border-slate-300 p-2 rounded-xl">
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
          />
        </div>
        <div className="flex flex-col gap-2 p-2 border border-slate-300 rounded-xl">
          <h6 className="text-gray-500 font-semibold">Yüklenen resimler:</h6>
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`Resim ${index + 1}`}
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
        <div className="w-full mt-4 flex gap-2">
          <button
            className="bg-red-500 text-white font-semibold w-1/2 rounded-xl text-center py-1 hover:bg-black/50"
            onClick={() => setControlModel(false)}
          >
            MODELİ KİLİTLE
          </button>
          <button
            className="bg-green-500 text-white font-semibold w-1/2 rounded-xl text-center py-1 hover:bg-black/50"
            onClick={() => setControlModel(true)}
          >
            MODELİ AÇ
          </button>
        </div>
      </div>
    </div>
  );
};

export default uygulamaV3;
