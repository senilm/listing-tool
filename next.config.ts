import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Better Auth (and its kysely adapter) ship Node-targeted CJS that Turbopack
  // can't statically analyze; let Node require them at runtime instead.
  serverExternalPackages: ["better-auth", "@better-auth/kysely-adapter", "kysely"],
};

export default nextConfig;
