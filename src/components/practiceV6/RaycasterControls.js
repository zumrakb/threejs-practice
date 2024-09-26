import React, { useEffect, useState } from "react";
import * as THREE from "three";

function RaycasterControls({ cameraRef, sceneRef }) {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const [previousIntersects, setPreviousIntersects] = useState([]);

  useEffect(() => {
    let mouseMoved = false;

    const onMouseMove = (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
      mouseMoved = true; // Fare hareketi olduğunda işaretleyelim
    };

    window.addEventListener("mousemove", onMouseMove);

    const checkIntersections = () => {
      requestAnimationFrame(checkIntersections);

      // Sadece fare hareket ettiyse raycaster işlemini gerçekleştir
      if (mouseMoved && cameraRef.current) {
        raycaster.setFromCamera(mouse, cameraRef.current);
        const intersects = raycaster.intersectObjects(
          sceneRef.current.children,
          true
        );

        // Yeni kesişim varsa ve daha öncekiyle aynı değilse
        if (intersects.length > 0 && intersects !== previousIntersects) {
          console.log("Intersected objects:", intersects);
          setPreviousIntersects(intersects); // Önceki kesişimi güncelle
        }

        mouseMoved = false; // Fare hareketi işlendikten sonra sıfırlayın
      }
    };

    checkIntersections();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [cameraRef, sceneRef, previousIntersects]);

  return null;
}

export default RaycasterControls;
