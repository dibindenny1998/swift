/** @type {import("next").NextConfig} */
const nextConfig = {
  cacheComponents: true,
  // Tailwind CSS is small (~16 KB); inlining removes a render-blocking request for first-time visitors.
  experimental: { inlineCss: true },
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

export default nextConfig;
