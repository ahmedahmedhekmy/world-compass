import { createFileRoute } from "@tanstack/react-router";

/**
 * Robots.txt - Allow search engines to crawl public pages but not admin
 */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const baseUrl = process.env.PUBLIC_SITE_URL ?? "";
        const sitemapUrl = baseUrl ? `${baseUrl}/sitemap.xml` : "/sitemap.xml";
        
        const content = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin/",
          "Disallow: /api/",
          "Disallow: /library/",
          "",
          `Sitemap: ${sitemapUrl}`,
        ].join("\n");

        return new Response(content, {
          headers: { "Content-Type": "text/plain", "Cache-Control": "public, max-age=86400" },
        });
      },
    },
  },
});
