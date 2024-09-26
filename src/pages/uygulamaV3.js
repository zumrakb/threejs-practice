"use client";
import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  onMouseClick,
  onMouseDown,
  onMouseMove,
  onMouseUp,
} from "../components/uygulamaV3/Mouse";

const uygulamaV3 = () => {
  // Referansları ve durumları (state) tanımlıyoruz
  const sceneRef = useRef(null); // Sahne referansı
  const cameraRef = useRef(null); // Kamera referansı
  const rendererRef = useRef(null); // Renderer (çizer) referansı
  const controlsRef = useRef(null); // Kamera kontrolleri (OrbitControls) referansı
  const modelRef = useRef(null); // Yüklenen 3D modelin referansı
  const selectedMeshRef = useRef(null); // Seçilen mesh (3D modelin parçası) referansı
  const usedImagesRef = useRef([]); // Kullanılan resimleri saklayan referans
  const decalMeshesRef = useRef([]); // Decal (çıkartma) meshlerini saklayan referans
  const initialMousePositionRef = useRef({ x: 0, y: 0 }); // Fare ilk konumu referansı
  const [images, setImages] = useState([]); // Yüklenen resimlerin durumu
  const [controlModel, setControlModel] = useState(true); // Model kontrol durumu
  const [selectedImage, setSelectedImage] = useState(null); // Seçilen resmin durumu
  const [windowSize, setWindowSize] = useState({ w: 0, h: 0 }); // Pencere boyutu durumu
  const [selectedColor, setSelectedColor] = useState("#ffffff"); // Seçilen rengin durumu
  const [decalSizeFactor, setDecalSizeFactor] = useState(4000); // decal boyutu için. Başlangıçta 2000 olarak ayarlıyoruz

  // Three.js sahnesini ve bileşenlerini kurmak için kullanılan useEffect
  useEffect(() => {
    // Yeni bir sahne (scene) oluştur ve referansını kaydet
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Perspektif kamera oluştur ve sahnedeki konumunu ayarla
    const camera = new THREE.PerspectiveCamera(
      60, // Görüş açısı (FOV)
      window.innerWidth / window.innerHeight, // Ekran oranı
      0.1, // Yakın kesme düzlemi
      1000 // Uzak kesme düzlemi
    );
    camera.position.set(0, 0, 1.4); // Kamerayı sahneden uzaklaştır
    camera.lookAt(0, 0, 0); // Kameranın bakacağı noktayı ayarla
    cameraRef.current = camera; // Kamera referansını kaydet

    // WebGL renderer (çizer) oluştur ve ekran boyutunu ayarla
    const renderer = new THREE.WebGLRenderer({
      alpha: true, // Arka planın şeffaf olması
      antialias: true, // Kenarların yumuşak görünmesi
      physicallyCorrectLights: true, // Fiziksel olarak doğru ışıklandırma
      powerPreference: "high-performance", // Performans optimizasyonu
    });
    renderer.setSize(window.innerWidth, window.innerHeight); // Renderer boyutunu pencereye göre ayarla

    // Eğer renderer DOM elementine referans varsa, onu ekle
    if (rendererRef.current) {
      rendererRef.current.appendChild(renderer.domElement);
    }

    // OrbitControls (Kamera Kontrolleri) ekle ve ayarlarını yap
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Yumuşatma etkinleştir
    controls.dampingFactor = 0.25; // Yumuşatma oranı
    controlsRef.current = controls; // Kontrollerin referansını kaydet

    // Işıklandırmayı ekle (Ambient ve Directional Light)
    const ambient = new THREE.AmbientLight(0xffffff, 0.7); // Ortam ışığı
    const directLight = new THREE.DirectionalLight(0xffffff, 1); // Yönlü ışık
    directLight.position.set(5, 5, 7.5); // Işığın konumunu ayarla
    scene.add(directLight, ambient); // Işıkları sahneye ekle

    // Pencere boyutunu duruma kaydet
    setWindowSize({ w: window.innerWidth, h: window.innerHeight });

    // GLTFLoader kullanarak 3D modeli yükle
    const loader = new GLTFLoader();
    loader.load(
      "bag.glb", // Yüklenecek modelin dosya yolu
      (gltf) => {
        // Model yüklendiğinde bu fonksiyon çalışır
        const model = gltf.scene; // Modeli sahneden al
        model.position.set(0, 0, 0); // Modelin konumunu ayarla
        scene.add(model); // Modeli sahneye ekle
        modelRef.current = model; // Modelin referansını kaydet

        // Modelin içindeki tüm mesh'leri gez ve seçilen rengi uygula
        model.traverse((child) => {
          if (child.isMesh) {
            child.material.color.set(selectedColor); // Rengi ayarla
            child.material.needsUpdate = true; // Materyali güncelle
          }
        });

        // Daha önce eklenen decal mesh'lerini sahneye geri ekle
        decalMeshesRef.current.forEach((decal) => {
          scene.add(decal);
        });
      },
      undefined, // Yükleme işlemi sırasında bir şey yapılmayacak
      (error) => {
        console.error("GLTF yükleme hatası:", error); // Hata durumunda mesaj yazdır
      }
    );

    // Animasyon döngüsü: Sahneyi sürekli olarak yeniden render eder
    const animate = () => {
      requestAnimationFrame(animate); // Her kare için bu fonksiyonu çağır
      controls.update(); // Kontrolleri güncelle (örn. kamera hareketleri)
      renderer.render(scene, camera); // Sahneyi yeniden çiz
    };

    animate(); // Animasyon döngüsünü başlat

    // Fare olaylarını işleyici fonksiyonlar
    /*   const handleClick = (event) => {
      onMouseClick(
        event,
        camera,
        scene,
        renderer,
        selectedImage,
        usedImagesRef,
        decalMeshesRef,
        selectedMeshRef
      );
    }; */
    const handleClick = (event) => {
      onMouseClick(
        event,
        camera,
        scene,
        renderer,
        selectedImage,
        usedImagesRef,
        decalMeshesRef,
        selectedMeshRef,
        decalSizeFactor // Slider'dan gelen boyut faktörünü burada kullan
      );
    };

    const handleDown = (event) => {
      onMouseDown(
        event,
        camera,
        renderer,
        decalMeshesRef,
        selectedMeshRef,
        initialMousePositionRef
      );
    };

    const handleMove = (event) => {
      onMouseMove(
        event,
        camera,
        renderer,
        scene,
        windowSize,
        selectedMeshRef,
        initialMousePositionRef,
        selectedImage
      );
    };

    const handleUp = (event) => {
      onMouseUp(event, selectedMeshRef);
    };

    // Pencereye fare olaylarını ekle
    window.addEventListener("click", handleClick);
    window.addEventListener("mousedown", handleDown);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);

    // Temizlik işlemleri: Bileşen kapatıldığında çalışır
    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousedown", handleDown);
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      if (rendererRef.current) {
        rendererRef.current.removeChild(renderer.domElement);
      }
    };
  }, [selectedImage]); // Bu efekt, `selectedImage` değiştiğinde yeniden çalışır

  // Kamera kontrolünü kilitleme/açma
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = controlModel; // Kontrolleri aktif/pasif yap
    }
  }, [controlModel]); // Bu efekt, `controlModel` değiştiğinde çalışır

  // Resim dosyalarını yüklemek için kullanılan fonksiyon
  const handleImageChange = (event) => {
    event.preventDefault();
    event.stopPropagation();

    const files = Array.from(event.target.files); // Seçilen dosyaları al
    const imagePromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader(); // Dosya okuyucusu oluştur
        reader.onload = () => {
          resolve(reader.result); // Dosya başarıyla yüklendiğinde sonucu döndür
        };
        reader.onerror = reject; // Hata olursa reddet
        reader.readAsDataURL(file); // Dosyayı URL formatında oku
      });
    });

    // Tüm resim dosyalarını yükle ve durumu güncelle
    Promise.all(imagePromises)
      .then((newImages) =>
        setImages((prevImages) => [...prevImages, ...newImages])
      )
      .catch((error) => console.error("Resim yükleme hatası:", error));
  };

  // Kullanıcı bir resmi seçtiğinde çağrılan fonksiyon
  const handleImageSelect = (image) => {
    setSelectedImage(image); // Seçilen resmi duruma kaydet
  };

  // Renk değişikliğini işleyen fonksiyon
  const handleColorChange = (event) => {
    const newColor = event.target.value; // Seçilen rengi al
    setSelectedColor(newColor); // Durumu güncelle
    if (modelRef.current) {
      // Model mevcutsa, rengi değiştir
      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.color.set(newColor);
          child.material.needsUpdate = true;
        }
      });
    }
  };

  // Bileşenin render ettiği JSX kısmı
  return (
    <div className="flex w-screen h-screen">
      <div
        ref={rendererRef} // Renderer için referans
        className="w-3/4 flex items-center justify-center bg-slate-100 border-r-gray-500 border-r-2"
      />
      <div className="bg-slate-100 p-4 w-1/4 flex flex-col gap-2">
        <div className="w-full border border-slate-300 p-2 rounded-xl">
          <input
            type="file"
            accept="image/*" // Sadece resim dosyalarını kabul et
            multiple // Birden fazla dosya seçimine izin ver
            onChange={handleImageChange} // Dosya değişikliğinde fonksiyonu çağır
          />
        </div>
        <div className="flex flex-col gap-2 p-2 border border-slate-300 rounded-xl">
          <h6 className="text-gray-500 font-semibold">Yüklenen resimler:</h6>
          <div className="flex flex-wrap gap-4">
            {images.map((image, index) => (
              <img
                key={index} // Benzersiz anahtar
                src={image} // Resmin kaynağı
                alt={`Resim ${index + 1}`} // Alternatif metin
                onClick={() => handleImageSelect(image)} // Resme tıklandığında seçme işlemi
                className="rounded-xl"
                style={{
                  height: "200px",
                  border:
                    selectedImage === image
                      ? "2px solid blue" // Seçili resim için mavi kenarlık
                      : "1px solid gray",
                  marginTop: "10px",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <h6>Decal Boyutunu Ayarla: {decalSizeFactor}</h6>{" "}
          {/* Slider değerini göster */}
          <input
            type="range"
            min="4000"
            max="50000"
            value={decalSizeFactor}
            onChange={(e) => setDecalSizeFactor(e.target.value)}
            className="w-full"
          />
        </div>

        <div className="w-full  flex gap-2">
          <button
            className="bg-red-500 text-white font-semibold w-1/2 rounded-xl text-center py-1 hover:bg-black/50"
            onClick={() => setControlModel(false)} // Modeli kilitle
          >
            MODELİ KİLİTLE
          </button>
          <button
            className="bg-green-500 text-white font-semibold w-1/2 rounded-xl text-center py-1 hover:bg-black/50"
            onClick={() => setControlModel(true)} // Modeli aç
          >
            MODELİ AÇ
          </button>
        </div>
        <div className="flex flex-col gap-1">
          <h6>Ürün rengini seç:</h6>
          <select
            value={selectedColor} // Seçili rengi göster
            onChange={handleColorChange} // Renk değişikliğinde çağrılan fonksiyon
            className="bg-gray-600 w-full py-1 rounded-lg px-2 text-white"
          >
            <option value="#ffffff">White</option>
            <option value="#ff0000">Red</option>
            <option value="#00ff00">Green</option>
            <option value="#0000ff">Blue</option>
            <option value="#000000">Black</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default uygulamaV3;
