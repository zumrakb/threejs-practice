import Image from "next/image";
import { Inter } from "next/font/google";
import ThreeScene from "../components/ThreeScene"; // Import the Three.js component
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-between max-w-7xl mx-auto min-h-screen">
      <Link href={"/three"} className="bg-red-500 p-3 rounded-xl">
        3d sahneyi görmek için tıkla.
      </Link>
      <Link href={"/shapes"} className="bg-red-500 p-3 rounded-xl">
        farklı şekilleri görmek için tıkla
      </Link>
      <Link href={"/upload3d"} className="bg-red-500 p-3 rounded-xl">
        3d model yükle
      </Link>
    </main>
  );
}
