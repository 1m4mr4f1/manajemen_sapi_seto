// File: middleware.ts (di root folder)

export { default } from "next-auth/middleware"

// Tentukan halaman mana yang ingin Anda lindungi
export const config = { 
  matcher: [
    "/dashboard/:path*", // Melindungi semua rute di bawah /dashboard
  ] 
};