import Sidebar from '@/app/components/dashboard/Sidebar';
import Header from '@/app/components/dashboard/Header';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-100">
      {/* Sidebar (Fixed) */}
      <Sidebar />

      {/* Area Konten (Header + Main + Footer) */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* Header (Sticky) */}
        <Header />

        {/* Konten Utama (Bisa di-scroll) */}
        <main className="flex-1 overflow-x-hidden bg-gray-100 p-6 md:p-8">
          {children}
        </main>

        {/* Footer Sederhana */}
        <footer className="border-t bg-white p-4 text-center text-sm text-gray-500">
          © 2024 Sistem Manajemen Sapi Seto. Dibuat dengan ❤️.
        </footer>
      </div>
    </div>
  );
}
