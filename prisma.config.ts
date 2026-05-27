import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// Load variables from .env.local first (Next.js standard) then fallback to .env
config({ path: '.env.local' });
config();

const placeholderUrl = 'postgresql://placeholder:placeholder@localhost:5432/placeholder';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // In Prisma 7, this url is used by CLI commands (like migrations).
    // Prefer DIRECT_URL (direct connection) over DATABASE_URL (connection pool).
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || placeholderUrl,
  },
});
