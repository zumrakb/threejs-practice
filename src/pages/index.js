import Image from "next/image";
import { Inter } from "next/font/google";
import ThreeScene from "../components/ThreeScene"; // Import the Three.js component
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-wrap items-center justify-between max-w-7xl mx-auto min-h-screen ">
      <Link
        href={"/three"}
        className="bg-orange-500 text-white font-semibold hover:bg-orange-200 p-3 rounded-xl"
      >
        3d sahne - TEXT ekle,sil,update
      </Link>
      <Link
        href={"/shapes"}
        className="bg-orange-500 text-white font-semibold hover:bg-orange-200 p-3 rounded-xl"
      >
        farklı şekilleri görmek için tıkla
      </Link>
      <Link
        href={"/upload3d"}
        className="bg-orange-500 text-white font-semibold hover:bg-orange-200 p-3 rounded-xl"
      >
        3d model yükle
      </Link>
      <Link
        href={"/adjustPics"}
        className="bg-orange-500 text-white font-semibold hover:bg-orange-200 p-3 rounded-xl"
      >
        3d sahne - TEXTURE düzenlemeleri
      </Link>
      <Link
        href={"/adjustPicsDecal"}
        className="bg-orange-500 text-white font-semibold hover:bg-orange-200 p-3 rounded-xl"
      >
        3d sahne - DECAL düzenlemeleri
      </Link>
      <Link
        href={"/uygulama"}
        className="bg-orange-500 text-white font-bold hover:bg-orange-200 p-3 rounded-xl mx-auto"
      >
        KAPSAMLI UYGULAMA GÖREVİ
      </Link>
      <Link
        href={"/uygulamaV2"}
        className="bg-orange-500 text-white font-bold hover:bg-orange-200 p-3 rounded-xl mx-auto"
      >
        KAPSAMLI UYGULAMA GÖREVİ - V 2
      </Link>
    </main>
  );
}
