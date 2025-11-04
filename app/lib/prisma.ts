import { PrismaClient } from '@prisma/client';

// Ini adalah praktik terbaik di Next.js
// untuk mencegah koneksi berlebih di mode development

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;
