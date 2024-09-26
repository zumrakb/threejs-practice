import Image from "next/image";
import { Inter } from "next/font/google";

import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-start gap-4 w-screen p-4 h-screen py-4">
      <div className="w-1/2 h-fit flex flex-col  gap-2 items-start">
        <Link
          href={"/practiceV1"}
          className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2  rounded-xl w-44"
        >
          PRACTICE - V1
        </Link>
        <p className="text-gray-500  text-sm pl-1">
          PracticeV1: Add text or texture (image) to the 3d shape. Learn;
          DragControls, FontLoader, TextGeometry, cannon-es (fizik motoru),
          TextureLoader
        </p>
      </div>
      <div className="w-1/2 h-fit flex flex-col  gap-2 items-start">
        <Link
          href={"/practiceV2"}
          className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2  rounded-xl w-44"
        >
          PRACTICE V2
        </Link>

        <p className="text-gray-500  text-sm pl-1">
          PracticeV2: See different shapes of THREE JS and CANNON-ES library
          (physics world). Each shape has different type of gravity and shadows.
        </p>
      </div>
      <div className="w-1/2 h-fit flex flex-col  gap-2 items-start">
        <Link
          href={"/practiceV3"}
          className="bg-orange-500 text-white font-bold hover:bg-orange-200 text-center py-2  rounded-xl w-44"
        >
          PRACTICE V3
        </Link>
        <p className="text-gray-500  text-sm pl-1">
          PracticeV3: See different shapes of THREE JS and CANNON-ES library
          (physics world). Each shape has different type of gravity and shadows.
        </p>
      </div>
      <Link
        href={"/adjustPics"}
        className="border border-gray-200 text-orange-500 font-semibold hover:bg-orange-500  hover:text-white p-3 rounded-xl"
      >
        3d sahne - TEXTURE düzenlemeleri
      </Link>
      <Link
        href={"/adjustPicsDecal"}
        className="border border-gray-200 text-orange-500 font-semibold hover:bg-orange-500  hover:text-white p-3 rounded-xl"
      >
        3d sahne - DECAL düzenlemeleri
      </Link>

      <Link
        href={"/uygulama"}
        className="bg-orange-500 text-white font-bold hover:bg-orange-200 p-3 rounded-xl "
      >
        görev deneme v1
      </Link>
      <Link
        href={"/uygulamaV2"}
        className="bg-orange-500 text-white font-bold hover:bg-orange-200 p-3 rounded-xl "
      >
        KAPSAMLI UYGULAMA GÖREVİ - V 2
      </Link>
      <Link
        href={"/uygulamaV3"}
        className="bg-orange-500 text-white font-bold hover:bg-orange-200 p-3 rounded-xl "
      >
        KAPSAMLI UYGULAMA GÖREVİ - V 3
      </Link>
    </main>
  );
}
