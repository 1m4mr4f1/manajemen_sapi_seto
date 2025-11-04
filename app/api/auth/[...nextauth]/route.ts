import NextAuth, { AuthOptions } from 'next-auth'; // <-- 1. AuthOptions ditambahkan di sini
import CredentialsProvider from 'next-auth/providers/credentials';

import prisma from '@/app/lib/prisma';
import * as bcrypt from 'bcrypt';

// 2. Tipe 'AuthOptions' ditambahkan di sini
export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      // Ini adalah fungsi yang dijalankan saat Anda mencoba login
      async authorize(credentials) {
        if (!credentials) {
          return null;
        }

        // 1. Cari user di database
        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        });

        if (!user) {
          // Tidak ada user dengan username itu
          return null;
        }

        // 2. Bandingkan password yang di-hash
        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          // Password salah
          return null;
        }

        // 3. Jika berhasil, kembalikan data user
        return {
          id: user.id.toString(), // ID harus string
          name: user.name,
          username: user.username,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt', // Kita pakai JSON Web Tokens
  },
  pages: {
    signIn: '/', // Halaman login kita ada di "/"
  },
  // Callback untuk menambahkan data custom (seperti 'role') ke token
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

