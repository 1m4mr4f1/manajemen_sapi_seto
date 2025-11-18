import { withAuth } from "next-auth/middleware";

// Gunakan export default function secara eksplisit
export default withAuth({
  // Halaman login (jika user belum login akan dilempar ke sini)
  pages: {
    signIn: "/login",
  },
});

// Konfigurasi matcher
export const config = {
  matcher: [
    "/dashboard/:path*", 
  ],
};