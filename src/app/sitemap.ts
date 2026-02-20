import type { MetadataRoute } from "next";

const base = "https://unionrig.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: base, lastModified: new Date(), changeFrequency: "monthly", priority: 1 },
    { url: `${base}/technical`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/learn`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/labs`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${base}/community`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];
}
