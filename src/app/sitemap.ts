import type { MetadataRoute } from "next";

const PUBLIC_ROUTES = [
  "/",
  "/play",
  "/learn",
  "/puzzles",
  "/puzzles/daily",
  "/profile",
  "/social",
  "/login",
  "/signup",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://dead-and-injured.app";
  const lastModified = new Date();
  return PUBLIC_ROUTES.map((path) => ({
    url: `${base}${path}`,
    lastModified,
    changeFrequency: path === "/puzzles/daily" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
