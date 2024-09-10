/* import React, { useRef, useEffect, forwardRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";

const AdjustPicsDecal = forwardRef((_, ref) => {
  const mountRefCube = useRef(null);
  const controlsRefCube = useRef(null);
  const dragControlsRef = useRef(null);
  const meshRef = useRef(null);
  const sceneCube = useRef(null);
  const cameraCube = useRef(null);
  const rendererCubeRef = useRef(null);
  const [texture, setTexture] = useState(null);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const draggableObjects = useRef([]);
  const modelRef = useRef(null); // Model referansı eklendi

  useEffect(() => {
    if (!mountRefCube.current) return;

    // Scene ve camera'yı başlat
    sceneCube.current = new THREE.Scene();
    cameraCube.current = new THREE.PerspectiveCamera(
      45,
      mountRefCube.current.clientWidth / mountRefCube.current.clientHeight,
      0.1,
      100
    );
    cameraCube.current.position.set(6, 6, 6);
    cameraCube.current.lookAt(0, 0, 0);

    // Renderer oluştur
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

    // Kontrolleri başlat
    controlsRefCube.current = new OrbitControls(
      cameraCube.current,
      rendererCubeRef.current.domElement
    );
    controlsRefCube.current.enableDamping = true;

    // Fizik motorunu başlat
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // Zemin planı oluştur
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

    // GLTFLoader kullanarak 3D modeli yükle
    const loader = new GLTFLoader();
    loader.load(
      "/hunter_chopper/scene.gltf",
      (gltf) => {
        const model = gltf.scene;
        model.position.set(0, 0, 0);
        sceneCube.current.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => {
        console.error("Model yükleme hatası:", error);
      }
    );

    // Işıklar ekle
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    sceneCube.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    sceneCube.current.add(directionalLight);

    // Drag Kontrolleri güncelle
    updateDragControls();

    // Animasyon döngüsü
    const animate = () => {
      world.step(1 / 60);
      controlsRefCube.current.update();
      rendererCubeRef.current.render(sceneCube.current, cameraCube.current);
      requestAnimationFrame(animate);
    };
    animate();

    // Fare olaylarını dinle
    mountRefCube.current.addEventListener("click", handleMouseClick);

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
      mountRefCube.current.removeEventListener("click", handleMouseClick);
    };
  }, [mountRefCube, texture]);

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(e.target.result, (loadedTexture) => {
          setTexture(loadedTexture);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Kullanıcı tıkladığında çalışacak fonksiyon
  const handleMouseClick = (event) => {
    if (!modelRef.current || !texture) return;

    // Fare konumunu hesapla
    const rect = mountRefCube.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Raycasting yaparak modelin tıklanan noktasını bul
    raycaster.setFromCamera(mouse, cameraCube.current);
    const intersects = raycaster.intersectObject(modelRef.current, true);

    if (intersects.length > 0) {
      const intersected = intersects[0];

      // Decal'i ekle
      applyDecal(intersected);
    }
  };

  const applyDecal = (intersected) => {
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -1, // Görünürlüğü artırmak için ayarlandı
      side: THREE.DoubleSide,
    });

    const size = new THREE.Vector3(2, 2, 1); // Decal boyutu
    const position = intersected.point.clone();
    const orientation = intersected.face.normal.clone();

    const decalGeometry = new DecalGeometry(
      intersected.object,
      position,
      orientation,
      size
    );

    const decalMesh = new THREE.Mesh(decalGeometry, material);
    sceneCube.current.add(decalMesh);

    console.log("Decal mesh added to the scene:", decalMesh);
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
          <h3 className="mb-2 text-lg font-bold">Decal Controls</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="mb-2"
          />
          <button
            onClick={handleMouseClick} // Doğru fonksiyon burada kullanılıyor
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Decal
          </button>
        </div>
      </div>
    </div>
  );
});

export default AdjustPicsDecal;
 */

import React, { useRef, useEffect, forwardRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as CANNON from "cannon-es";

const AdjustPicsDecal = forwardRef((_, ref) => {
  const mountRefCube = useRef(null);
  const controlsRefCube = useRef(null);
  const dragControlsRef = useRef(null);
  const meshRef = useRef(null);
  const sceneCube = useRef(null);
  const cameraCube = useRef(null);
  const rendererCubeRef = useRef(null);
  const [texture, setTexture] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff"); // State to manage selected color

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const draggableObjects = useRef([]);
  const modelRef = useRef(null);

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

    // Initialize renderer
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

    // Initialize physics engine
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // Create ground plane
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

    // Load 3D model using GLTFLoader
    const loader = new GLTFLoader();
    loader.load(
      "adam.glb",
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.color.set(selectedColor); // Apply the selected color
            child.material.needsUpdate = true;
          }
        });
        model.position.set(0, 0, 0);
        sceneCube.current.add(model);
        modelRef.current = model;
      },
      undefined,
      (error) => {
        console.error("Model loading error:", error);
      }
    );

    // Add lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    sceneCube.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    sceneCube.current.add(directionalLight);

    // Update drag controls
    updateDragControls();

    // Animation loop
    const animate = () => {
      world.step(1 / 60);
      controlsRefCube.current.update();
      rendererCubeRef.current.render(sceneCube.current, cameraCube.current);
      requestAnimationFrame(animate);
    };
    animate();

    // Listen for mouse events
    mountRefCube.current.addEventListener("click", handleMouseClick);

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
      mountRefCube.current.removeEventListener("click", handleMouseClick);
    };
  }, [mountRefCube, texture, selectedColor]); // Include selectedColor in dependencies

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const textureLoader = new THREE.TextureLoader();
        textureLoader.load(e.target.result, (loadedTexture) => {
          setTexture(loadedTexture);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMouseClick = (event) => {
    if (!modelRef.current || !texture) return;

    // Calculate mouse position
    const rect = mountRefCube.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    // Perform raycasting to find the clicked point on the model
    raycaster.setFromCamera(mouse, cameraCube.current);
    const intersects = raycaster.intersectObject(modelRef.current, true);

    if (intersects.length > 0) {
      const intersected = intersects[0];
      applyDecal(intersected);
    }
  };

  const applyDecal = (intersected) => {
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -1, // Adjust for visibility
      side: THREE.DoubleSide,
    });

    const size = new THREE.Vector3(2, 2, 1); // Decal size
    const position = intersected.point.clone();
    const orientation = intersected.face.normal.clone();

    const decalGeometry = new DecalGeometry(
      intersected.object,
      position,
      orientation,
      size
    );

    const decalMesh = new THREE.Mesh(decalGeometry, material);
    sceneCube.current.add(decalMesh);

    console.log("Decal mesh added to the scene:", decalMesh);
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    // Apply the selected color to the model
    if (modelRef.current) {
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(newColor);
          child.material.needsUpdate = true;
        }
      });
    }
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
          <h3 className="mb-2 text-lg font-bold">Decal Controls</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="mb-2"
          />
          <select
            value={selectedColor}
            onChange={handleColorChange}
            className="mb-2"
          >
            <option value="#ffffff">White</option>
            <option value="#ff0000">Red</option>
            <option value="#00ff00">Green</option>
            <option value="#0000ff">Blue</option>
            <option value="#000000">Black</option>
          </select>
          <button
            onClick={handleMouseClick}
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Apply Decal
          </button>
        </div>
      </div>
    </div>
  );
});

export default AdjustPicsDecal;
