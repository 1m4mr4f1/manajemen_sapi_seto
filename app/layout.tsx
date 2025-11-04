import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import AuthProvider from './AuthProvider'; // 1. Impor AuthProvider

const inter = Inter({ subsets: ['latin'] });

// Metadata ini akan muncul di tab browser Anda
export const metadata: Metadata = {
  title: 'Manajemen Sapi Seto',
  description: 'Sistem Manajemen Toko Daging Sapi Seto',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 2. Bungkus {children} dengan AuthProvider */}
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
