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
  const [texture, setTexture] = useState(null);
  const [userText, setUserText] = useState("");
  const [selectedTextureSurface, setSelectedTextureSurface] = useState("front");
  const [textMeshes, setTextMeshes] = useState([]);
  const [selectedText, setSelectedText] = useState(null);
  const [textSize, setTextSize] = useState(0.5);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const draggableObjects = useRef([]);

  useEffect(() => {
    if (!mountRefCube.current) return;

    // Three.js sahnesi oluştur
    sceneCube.current = new THREE.Scene();
    cameraCube.current = new THREE.PerspectiveCamera(
      45,
      mountRefCube.current.clientWidth / mountRefCube.current.clientHeight,
      0.1,
      100
    );
    cameraCube.current.position.set(6, 6, 6);
    cameraCube.current.lookAt(0, 0, 0);

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

    // OrbitControls ekleyin
    controlsRefCube.current = new OrbitControls(
      cameraCube.current,
      rendererCube.domElement
    );
    controlsRefCube.current.enableDamping = true;

    // Cannon.js Dünya ve Fizik Ayarları
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0);

    // Zemin için fizik gövdesi
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

    // Küp için fizik gövdesi
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

    // Drag Controls oluşturulması
    updateDragControls();

    // Animation loop
    const animate = () => {
      world.step(1 / 60);
      controlsRefCube.current.update();
      rendererCube.render(sceneCube.current, cameraCube.current);
      requestAnimationFrame(animate);
    };
    animate();

    // Mouse hareket olaylarını ve tıklamaları dinleyin
    if (typeof window !== "undefined") {
      window.addEventListener("mousemove", onDocumentMouseMove);
      window.addEventListener("click", onDocumentMouseClick);
    }

    // Cleanup on unmount
    return () => {
      if (mountRefCube.current) {
        mountRefCube.current.removeChild(rendererCube.domElement);
      }
      controlsRefCube.current.dispose();
      dragControlsRef.current?.dispose();
      if (typeof window !== "undefined") {
        window.removeEventListener("mousemove", onDocumentMouseMove);
        window.removeEventListener("click", onDocumentMouseClick);
      }
    };
  }, [mountRefCube]);

  /* onDocumentMouseMove:
Fare hareketi işleyicisi.
event.preventDefault();:
Varsayılan fare olaylarını engeller. (Örneğin, tarayıcıda sayfanın seçilmesini engeller.)
const rect = mountRefCube.current.getBoundingClientRect();:
Sahnenin (renderer'ın) yerleşim bilgilerini alır. Bu, fare konumunu hesaplamak için kullanılır.
mouse.x ve mouse.y hesaplamaları:
Fare pozisyonunu normalize eder. (-1, 1) aralığına getirir ki, Three.js'deki raycasting işlemleri için uygun hale gelsin.
jsx */
  const onDocumentMouseMove = (event) => {
    event.preventDefault();
    const rect = mountRefCube.current.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  };

  /* onDocumentMouseClick:
Fare tıklama işleyicisi.
if (event.target.tagName === "INPUT") { ... }:
Eğer tıklama bir <input> alanında gerçekleştiyse, işlem durdurulur (örneğin, kullanıcı metin alanına tıkladığında sahnedeki nesnelerin seçilmesini engeller).
raycaster.setFromCamera(mouse, cameraCube.current);:
Fare pozisyonuna göre bir ışın demeti (ray) oluşturur. Bu ışın, kameradan sahneye doğru yönlendirilir.
const intersects = raycaster.intersectObjects(...):
Işının sahnedeki nesnelerle kesiştiği (çarpıştığı) noktaları kontrol eder.
sceneCube.current.children: Sahnedeki tüm çocuk nesneler.
true: Çocuk nesnelerin alt nesneleriyle de kontrol edilmesini sağlar.
if (intersects.length > 0) { ... }:
Eğer bir veya daha fazla nesne ile kesişme varsa:
const clickedMesh = intersects[0].object;: Tıklanan ilk nesneyi (mesh) alır.
console.log(...): Tıklanan mesh ve kullanıcı verisi (userData.text) konsola yazdırılır.
setSelectedText(clickedMesh);: Tıklanan metin nesnesini seçili nesne olarak ayarlar.
setUserText(clickedMesh.userData.text);: Tıklanan metni, metin giriş alanına koyar.
else { ... }:
Eğer tıklanan bir nesne yoksa, konsola mesaj yazdırır ("No text mesh was clicked."). */
  const onDocumentMouseClick = (event) => {
    if (event.target.tagName === "INPUT") {
      // Eğer tıklama bir input alanındaysa, işlemi durdur
      return;
    }

    raycaster.setFromCamera(mouse, cameraCube.current);

    // Sahnedeki tüm nesneler için kesişme kontrolü yap
    const intersects = raycaster.intersectObjects(
      sceneCube.current.children,
      true
    );

    if (intersects.length > 0) {
      const clickedMesh = intersects[0].object;
      console.log("Clicked Mesh:", clickedMesh); // Tıklanan Mesh'i göster
      console.log("Clicked Mesh's User Data Text:", clickedMesh.userData.text); // Tıklanan Mesh'in userData.text değerini göster

      setSelectedText(clickedMesh);
      setUserText(clickedMesh.userData.text); // Tıklanan metni input alanına getir
    } else {
      console.log("No text mesh was clicked.");
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

  const applyTextureToSurface = (surface, texture) => {
    if (!meshRef.current || !texture) return;
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

  const handleAddTextToCube = () => {
    const fontLoader = new FontLoader();
    fontLoader.load("/fonts.json", (font) => {
      const textGeometry = new TextGeometry(userText, {
        font: font,
        size: textSize,
        height: 0.1,
      });

      textGeometry.translate(1.5, 0, 1.5);

      const textMaterial = new THREE.MeshStandardMaterial({ color: "#000000" });
      const newTextMesh = new THREE.Mesh(textGeometry, textMaterial);
      newTextMesh.position.set(0, 0, 0);

      // Kullanıcı tarafından girilen metni userData'ya kaydedin
      newTextMesh.userData.text = userText;

      sceneCube.current.add(newTextMesh);
      draggableObjects.current.push(newTextMesh);
      setTextMeshes((prevMeshes) => [...prevMeshes, newTextMesh]); // Text mesh'i ekleyin
      setSelectedText(newTextMesh);

      console.log("All Text Meshes After Adding:", textMeshes);
      console.log(
        `User-entered text for new mesh: ${newTextMesh.userData.text}`
      );
      updateDragControls();
    });
  };

  const handleUpdateText = () => {
    if (!selectedText) return;

    // Güncellenmiş metni doğrudan seçili mesh'e uygula
    selectedText.userData.text = userText;

    // Mevcut geometriyi sil ve yeni geometri oluştur
    const fontLoader = new FontLoader();
    fontLoader.load("/fonts.json", (font) => {
      const textGeometry = new TextGeometry(userText, {
        font: font,
        size: textSize,
        height: 0.1,
      });
      textGeometry.translate(1.5, 0, 1.5);

      selectedText.geometry.dispose(); // Eski geometriyi sil
      selectedText.geometry = textGeometry; // Yeni geometri ata

      console.log("Updated Text Mesh:", selectedText);
      console.log(
        `Updated text for selected mesh: ${selectedText.userData.text}`
      );
    });
  };

  const handleDeleteText = () => {
    if (!selectedText) return;

    console.log("Deleting Text Mesh:", selectedText); // Silinen Mesh'i göster
    sceneCube.current.remove(selectedText);
    draggableObjects.current = draggableObjects.current.filter(
      (obj) => obj !== selectedText
    );

    setTextMeshes((prevMeshes) =>
      prevMeshes.filter((mesh) => mesh !== selectedText)
    );
    setSelectedText(null);
    updateDragControls();
  };

  return (
    <div className="flex gap-2 px-2 ">
      <div
        ref={mountRefCube}
        className="w-full h-[600px] mb-2 border border-orange-500 rounded-lg"
      />
      <div className="flex ">
        <div className="p-4 h-[600px] border border-gray-300 rounded-lg max-w-sm bg-gray-100 ">
          <h3 className="mb-2 text-lg font-bold">Text Controls</h3>
          <input
            type="text"
            value={userText}
            onChange={(e) => setUserText(e.target.value)}
            placeholder="Enter text"
            className="mb-2 w-full p-2 border border-gray-300 rounded"
            onClick={(e) => e.stopPropagation()} // input alanına tıklama olayını durdurun
          />
          <button
            onClick={handleAddTextToCube}
            className="mb-2 w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Add Text
          </button>
          <button
            onClick={handleUpdateText}
            className="mb-2 w-full p-2 bg-orange-500 text-white rounded hover:bg-orange-600"
          >
            Update Text
          </button>
          <button
            onClick={handleDeleteText}
            className="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Text
          </button>

          <label className="block mb-2">
            Text Size:
            <input
              type="range"
              min="0.1"
              max="2"
              step="0.1"
              value={textSize}
              onChange={(e) => setTextSize(parseFloat(e.target.value))}
              className="w-full"
            />
          </label>
        </div>

        <div className="p-4 h-[600px] border border-gray-300 rounded-lg max-w-sm bg-gray-100 ">
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
        </div>
      </div>
    </div>
  );
});

export default AdjustPics;
