import React, { useRef, useEffect, forwardRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import * as CANNON from "cannon-es";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const AdjustPics = forwardRef((_, ref) => {
  const mountRefCube = useRef(null);
  const controlsRefCube = useRef(null);
  const dragControlsRef = useRef(null);
  const meshRef = useRef(null);
  const sceneCube = useRef(null);
  const cameraCube = useRef(null);
  const rendererCubeRef = useRef(null);
  const [texture, setTexture] = useState(null);
  const [selectedTextureSurface, setSelectedTextureSurface] = useState("front");
  const [repeatX, setRepeatX] = useState(1);
  const [repeatY, setRepeatY] = useState(1);
  const [wrapMode, setWrapMode] = useState("RepeatWrapping");
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const draggableObjects = useRef([]);

  useEffect(() => {
    if (!mountRefCube.current) return;

    // Initialize scene and camera
    sceneCube.current = new THREE.Scene();
    cameraCube.current = new THREE.PerspectiveCamera(
      45,
      mountRefCube.current.clientWidth / mountRefCube.current.clientHeight,
      0.1,
      100
    );
    cameraCube.current.position.set(6, 6, 6);
    cameraCube.current.lookAt(0, 0, 0);

    // Create renderer
    rendererCubeRef.current = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    rendererCubeRef.current.setSize(
      mountRefCube.current.clientWidth,
      mountRefCube.current.clientHeight
    );
    rendererCubeRef.current.setPixelRatio(window.devicePixelRatio);
    rendererCubeRef.current.shadowMap.enabled = true;
    rendererCubeRef.current.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRefCube.current.appendChild(rendererCubeRef.current.domElement);

    // Initialize controls
    controlsRefCube.current = new OrbitControls(
      cameraCube.current,
      rendererCubeRef.current.domElement
    );
    controlsRefCube.current.enableDamping = true;

    // Initialize physics
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // Ground plane
    const planeGeometry = new THREE.PlaneGeometry(20, 20);
    const planeMaterial = new THREE.ShadowMaterial({
      color: 0x000000,
      opacity: 0.5,
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    plane.position.y = -1.5;
    sceneCube.current.add(plane);

    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(0, -1.5, 0),
    });
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(planeBody);

    // Cube with multiple materials
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const materials = [
      new THREE.MeshStandardMaterial({ color: "#00ff83" }),
      new THREE.MeshStandardMaterial({ color: "#00ff83" }),
      new THREE.MeshStandardMaterial({ color: "#00ff83" }),
      new THREE.MeshStandardMaterial({ color: "#00ff83" }),
      new THREE.MeshStandardMaterial({ color: "#00ff83" }),
      new THREE.MeshStandardMaterial({ color: "#00ff83" }),
    ];

    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    sceneCube.current.add(mesh);
    meshRef.current = mesh;
    draggableObjects.current.push(mesh);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    sceneCube.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    sceneCube.current.add(directionalLight);

    // Drag Controls
    updateDragControls();

    // Animation loop
    const animate = () => {
      world.step(1 / 60);
      controlsRefCube.current.update();
      rendererCubeRef.current.render(sceneCube.current, cameraCube.current);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup function
    return () => {
      if (rendererCubeRef.current) {
        rendererCubeRef.current.dispose();
      }
      if (mountRefCube.current) {
        mountRefCube.current.removeChild(rendererCubeRef.current.domElement);
      }
      controlsRefCube.current.dispose();
      dragControlsRef.current?.dispose();
    };
  }, [mountRefCube]);

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(e.target.result, (loadedTexture) => {
          applyTextureProperties(loadedTexture);
          setTexture(loadedTexture);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTextureProperties = (loadedTexture) => {
    if (!loadedTexture) return;
    // Apply texture settings
    loadedTexture.wrapS = THREE[wrapMode];
    loadedTexture.wrapT = THREE[wrapMode];
    loadedTexture.repeat.set(repeatX, repeatY);
    loadedTexture.offset.set(offsetX, offsetY);
    loadedTexture.needsUpdate = true; // Ensure texture is updated
  };

  const applyTextureToSurface = (surface, texture) => {
    if (!meshRef.current || !texture) return;
    applyTextureProperties(texture); // Re-apply properties to the texture
    const materials = meshRef.current.material;

    let materialIndex;
    switch (surface) {
      case "front":
        materialIndex = 0;
        break;
      case "back":
        materialIndex = 1;
        break;
      case "top":
        materialIndex = 2;
        break;
      case "bottom":
        materialIndex = 3;
        break;
      case "left":
        materialIndex = 4;
        break;
      case "right":
        materialIndex = 5;
        break;
      default:
        return;
    }

    materials[materialIndex].map = texture;
    materials[materialIndex].needsUpdate = true;
  };

  const updateDragControls = () => {
    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
    }

    dragControlsRef.current = new DragControls(
      draggableObjects.current,
      cameraCube.current,
      mountRefCube.current
    );

    dragControlsRef.current.addEventListener("dragstart", () => {
      controlsRefCube.current.enabled = false;
    });
    dragControlsRef.current.addEventListener("dragend", () => {
      controlsRefCube.current.enabled = true;
    });
  };

  return (
    <div className="flex gap-2 px-2">
      <div
        ref={mountRefCube}
        className="w-full h-[600px] mb-2 border border-orange-500 rounded-lg"
      />
      <div className="flex">
        <div className="p-4 h-[600px] border border-gray-300 rounded-lg max-w-sm bg-gray-100">
          <h3 className="mb-2 text-lg font-bold">Texture Controls</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="mb-2"
          />
          <select
            value={selectedTextureSurface}
            onChange={(e) => setSelectedTextureSurface(e.target.value)}
            className="mb-2 w-full p-2 border border-gray-300 rounded"
          >
            <option value="front">Front</option>
            <option value="back">Back</option>
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
          <button
            onClick={() =>
              applyTextureToSurface(selectedTextureSurface, texture)
            }
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Texture
          </button>
          <label className="block mt-4">
            Repeat X: {repeatX}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={repeatX}
              onChange={(e) => {
                setRepeatX(parseFloat(e.target.value));
                if (texture) applyTextureProperties(texture); // Update texture properties on change
              }}
              className="w-full"
            />
          </label>
          <label className="block mt-2">
            Repeat Y: {repeatY}
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={repeatY}
              onChange={(e) => {
                setRepeatY(parseFloat(e.target.value));
                if (texture) applyTextureProperties(texture); // Update texture properties on change
              }}
              className="w-full"
            />
          </label>
          <label className="block mt-4">
            Wrap Mode:
            <select
              value={wrapMode}
              onChange={(e) => {
                setWrapMode(e.target.value);
                if (texture) applyTextureProperties(texture); // Update texture properties on change
              }}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="RepeatWrapping">Repeat</option>
              <option value="ClampToEdgeWrapping">Clamp to Edge</option>
              <option value="MirroredRepeatWrapping">Mirrored Repeat</option>
            </select>
          </label>
          <label className="block mt-4">
            Offset X: {offsetX.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={offsetX}
              onChange={(e) => {
                setOffsetX(parseFloat(e.target.value));
                if (texture) applyTextureProperties(texture); // Update texture properties on change
              }}
              className="w-full"
            />
          </label>
          <label className="block mt-2">
            Offset Y: {offsetY.toFixed(2)}
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={offsetY}
              onChange={(e) => {
                setOffsetY(parseFloat(e.target.value));
                if (texture) applyTextureProperties(texture); // Update texture properties on change
              }}
              className="w-full"
            />
          </label>
        </div>
      </div>
    </div>
  );
});

export default AdjustPics;
