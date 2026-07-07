import { defineCollection, z } from "astro:content";

// Beats used to tag and filter Work-page items. Keep in sync with the
// `beat` select options in keystatic.config.ts. Ordered by prominence —
// this is the filter-chip order on the Work page.
export const BEATS = [
  "Foreign affairs",
  "Infrastructure",
  "Politics",
  "Transport",
  "Defence",
  "General",
] as const;

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    draft: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// "Now" — curated BusinessDesk reporting shown on the Work page.
const work = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    beat: z.enum(BEATS),
    date: z.coerce.date(),
  }),
});

// "Before" — earlier reporting at The Post & Stuff.
const politics = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    beat: z.enum(BEATS),
    outlet: z.enum(["The Post", "Stuff"]),
    date: z.coerce.date(),
  }),
});

export const collections = { blog, work, politics };
