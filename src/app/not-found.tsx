import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#0a0a1a] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
          404
        </h1>
        <h2 className="mt-6 text-2xl md:text-3xl font-bold text-white">Page Not Found</h2>
        <p className="mt-4 text-gray-400 max-w-md mx-auto">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link href="/">
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring h-9 mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white px-8 py-3 rounded-xl shadow-lg shadow-purple-500/25 transition-all duration-300 hover:scale-105">
            Go Home
          </button>
        </Link>
      </div>
    </main>
  );
}
