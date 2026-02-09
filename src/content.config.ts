import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    categories: z.union([z.string(), z.array(z.string())]).nullable().optional(),
    summary: z.string().nullable().optional(),
    updated: z.coerce.date().nullable().optional(),
    layout: z.string().nullable().optional(),
    tags: z.union([z.string(), z.array(z.string())]).nullable().optional(),
    toc: z.boolean().nullable().optional(),
    public: z.boolean().nullable().optional(),
    parent: z.string().nullable().optional(),
    parenttitle: z.string().nullable().optional(),
    latex: z.boolean().nullable().optional(),
    comment: z.boolean().nullable().optional(),
    comments: z.boolean().nullable().optional(),
    category: z.union([z.string(), z.array(z.string())]).nullable().optional(),
    evolution: z.string().nullable().optional(),
  }),
});

const news = defineCollection({
  loader: glob({ pattern: "**/*.html", base: "./src/content/news" }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    subtitle: z.string().optional(),
    categories: z.array(z.string()).optional(),
    summary: z.string().optional(),
  }),
});

export const collections = { blog, news };
