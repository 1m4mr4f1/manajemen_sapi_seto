'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
  Warehouse,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
} from 'lucide-react';

// Daftar menu
const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/products', icon: Package, label: 'Produk' },
  { href: '/dashboard/sales', icon: ShoppingCart, label: 'Penjualan' },
  { href: '/dashboard/purchases', icon: Warehouse, label: 'Pembelian' },
  { href: '/dashboard/suppliers', icon: Users, label: 'Suppliers' },
  { href: '/dashboard/customers', icon: Users, label: 'Pelanggan' },
  { href: '/dashboard/reports', icon: TrendingUp, label: 'Laporan' },
  { href: '/dashboard/expenses', icon: DollarSign, label: 'Pengeluaran' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col bg-gray-900 text-white shadow-lg">
      <div className="p-4 text-center text-2xl font-bold text-white shadow-md">
        Sapi Seto
      </div>
      <nav className="flex-1 space-y-2 overflow-y-auto p-4">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`
              group flex items-center rounded-md px-4 py-2 text-sm font-medium
              ${
                pathname === item.href
                  ? 'bg-blue-600 text-white' // Aktif
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white' // Tidak Aktif
              }
              transition-colors duration-150
            `}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="p-4">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="
            group flex w-full items-center rounded-md px-4 py-2 text-sm font-medium
            text-gray-300 hover:bg-red-700 hover:text-white
            transition-colors duration-150
          "
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
