import type { MetadataRoute } from "next";

// Block indexing on the temporary Hostinger domain; set ALLOW_INDEXING=true once swift.in is live.
export default function robots(): MetadataRoute.Robots {
  if (process.env.ALLOW_INDEXING !== "true") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://swift.in";
  return { rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] }, sitemap: `${site}/sitemap.xml` };
}
