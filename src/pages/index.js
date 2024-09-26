import Link from "next/link";

export default function Home() {
  return (
    <div className="w-screen flex">
      {/* İLK 5 BUTON BURADA */}
      <div className="flex flex-col h-screen gap-5 p-4 py-4 w-1/2">
        <div className="w-full h-fit flex flex-col gap-2 items-start">
          <Link
            href={"/practiceV1"}
            className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2 rounded-xl w-44"
          >
            PRACTICE - V1
          </Link>
          <p className="text-gray-500 text-sm pl-1">
            PracticeV1: Add text or texture (image) to the 3d shape. Learn;
            DragControls, FontLoader, TextGeometry, cannon-es (fizik motoru),
            TextureLoader (Metin veya doku eklemeyi öğrenin; DragControls,
            FontLoader, TextGeometry, cannon-es, TextureLoader)
          </p>
        </div>
        <div className="w-full h-fit flex flex-col gap-2 items-start">
          <Link
            href={"/practiceV2"}
            className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2 rounded-xl w-44"
          >
            PRACTICE V2
          </Link>
          <p className="text-gray-500 text-sm pl-1">
            PracticeV2: See different shapes of THREE JS and CANNON-ES library
            (physics world). Each shape has different type of gravity and
            shadows. (THREE JS ve CANNON-ES kütüphanesi ile farklı şekilleri
            görün. Her şeklin farklı bir yerçekimi ve gölge türü vardır.)
          </p>
        </div>
        <div className="w-full h-fit flex flex-col gap-2 items-start">
          <Link
            href={"/practiceV3"}
            className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2 rounded-xl w-44"
          >
            PRACTICE V3
          </Link>
          <p className="text-gray-500 text-sm pl-1">
            PracticeV3: See different shapes of THREE JS and CANNON-ES library
            (physics world). Each shape has different type of gravity and
            shadows. (THREE JS ve CANNON-ES kütüphanesi ile farklı şekilleri
            görün. Her şeklin farklı bir yerçekimi ve gölge türü vardır.)
          </p>
        </div>

        <div className="w-full h-fit flex flex-col gap-2 items-start">
          <Link
            href={"/adjustPics"}
            className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2 rounded-xl w-44"
          >
            PRACTICE V4
          </Link>
          <p className="text-gray-500 text-sm pl-1">
            PracticeV4: Add texture to the cube. Wrap modes: repeat, clamp to
            edge, mirrored repeat. Repeat X or Y axis. (Küp üzerine doku
            ekleyin. Kaplama modları: tekrar, kenara sabitle, yansıtılmış
            tekrar. X veya Y eksenini tekrarlayın.)
          </p>
        </div>

        <div className="w-full h-fit flex flex-col gap-2 items-start">
          <Link
            href={"/adjustPicsDecal"}
            className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2 rounded-xl w-44"
          >
            PRACTICE V5
          </Link>
          <p className="text-gray-500 text-sm pl-1">
            PracticeV5: Add texture to the cube. Wrap modes: repeat, clamp to
            edge, mirrored repeat. Repeat X or Y axis. (Küp üzerine doku
            ekleyin. Kaplama modları: tekrar, kenara sabitle, yansıtılmış
            tekrar. X veya Y eksenini tekrarlayın.)
          </p>
        </div>
      </div>
      {/* İLK 5 BUTONDAN SONRAKİ PRATİKLER AŞAĞIDA YER ALACAK */}
      <div className="flex flex-col h-screen gap-5 p-4 py-4 w-1/2">
        <div className="w-full h-fit flex flex-col gap-2 items-start">
          <Link
            href={"/practiceV6"}
            className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2 rounded-xl w-44"
          >
            PRACTICE V6
          </Link>
          <p className="text-gray-500 text-sm pl-1">
            PracticeV6: Adding Texture. Uploading GLB file (GLTFLoader).
            Choosing the surface from 3d bag and paste the texture on it. Adding
            text. By combining, TEXTURE and TEXT in canvas, add them to the 3d
            model. (Doku ekleme. GLB dosyasını yükleme. 3D çantadan yüzey seçme
            ve dokuyu üzerine yapıştırma. Metin ekleme. Dokuyu ve metni tuvalde
            birleştirerek 3D modele ekleme.)
          </p>
        </div>
        <div className="w-full h-fit flex flex-col gap-2 items-start">
          <Link
            href={"/practiceV7"}
            className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2 rounded-xl w-44"
          >
            PRACTICE V7
          </Link>
          <p className="text-gray-500 text-sm pl-1">
            PracticeV7: DECAL controls. Add decal to 3d model. Choose color of
            the model. Lock/unlock the model. Adjust decal size. (DECAL
            kontrolleri. 3D modele decal ekleme. Modelin rengini seçme. Modeli
            kilitleme/kilidi açma. Decal boyutunu ayarlama.)
          </p>
        </div>
      </div>
    </div>
  );
}
