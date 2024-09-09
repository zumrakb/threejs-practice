import React, { useRef, useEffect, forwardRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { DragControls } from "three/examples/jsm/controls/DragControls";
import { DecalGeometry } from "three/examples/jsm/geometries/DecalGeometry";
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
          setTexture(loadedTexture);
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const applyDecalToSurface = () => {
    if (!meshRef.current || !texture) return;

    // Find the intersected point on the surface
    const intersected = {
      object: meshRef.current,
      point: new THREE.Vector3(0, 0, 1), // Adjust position to make decal visible
      face: { normal: new THREE.Vector3(0, 0, 1) },
    };

    const material = new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: 1,
      depthTest: true,
      depthWrite: true,
      polygonOffset: true,
      polygonOffsetFactor: -1, // Adjusted for better visibility
      side: THREE.DoubleSide, // Ensure decal is visible from both sides
    });

    const size = new THREE.Vector3(2, 2, 1); // Adjusted size to make it more visible
    const position = intersected.point.clone();
    const orientation = intersected.face.normal.clone();

    console.log("Decal material created:", material);
    console.log("Decal size set to:", size);
    console.log("Decal position:", position);
    console.log("Decal orientation:", orientation);

    const decalGeometry = new DecalGeometry(
      intersected.object,
      position,
      orientation,
      size
    );

    console.log("Decal geometry created:", decalGeometry);

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
            onClick={applyDecalToSurface}
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
