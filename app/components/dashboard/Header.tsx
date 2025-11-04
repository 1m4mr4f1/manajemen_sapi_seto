'use client';

import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react'; // Ikon untuk mobile nanti

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-white px-4 shadow-sm md:px-8">
      {/* Nanti bisa untuk tombol menu mobile */}
      <div className="md:hidden">
        <Menu />
      </div>

      {/* Judul Halaman (bisa dibuat dinamis nanti) */}
      <div className="hidden md:block">
        <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
      </div>

      {/* Info Pengguna */}
      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700">
          Selamat datang, {session?.user?.name || 'User'}
        </span>
        {/* Placeholder untuk ikon profil */}
        <div className="ml-3 h-8 w-8 rounded-full bg-gray-300"></div>
      </div>
    </header>
  );
}
