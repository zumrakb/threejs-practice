import React, { useRef, useEffect, useState, forwardRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry";
import * as CANNON from "cannon-es";

const Uygulama = forwardRef((_, ref) => {
  const mountRefCube = useRef(null);
  const controlsRefCube = useRef(null);
  const dragControlsRef = useRef(null);
  const sceneCube = useRef(null);
  const cameraCube = useRef(null);
  const rendererCubeRef = useRef(null);
  const [texture, setTexture] = useState(null);
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [textInput, setTextInput] = useState("");
  const [texts, setTexts] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [modelColor, setModelColor] = useState("#ffffff");
  const [textSize, setTextSize] = useState(0.1);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const draggableObjects = useRef([]);
  const modelRef = useRef(null);
  const decalMeshes = useRef([]);
  const selectedDecalRef = useRef(null);

  useEffect(() => {
    if (!mountRefCube.current) return;

    // Initialize the scene and camera
    sceneCube.current = new THREE.Scene();
    cameraCube.current = new THREE.PerspectiveCamera(
      45,
      mountRefCube.current.clientWidth / mountRefCube.current.clientHeight,
      0.1,
      100
    );
    cameraCube.current.position.set(6, 6, 6);
    cameraCube.current.lookAt(0, 0, 0);

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

    controlsRefCube.current = new OrbitControls(
      cameraCube.current,
      rendererCubeRef.current.domElement
    );
    controlsRefCube.current.enableDamping = true;

    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

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

    loadModel(); // Load the 3D model

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    sceneCube.current.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    sceneCube.current.add(directionalLight);

    const animate = () => {
      world.step(1 / 60);
      controlsRefCube.current.update();
      rendererCubeRef.current.render(sceneCube.current, cameraCube.current);
      requestAnimationFrame(animate);
    };
    animate();

    const handleMouseMoveListener = (event) => handleMouseMove(event);
    const handleMouseDownListener = (event) => handleMouseDown(event);
    const handleMouseUpListener = () => handleMouseUp();

    window.addEventListener("mousemove", handleMouseMoveListener);
    window.addEventListener("mousedown", handleMouseDownListener);
    window.addEventListener("mouseup", handleMouseUpListener);

    mountRefCube.current.addEventListener("click", handleMeshClick);

    return () => {
      if (rendererCubeRef.current) {
        rendererCubeRef.current.dispose();
      }
      if (mountRefCube.current) {
        mountRefCube.current.removeChild(rendererCubeRef.current.domElement);
      }
      controlsRefCube.current.dispose();
      dragControlsRef.current?.dispose();
      mountRefCube.current.removeEventListener("click", handleMeshClick);

      window.removeEventListener("mousemove", handleMouseMoveListener);
      window.removeEventListener("mousedown", handleMouseDownListener);
      window.removeEventListener("mouseup", handleMouseUpListener);
    };
  }, []);

  const loadModel = () => {
    if (modelRef.current) {
      // If a model already exists, remove it from the scene
      sceneCube.current.remove(modelRef.current);
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          child.material.dispose();
        }
      });
    }

    const loader = new GLTFLoader();
    loader.load(
      "bag.glb",
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.color.set(modelColor);
            child.material.needsUpdate = true;
          }
        });
        model.position.set(0, 0, 0);
        model.scale.set(8, 8, 8);

        sceneCube.current.add(model);
        modelRef.current = model;
        draggableObjects.current.push(model);
        updateDragControls();
      },
      undefined,
      (error) => {
        console.error("Model loading error:", error);
      }
    );
  };

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

  const handleMeshClick = (event) => {
    const rect = mountRefCube.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraCube.current);

    // Intersect with all objects including text meshes
    const intersects = raycaster.intersectObjects(
      [modelRef.current, ...decalMeshes.current, ...texts],
      true
    );

    if (intersects.length > 0) {
      const intersected = intersects[0].object;

      // Check if the intersected object is a text
      if (texts.includes(intersected)) {
        setSelectedText(intersected);
        setTextInput(intersected.userData.text); // Get text from userData
        setSelectedColor(intersected.material.color.getStyle());
      } else if (texture) {
        // If a model or decal is clicked, apply decal
        applyDecalToSurface(intersects[0]);
      }
    } else {
      // Clear the selected text if clicked on an empty space
      setSelectedText(null);
      setTextInput("");
    }
  };

  const applyDecalToSurface = (intersected) => {
    const decalMesh = createDecalMesh(texture, intersected);
    sceneCube.current.add(decalMesh);
    decalMeshes.current.push(decalMesh);
  };

  const createDecalMesh = (texture, intersected) => {
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -5,
      wireframe: false,
      side: THREE.FrontSide,
    });

    const size = new THREE.Vector3(0.5, 0.5, 0.5);
    const position = intersected.point.clone();
    const orientation = intersected.face.normal.clone();

    const decalGeometry = new DecalGeometry(
      intersected.object,
      position,
      orientation,
      size
    );
    const decalMesh = new THREE.Mesh(decalGeometry, material);

    return decalMesh;
  };

  const handleMouseDown = (event) => {
    const rect = mountRefCube.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraCube.current);

    const validObjects = [modelRef.current, ...decalMeshes.current].filter(
      (object) => object !== null
    );

    const intersects = raycaster.intersectObjects(validObjects, true);
    if (intersects.length > 0) {
      const intersected = intersects[0];
      selectedDecalRef.current = intersected.object;
    }
  };

  const handleMouseMove = (event) => {
    if (!selectedDecalRef.current) return;

    const rect = mountRefCube.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, cameraCube.current);

    const intersects = raycaster.intersectObject(modelRef.current, true);
    if (intersects.length > 0) {
      const intersected = intersects[0];

      updateDecalMesh(
        selectedDecalRef.current,
        selectedDecalRef.current.material.map,
        intersected
      );
    }
  };

  const updateDecalMesh = (mesh, texture, intersected) => {
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -5,
      wireframe: false,
      side: THREE.FrontSide,
    });

    const size = new THREE.Vector3(0.5, 0.5, 0.5);
    const position = intersected.point.clone();
    const orientation = intersected.face.normal.clone();

    const decalGeometry = new DecalGeometry(
      intersected.object,
      position,
      orientation,
      size
    );
    mesh.geometry.dispose();
    mesh.geometry = decalGeometry;
    mesh.material = material;
  };

  const handleMouseUp = () => {
    selectedDecalRef.current = null;
  };

  const handleColorChange = (event) => {
    const newColor = event.target.value;
    setSelectedColor(newColor);
    if (selectedText) {
      selectedText.material.color.set(newColor);
      selectedText.material.needsUpdate = true;
    }
  };

  const handleModelColorChange = (event) => {
    const newColor = event.target.value;
    setModelColor(newColor);
    loadModel(); // Reload the model with the new color
  };

  const updateDragControls = () => {
    if (dragControlsRef.current) {
      dragControlsRef.current.dispose();
    }

    dragControlsRef.current = new DragControls(
      draggableObjects.current,
      cameraCube.current,
      rendererCubeRef.current.domElement
    );

    dragControlsRef.current.addEventListener("dragstart", () => {
      controlsRefCube.current.enabled = false;
    });

    dragControlsRef.current.addEventListener("dragend", () => {
      controlsRefCube.current.enabled = true;
    });

    dragControlsRef.current.addEventListener("drag", (event) => {
      event.object.position.copy(event.object.position);
    });
  };

  const updateText = () => {
    if (selectedText) {
      const loader = new FontLoader();
      loader.load("/fonts.json", function (font) {
        const newGeometry = new TextGeometry(textInput, {
          font: font,
          size: textSize,
          height: 0.01,
          curveSegments: 12,
          bevelEnabled: false,
        });

        selectedText.geometry.dispose();
        selectedText.geometry = newGeometry;
        selectedText.userData.text = textInput; // Update the text in userData
      });
    }
  };

  const removeSelectedText = () => {
    if (selectedText) {
      sceneCube.current.remove(selectedText);
      setTexts(texts.filter((text) => text !== selectedText));
      setSelectedText(null);
      setTextInput("");
    }
  };

  const applyTextToSurface = ({ point }) => {
    const loader = new FontLoader();
    loader.load("/fonts.json", (font) => {
      const textGeometry = new TextGeometry(textInput, {
        font: font,
        size: textSize,
        height: 0.01,
        curveSegments: 12,
        bevelEnabled: false,
      });

      const textMaterial = new THREE.MeshBasicMaterial({
        color: selectedColor,
        side: THREE.DoubleSide,
      });

      const textMesh = new THREE.Mesh(textGeometry, textMaterial);
      textMesh.position.copy(point);

      // Add text information to userData
      textMesh.userData.text = textInput;

      sceneCube.current.add(textMesh);

      // Add to draggable objects list
      draggableObjects.current.push(textMesh);

      updateDragControls();

      setTexts((prevTexts) => [...prevTexts, textMesh]);
      setSelectedText(textMesh);
    });
  };

  const handleRotate = () => {
    controlsRefCube.current.autoRotate = true;
    controlsRefCube.current.autoRotateSpeed = 1;
  };

  const handleStopRotate = () => {
    controlsRefCube.current.autoRotate = false;
  };

  const handleShowTop = () => {
    cameraCube.current.position.set(0, 10, 0);
    cameraCube.current.lookAt(0, 0, 0);
    controlsRefCube.current.update();
  };

  return (
    <div className="flex gap-2 px-2">
      <div
        ref={mountRefCube}
        className="w-full h-[600px] mb-2 border border-orange-500 rounded-lg"
      />
      <div className="flex flex-col">
        <div className="p-4 h-[600px] border border-gray-300 rounded-lg max-w-sm bg-gray-100">
          <h3 className="mb-2 text-lg font-bold">Decal Controls</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileInput}
            className="mb-2"
          />
          <select
            value={modelColor}
            onChange={handleModelColorChange}
            className="mb-2"
          >
            <option value="#ffffff">Model White</option>
            <option value="#ff0000">Model Red</option>
            <option value="#00ff00">Model Green</option>
            <option value="#0000ff">Model Blue</option>
            <option value="#000000">Model Black</option>
          </select>
          <select
            value={selectedColor}
            onChange={handleColorChange}
            className="mb-2"
          >
            <option value="#ffffff">Text White</option>
            <option value="#ff0000">Text Red</option>
            <option value="#00ff00">Text Green</option>
            <option value="#0000ff">Text Blue</option>
            <option value="#000000">Text Black</option>
          </select>
          <input
            type="text"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            placeholder="Enter text"
            className="mb-2 p-2 border"
          />
          <div className="mb-2">
            <label htmlFor="textSize" className="block mb-1">
              Text Size
            </label>
            <input
              type="range"
              id="textSize"
              min="0.01"
              max="0.5"
              step="0.01"
              value={textSize}
              onChange={(e) => setTextSize(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={() =>
              applyTextToSurface({ point: new THREE.Vector3(0, 0, 0) })
            }
            className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Text
          </button>
          <button
            onClick={updateText}
            className="w-full p-2 bg-green-500 text-white rounded hover:bg-green-600 mt-2"
            disabled={!selectedText}
          >
            Update Text
          </button>
          <button
            onClick={removeSelectedText}
            className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 mt-2"
            disabled={!selectedText}
          >
            Remove Text
          </button>
          <button
            onClick={handleRotate}
            className="w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600 mt-2"
          >
            Rotate Automatically
          </button>
          <button
            onClick={handleStopRotate}
            className="w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600 mt-2"
          >
            Stop Auto Rotate
          </button>
          <button
            onClick={handleShowTop}
            className="w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600 mt-2"
          >
            Show From Top
          </button>
        </div>
      </div>
    </div>
  );
});

export default Uygulama;
