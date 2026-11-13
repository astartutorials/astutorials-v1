import type { MetadataRoute } from "next";
import { PLAYBOOKS, playbookHref } from "@/lib/playbooks";
import { INTAKE_LEVELS, intakeHref } from "@/lib/intakes";

const BASE_URL = "https://astartutorials.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: BASE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/tutorials`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/preclinicals`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/semester-plan`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/semester-plan/parents`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/ambassador`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/tfa`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bucc`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/bucc/advantage`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...INTAKE_LEVELS.map((level) => ({
      url: `${BASE_URL}${intakeHref(level)}`,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...PLAYBOOKS.map((p) => ({
      url: `${BASE_URL}${playbookHref(p.slug)}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/apply`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/careers`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    ...["/privacy", "/terms", "/refund-policy"].map((path) => ({
      url: `${BASE_URL}${path}`,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
