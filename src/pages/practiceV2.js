import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import * as CANNON from "cannon-es";

function ShapeCanvas({
  geometry,
  material,
  position,
  width,
  height,
  physicsOptions,
  adjustShadow,
  shadowSettings = {},
}) {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const physicsBodyRef = useRef(null);
  const worldRef = useRef(null);

  useEffect(() => {
    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 5, 10);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows
    canvasRef.current.appendChild(renderer.domElement);

    // Set background color to white
    renderer.setClearColor(0xffffff, 1);

    // Create lights with shadow properties
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(10, 15, 10); // Adjusted light position for better shadow details
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = shadowSettings.mapSize || 4096;
    directionalLight.shadow.mapSize.height = shadowSettings.mapSize || 4096;

    // Adjust shadow camera settings
    directionalLight.shadow.camera.near = 0.1;
    directionalLight.shadow.camera.far = 100;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    directionalLight.shadow.bias = shadowSettings.bias || -0.0001;

    scene.add(directionalLight);

    // Create the shape
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Initialize Cannon-ES physics world
    const world = new CANNON.World();
    world.gravity.set(0, -9.82, 0); // Set gravity
    worldRef.current = world;

    // Create a physics body for the shape
    const shape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
    const body = new CANNON.Body(physicsOptions);
    body.addShape(shape);
    body.position.set(position.x, position.y, position.z);
    world.addBody(body);
    physicsBodyRef.current = body;

    // Create a ground plane to catch shadows and physics collisions
    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.ShadowMaterial({ opacity: 0.5 });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.rotation.x = -Math.PI / 2;
    plane.position.y = adjustShadow ? -0.5 : -0.7; // Adjust plane position based on shape
    plane.receiveShadow = true;
    scene.add(plane);

    // Add physics plane to the world
    const groundBody = new CANNON.Body({
      mass: 0, // Mass of zero makes the plane static
    });
    const groundShape = new CANNON.Plane();
    groundBody.addShape(groundShape);
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    world.addBody(groundBody);

    // Add OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = true;
    controls.enableRotate = true;
    controls.enableZoom = true;

    // Render loop
    function animate() {
      requestAnimationFrame(animate);

      // Update physics world
      world.step(1 / 60); // Step the physics world with a fixed time step

      // Update Three.js mesh position based on physics body
      mesh.position.copy(body.position);
      mesh.quaternion.copy(body.quaternion);

      controls.update();
      renderer.render(scene, camera);
    }

    animate();

    // Cleanup function to remove previous instances
    // Cleanup function to remove previous instances
    return () => {
      if (canvasRef.current) {
        // canvasRef'in geçerli olup olmadığını kontrol edin
        while (canvasRef.current.firstChild) {
          canvasRef.current.removeChild(canvasRef.current.firstChild);
        }
      }
      renderer.dispose();
      controls.dispose();
      scene.clear();
    };
  }, [
    geometry,
    material,
    position,
    width,
    height,
    physicsOptions,
    adjustShadow,
    shadowSettings,
  ]);

  return <div ref={canvasRef} className="inline-block w-full" />;
}

function practiceV2() {
  const canvasWidth = 350; // Set your desired width
  const canvasHeight = 650; // Set your desired height

  return (
    <div className="w-screen flex justify-center items-center bg-white">
      {/* Box Shape with Basic Material */}
      <ShapeCanvas
        geometry={new THREE.BoxGeometry(1, 1, 1)}
        material={new THREE.MeshBasicMaterial({ color: 0x5548c8 })}
        position={new THREE.Vector3(0, 0, 0)}
        width={canvasWidth}
        height={canvasHeight}
        physicsOptions={{
          mass: 1,
          material: new CANNON.Material("boxMaterial"),
        }}
        adjustShadow={false} // Do not adjust shadow for box
      />

      {/* Cylinder Shape with Lambert Material */}
      <ShapeCanvas
        geometry={new THREE.CylinderGeometry(0.5, 0.5, 2, 32)}
        material={new THREE.MeshLambertMaterial({ color: 0xff6347 })}
        position={new THREE.Vector3(0, 0, 0)}
        width={canvasWidth}
        height={canvasHeight}
        physicsOptions={{
          mass: 1,
          material: new CANNON.Material("cylinderMaterial"),
          linearDamping: 0.3,
        }}
        adjustShadow={true} // Adjust shadow for cylinder
      />

      {/* Cone Shape with Phong Material */}
      <ShapeCanvas
        geometry={new THREE.ConeGeometry(0.5, 1, 32)}
        material={
          new THREE.MeshPhongMaterial({ color: 0x2ecc71, shininess: 100 })
        }
        position={new THREE.Vector3(0, 0, 0)}
        width={canvasWidth}
        height={canvasHeight}
        physicsOptions={{
          mass: 1,
          material: new CANNON.Material("coneMaterial"),
          angularDamping: 0.8,
        }}
        adjustShadow={true} // Adjust shadow for cone
      />

      {/* Torus Shape with Standard Material */}
      <ShapeCanvas
        geometry={new THREE.TorusGeometry(1, 0.1, 32, 100)} // Adjusted torus geometry for larger hole and thinner torus
        material={
          new THREE.MeshStandardMaterial({
            color: 0x00ffff,
            metalness: 0.5,
            roughness: 0.5,
          })
        }
        position={new THREE.Vector3(0, 0, 0)}
        width={canvasWidth}
        height={canvasHeight}
        physicsOptions={{
          mass: 2,
          material: new CANNON.Material("torusMaterial"),
          friction: 0.5,
        }}
        adjustShadow={true} // Adjust shadow for torus
        shadowSettings={{
          mapSize: 4096, // Higher shadow map size for better detail
          bias: -0.0001, // Fine-tune bias for accurate shadows
        }}
      />
    </div>
  );
}

export default practiceV2;
