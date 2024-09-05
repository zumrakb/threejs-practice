import React, {
  useRef,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import gsap from "gsap";
import * as CANNON from "cannon-es"; // Cannon.js'i içe aktarın

const ThreeScene = forwardRef((_, ref) => {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);

  useEffect(() => {
    // Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(6, 6, 6);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(
      mountRef.current.clientWidth,
      mountRef.current.clientHeight
    );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mountRef.current.appendChild(renderer.domElement);

    // Handle Resize
    const handleResize = () => {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    // Cannon.js Dünya ve Fizik Ayarları
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Yerçekimini ayarlayın

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
    scene.add(plane);

    const planeShape = new CANNON.Plane();
    const planeBody = new CANNON.Body({
      mass: 0, // Kütlesiz, sabit zemin
      position: new CANNON.Vec3(0, -1.5, 0),
    });
    planeBody.addShape(planeShape);
    planeBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(planeBody);

    // Küp için fizik gövdesi oluşturulması
    const geometry = new THREE.BoxGeometry(3, 3, 3);
    const material = new THREE.MeshStandardMaterial({
      color: "#00ff83",
      roughness: 0.4,
      metalness: 0.2,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = false;
    scene.add(mesh);

    const boxShape = new CANNON.Box(new CANNON.Vec3(1.5, 1.5, 1.5));
    const boxBody = new CANNON.Body({
      mass: 1, // Kütle 1, hareket edebilir
      position: new CANNON.Vec3(0, 5, 0),
    });
    boxBody.addShape(boxShape);
    world.addBody(boxBody);

    // Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

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

    scene.add(directionalLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableZoom = true;
    controls.autoRotate = false;
    controls.autoRotateSpeed = 5;
    controls.update();
    controlsRef.current = controls;

    // GSAP Animations
    const tl = gsap.timeline({ defaults: { duration: 1 } });
    tl.fromTo(mesh.scale, { z: 0, x: 0, y: 0 }, { z: 1, x: 1, y: 1 });

    // Animation loop
    const animate = () => {
      world.step(1 / 60); // Fizik simülasyonunu güncelleyin

      // Three.js objelerini fizik simülasyonuna göre güncelleyin
      mesh.position.copy(boxBody.position);
      mesh.quaternion.copy(boxBody.quaternion);

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      if (mountRef.current) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  useImperativeHandle(ref, () => ({
    startAutoRotate() {
      controlsRef.current.autoRotate = true;
    },
    stopAutoRotate() {
      controlsRef.current.autoRotate = false;
    },
    showFromTop() {
      controlsRef.current.reset();
      controlsRef.current.object.position.set(0, 10, 0);
      controlsRef.current.object.lookAt(0, 0, 0);
    },
  }));

  return <div ref={mountRef} className="w-full h-[600px]" />;
});

export default ThreeScene;
