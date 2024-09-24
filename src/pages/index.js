import Image from "next/image";
import { Inter } from "next/font/google";
import ThreeScene from "../components/ThreeScene"; // Import the Three.js component
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-start gap-4 max-w-7xl mx-auto min-h-screen py-4">
      <h1 className="font-bold text-lg text-blue-500  border-b border-b-gray-200 pb-4">
        AŞAĞIDAKİ BUTONLARA TIKLAYIP İLGİLİ SAYFAYA GİDEBİLİRSİNİZ.
      </h1>
      <div className="flex flex-col gap-3 border-b border-b-gray-500 pb-4">
        <p className="text-gray-600 font-bold">
          BAŞLANGIÇ İÇİN DENEME DOSYALARI:
        </p>
        <div className="flex gap-4">
          <Link
            href={"/three"}
            className="border border-gray-200 text-orange-500 font-semibold hover:bg-orange-500  hover:text-white p-3 rounded-xl"
          >
            3d sahne - TEXT ekle,sil,update
          </Link>
          <Link
            href={"/shapes"}
            className="border border-gray-200 text-orange-500 font-semibold hover:bg-orange-500  hover:text-white p-3 rounded-xl"
          >
            farklı şekilleri görmek için tıkla
          </Link>
          <Link
            href={"/upload3d"}
            className="border border-gray-200 text-orange-500 font-semibold hover:bg-orange-500  hover:text-white p-3 rounded-xl"
          >
            3d model yükle
          </Link>
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
        </div>
      </div>

      {/* UYGULAMA VERSİYONLARI */}
      <div className="flex flex-col gap-2 border-b border-b-gray-500 pb-4">
        <p className="text-gray-600 font-bold">
          ÖĞRENİLENLERİN UYGULANDIĞI UYGULAMA DOSYALARI:
        </p>
        <p className="text-gray-500 font-semibold text-sm">
          V2: Burada texture ekleme ve metin ekleme işlemlerinin kombine
          edilmesi ile beraber 3d modelin üzerine yapıştırılması pratikleri yer
          almaktadır
        </p>
        <p className="text-gray-500 font-semibold text-sm">
          V3: Burada, V2'deki özelliklere ek olarak sürükleme + boyutlandırma
          özellikleri eklenecek.
        </p>
        <div className="flex gap-4 items-start">
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
        </div>
      </div>
    </main>
  );
}
