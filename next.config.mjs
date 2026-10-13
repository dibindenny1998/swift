/** @type {import("next").NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Tailwind CSS is small (~16 KB); inlining removes a render-blocking request for first-time visitors.
  experimental: {
    inlineCss: true,
    // Shared hosts cap MySQL connections per user; one build worker per CPU (63 on Hostinger) would exhaust them.
    ...(process.env.BUILD_CPUS ? { cpus: Number(process.env.BUILD_CPUS) } : {}),
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

// webpack (used by `npm run build:hosted`) names browser chunks after their route, e.g. app/(store)/products/[slug]/page-….js.
// Proxies and CDNs re-encode "(", ")", "[" and "]" in different ways and the file then 404s, so use plain ids instead.
nextConfig.webpack = (config, { isServer, dev }) => {
  if (!isServer && !dev) {
    const filename = config.output.filename;
    config.output.filename = (pathData) =>
      pathData.chunk?.name?.startsWith("app/") ? "static/chunks/app-[id]-[contenthash].js"
        : typeof filename === "function" ? filename(pathData) : filename;
    config.output.chunkFilename = "static/chunks/[id]-[contenthash].js";
  }
  return config;
};

export default nextConfig;
