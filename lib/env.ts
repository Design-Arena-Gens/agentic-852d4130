import { z } from "zod";

const envSchema = z.object({
  OPENAI_API_KEY: z.string().min(1).optional(),
  VIDEO_GEN_API_URL: z.string().url().optional(),
  VIDEO_GEN_API_KEY: z.string().optional(),
  TIKTOK_ACCESS_TOKEN: z.string().optional(),
  YOUTUBE_CLIENT_ID: z.string().optional(),
  YOUTUBE_CLIENT_SECRET: z.string().optional(),
  YOUTUBE_REFRESH_TOKEN: z.string().optional()
});

const parsed = envSchema.parse({
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  VIDEO_GEN_API_URL: process.env.VIDEO_GEN_API_URL,
  VIDEO_GEN_API_KEY: process.env.VIDEO_GEN_API_KEY,
  TIKTOK_ACCESS_TOKEN: process.env.TIKTOK_ACCESS_TOKEN,
  YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID,
  YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET,
  YOUTUBE_REFRESH_TOKEN: process.env.YOUTUBE_REFRESH_TOKEN
});

export const env = parsed;
