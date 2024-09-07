import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";
import * as CANNON from "cannon-es";
import { FontLoader } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";

const ThreeScene = forwardRef((_, ref) => {
  const mountRefCube = useRef(null);
  const controlsRefCube = useRef(null);
  const meshRef = useRef(null); // Ref for the cube mesh
  const textMeshRef = useRef(null); // Ref for the text mesh
  const sceneCube = useRef(null); // Ref for the scene
  const [texture, setTexture] = useState(null);
  const [userText, setUserText] = useState("");
  const [selectedSurface, setSelectedSurface] = useState("front");
  const [selectedTextureSurface, setSelectedTextureSurface] = useState("front"); // Yeni state

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

    // Küp için Resize İşlemi
    const handleResizeCube = () => {
      if (!mountRefCube.current) return;
      const width = mountRefCube.current.clientWidth;
      const height = mountRefCube.current.clientHeight;
      rendererCube.setSize(width, height);
      cameraCube.aspect = width / height;
      cameraCube.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResizeCube);

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
      new THREE.MeshStandardMaterial({ color: "#00ff83" }), // front
      new THREE.MeshStandardMaterial({ color: "#00ff83" }), // back
      new THREE.MeshStandardMaterial({ color: "#00ff83" }), // top
      new THREE.MeshStandardMaterial({ color: "#00ff83" }), // bottom
      new THREE.MeshStandardMaterial({ color: "#00ff83" }), // left
      new THREE.MeshStandardMaterial({ color: "#00ff83" }), // right
    ];
    const mesh = new THREE.Mesh(geometry, materials);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    sceneCube.current.add(mesh);

    meshRef.current = mesh; // Store the reference to mesh

    const boxShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5));
    const boxBody = new CANNON.Body({
      mass: 1,
      position: new CANNON.Vec3(0, 5, 0),
    });
    boxBody.addShape(boxShape);
    world.addBody(boxBody);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    sceneCube.current.add(ambientLight);

    // Directional Light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.bias = -0.001;

    sceneCube.current.add(directionalLight);

    // Kontroller ekleyin
    controlsRefCube.current = new OrbitControls(
      cameraCube,
      rendererCube.domElement
    );
    controlsRefCube.current.enableDamping = true;
    controlsRefCube.current.enablePan = true;
    controlsRefCube.current.enableZoom = true;

    // GSAP Animations
    const tl = gsap.timeline({ defaults: { duration: 1 } });
    tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 });

    // Animation loop
    const animate = () => {
      world.step(1 / 60);

      mesh.position.copy(boxBody.position);
      mesh.quaternion.copy(boxBody.quaternion);

      controlsRefCube.current.update();

      rendererCube.render(sceneCube.current, cameraCube);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResizeCube);
      if (mountRefCube.current) {
        mountRefCube.current.removeChild(rendererCube.domElement);
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
      if (textMeshRef.current) {
        // Remove old text mesh
        sceneCube.current.remove(textMeshRef.current);
      }

      const textGeometry = new TextGeometry(userText, {
        font: font,
        size: 0.5,
        height: 0.1,
      });
      textGeometry.center();

      const textMaterial = new THREE.MeshStandardMaterial({ color: "#000000" });
      const newTextMesh = new THREE.Mesh(textGeometry, textMaterial);

      // Kullanıcının seçtiği yüzeye göre metni yerleştirme
      switch (selectedSurface) {
        case "top":
          newTextMesh.position.set(0, 1.5, 0);
          newTextMesh.rotation.set(-Math.PI / 2, 0, 0);
          break;
        case "bottom":
          newTextMesh.position.set(0, -1.5, 0);
          newTextMesh.rotation.set(Math.PI / 2, 0, 0);
          break;
        case "left":
          newTextMesh.position.set(-1.5, 0, 0);
          newTextMesh.rotation.set(0, Math.PI / 2, 0);
          break;
        case "right":
          newTextMesh.position.set(1.5, 0, 0);
          newTextMesh.rotation.set(0, -Math.PI / 2, 0);
          break;
        case "front":
          newTextMesh.position.set(0, 0, 1.5);
          newTextMesh.rotation.set(0, 0, 0);
          break;
        case "back":
          newTextMesh.position.set(0, 0, -1.5);
          newTextMesh.rotation.set(0, Math.PI, 0);
          break;
        default:
          newTextMesh.position.set(0, 2, 0);
          break;
      }

      sceneCube.current.add(newTextMesh);
      textMeshRef.current = newTextMesh; // Store reference to the new text mesh
    });
  };

  useImperativeHandle(ref, () => ({
    startAutoRotate() {
      controlsRefCube.current.autoRotate = true;
    },
    stopAutoRotate() {
      controlsRefCube.current.autoRotate = false;
    },
    showFromTop() {
      controlsRefCube.current.reset();
      controlsRefCube.current.object.position.set(0, 10, 0);
      controlsRefCube.current.object.lookAt(0, 0, 0);
    },
  }));

  return (
    <>
      <div ref={mountRefCube} className="w-full h-[600px] mb-2" />
      <input type="file" accept="image/*" onChange={handleFileInput} />
      <div style={{ position: "absolute", bottom: "10px", right: "10px" }}>
        <input
          type="text"
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          placeholder="Enter text"
        />
        <select
          value={selectedSurface}
          onChange={(e) => setSelectedSurface(e.target.value)}
        >
          <option value="front">Front</option>
          <option value="back">Back</option>
          <option value="top">Top</option>
          <option value="bottom">Bottom</option>
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
        <button onClick={handleAddTextToCube}>Put Text on 3D Model</button>
        <select
          value={selectedTextureSurface}
          onChange={(e) => setSelectedTextureSurface(e.target.value)}
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
        >
          Put Image on 3D Model
        </button>
      </div>
    </>
  );
});

export default ThreeScene;
