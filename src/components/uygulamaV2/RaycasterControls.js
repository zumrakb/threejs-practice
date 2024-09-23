/* Raycaster ve Fare Kontrolleri */
import React, { useEffect } from "react";
import * as THREE from "three";

function RaycasterControls({ cameraRef, sceneRef }) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  useEffect(() => {
    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    window.addEventListener("mousemove", onMouseMove);

    const checkIntersections = () => {
      requestAnimationFrame(checkIntersections);
      if (cameraRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(
          sceneRef.current.children,
          true
        );
        if (intersects.length > 0) {
          console.log("Intersected objects:", intersects);
        }
      }
    };
    checkIntersections();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [cameraRef, sceneRef]);

  return null;
}

export default RaycasterControls;
