import type { NextConfig } from "next";

// Baked into the client bundle at build time. Compared at runtime against
// /api/version so the app can detect a new deployment and reload itself —
// crucial for the iPhone home-screen shortcut, which iOS otherwise keeps
// showing a stale cached build of indefinitely.
const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_ID: String(Date.now()),
  },
};

export default nextConfig;
