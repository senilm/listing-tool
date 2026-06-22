import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The kysely adapter ships Node-targeted CJS that Turbopack can't statically
  // analyze; let Node require it at runtime instead. `better-auth` itself must
  // stay bundled: externalizing it makes `better-auth/react` resolve the
  // node_modules copy of React during SSR instead of Next's vendored React,
  // which breaks every hook call inside it ("Invalid hook call").
  serverExternalPackages: ["@better-auth/kysely-adapter", "kysely"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
