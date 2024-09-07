import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import gsap from "gsap";
import * as CANNON from "cannon-es";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const ThreeScene = forwardRef((_, ref) => {
  const mountRefCube = useRef(null);
  const controlsRefCube = useRef(null);
  const dragControlsRef = useRef(null);
  const meshRef = useRef(null); // Ref for the cube mesh
  const textMeshRef = useRef(null); // Ref for the text mesh
  const sceneCube = useRef(null); // Ref for the scene
  const [texture, setTexture] = useState(null);
  const [userText, setUserText] = useState("");
  const [selectedSurface, setSelectedSurface] = useState("front");
  const [selectedTextureSurface, setSelectedTextureSurface] = useState("front");
  const [textMeshes, setTextMeshes] = useState([]); // Array to store text meshes
  const [selectedText, setSelectedText] = useState(null); // Store the selected text mesh
  const [textSize, setTextSize] = useState(0.5); // Default text size

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const draggableObjects = useRef([]); // Array to store draggable objects

  useEffect(() => {
    if (!mountRefCube.current) return;

    // Create a new Three.js scene and assign it to the ref
    sceneCube.current = new THREE.Scene();
    const cameraCube = new THREE.PerspectiveCamera(
      45,
      mountRefCube.current.clientWidth / mountRefCube.current.clientHeight,
      0.1,
      100
    );
    cameraCube.position.set(6, 6, 6);
    cameraCube.lookAt(0, 0, 0);

    const rendererCube = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
    });
    rendererCube.setSize(
      mountRefCube.current.clientWidth,
      mountRefCube.current.clientHeight
    );
    rendererCube.setPixelRatio(window.devicePixelRatio);
    rendererCube.shadowMap.enabled = true;
    rendererCube.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRefCube.current.appendChild(rendererCube.domElement);

    // Kontroller ekleyin
    controlsRefCube.current = new OrbitControls(
      cameraCube,
      rendererCube.domElement
    );
    controlsRefCube.current.enableDamping = true;

    // Cannon.js Dünya ve Fizik Ayarları
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // Zemin için fizik gövdesi oluşturulması
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

    // Küp için fizik gövdesi oluşturulması
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

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    sceneCube.current.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    sceneCube.current.add(directionalLight);

    // Drag Controls setup
    dragControlsRef.current = new DragControls(
      draggableObjects.current,
      cameraCube,
      rendererCube.domElement
    );

    dragControlsRef.current.addEventListener("dragstart", () => {
      controlsRefCube.current.enabled = false;
    });
    dragControlsRef.current.addEventListener("dragend", () => {
      controlsRefCube.current.enabled = true;
    });

    // Animation loop
    const animate = () => {
      world.step(1 / 60);
      controlsRefCube.current.update();
      rendererCube.render(sceneCube.current, cameraCube);
      requestAnimationFrame(animate);
    };
    animate();

    // Setup mouse event listeners on client side
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", onDocumentMouseMove);
    }

    // Cleanup on unmount
    return () => {
      if (mountRefCube.current) {
        mountRefCube.current.removeChild(rendererCube.domElement);
      }
      controlsRefCube.current.dispose();
      dragControlsRef.current.dispose();

      // Remove event listener on cleanup
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", onDocumentMouseMove);
      }
    };
  }, [mountRefCube]);

  const handleFileInput = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        const textureLoader = new THREE.TextureLoader();
        const loadedTexture = textureLoader.load(
          e.target.result,
          (loadedTexture) => {
            setTexture(loadedTexture);
          }
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const applyTextureToSurface = (surface, texture) => {
    if (!meshRef.current || !texture) return;
    const materials = meshRef.current.material;

    // Choose the correct material index based on surface
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

    // Apply texture to the selected surface material
    materials[materialIndex].map = texture;
    materials[materialIndex].needsUpdate = true;
  };

  const handleAddTextToCube = () => {
    const fontLoader = new FontLoader();
    fontLoader.load("/fonts.json", (font) => {
      const textGeometry = new TextGeometry(userText, {
        font: font,
        size: textSize,
        height: 0.1,
      });

      // Positioning text slightly to the right side
      textGeometry.translate(1.5, 0, 1.5); // Move text to the right side

      const textMaterial = new THREE.MeshStandardMaterial({ color: "#000000" });
      const newTextMesh = new THREE.Mesh(textGeometry, textMaterial);
      newTextMesh.position.set(0, 0, 0); // Keep it near the center but slightly right
      sceneCube.current.add(newTextMesh);
      draggableObjects.current.push(newTextMesh);
      setTextMeshes((prevMeshes) => [...prevMeshes, newTextMesh]); // Store reference to the new text mesh
      setSelectedText(newTextMesh); // Select the newly added text
    });
  };

  const handleUpdateText = () => {
    if (!selectedText) return;

    // Remove the old text mesh
    sceneCube.current.remove(selectedText);

    // Add new updated text mesh
    const fontLoader = new FontLoader();
    fontLoader.load("/fonts.json", (font) => {
      const textGeometry = new TextGeometry(userText, {
        font: font,
        size: textSize,
        height: 0.1,
      });
      textGeometry.translate(1.5, 0, 1.5); // Keep the updated text also on the right side

      const textMaterial = new THREE.MeshStandardMaterial({ color: "#000000" });
      const updatedTextMesh = new THREE.Mesh(textGeometry, textMaterial);
      updatedTextMesh.position.copy(selectedText.position); // Maintain the old position
      sceneCube.current.add(updatedTextMesh);
      draggableObjects.current.push(updatedTextMesh);

      setTextMeshes((prevMeshes) =>
        prevMeshes.map((mesh) =>
          mesh === selectedText ? updatedTextMesh : mesh
        )
      );
      setSelectedText(updatedTextMesh); // Update the selected text reference
    });
  };

  const handleDeleteText = () => {
    if (!selectedText) return;

    // Remove text from the scene
    sceneCube.current.remove(selectedText);
    draggableObjects.current = draggableObjects.current.filter(
      (obj) => obj !== selectedText
    );

    setTextMeshes((prevMeshes) =>
      prevMeshes.filter((mesh) => mesh !== selectedText)
    );
    setSelectedText(null);
  };

  const onDocumentMouseMove = (event) => {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  };

  return (
    <>
      <div ref={mountRefCube} className="w-full h-[600px] mb-2" />
      <div
        style={{
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          maxWidth: "300px",
          backgroundColor: "#f9f9f9",
          marginTop: "20px",
        }}
      >
        <h3
          style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}
        >
          Text Controls
        </h3>
        <input
          type="text"
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Enter text"
          style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
        />
        <button
          onClick={handleAddTextToCube}
          style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
        >
          Add Text
        </button>
        <button
          onClick={handleUpdateText}
          style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
        >
          Update Text
        </button>
        <button
          onClick={handleDeleteText}
          style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
        >
          Delete Text
        </button>

        <label style={{ marginBottom: "10px", display: "block" }}>
          Text Size:
          <input
            type="range"
            min="0.1"
            max="2"
            step="0.1"
            value={textSize}
            onChange={(e) => setTextSize(parseFloat(e.target.value))}
            style={{ width: "100%" }}
          />
        </label>
      </div>

      <div
        style={{
          padding: "10px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          maxWidth: "300px",
          backgroundColor: "#f9f9f9",
          marginTop: "20px",
        }}
      >
        <h3
          style={{ marginBottom: "10px", fontSize: "16px", fontWeight: "bold" }}
        >
          Texture Controls
        </h3>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileInput}
          style={{ marginBottom: "10px" }}
        />
        <select
          value={selectedTextureSurface}
          onChange={(e) => setSelectedTextureSurface(e.target.value)}
          style={{ marginBottom: "10px", width: "100%", padding: "8px" }}
        >
          <option value="front">Front</option>
          <option value="back">Back</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
        <button
          onClick={() => applyTextureToSurface(selectedTextureSurface, texture)}
          style={{ width: "100%", padding: "8px" }}
        >
          Apply Texture
        </button>
      </div>
    </>
  );
});

export default ThreeScene;
