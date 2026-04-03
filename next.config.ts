import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita que Next use otro package-lock.json (p. ej. en el home) como raíz del proyecto
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
