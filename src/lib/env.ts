import { z } from "zod";

const DEV_DEFAULT_API_BASE = "http://localhost:8000/api/v1";
const isProduction = process.env.NODE_ENV === "production";

const urlField = (name: string) =>
  isProduction
    ? z.string({ required_error: `${name} is required in production.` }).url(`${name} must be a valid URL.`)
    : z.string().url().default(DEV_DEFAULT_API_BASE);

const ServerEnvSchema = z.object({
  API_BASE_URL_INTERNAL: urlField("API_BASE_URL_INTERNAL"),
  NEXT_PUBLIC_API_BASE_URL: urlField("NEXT_PUBLIC_API_BASE_URL"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: urlField("NEXT_PUBLIC_API_BASE_URL"),
});

export type ServerEnv = z.infer<typeof ServerEnvSchema>;
export type ClientEnv = { NEXT_PUBLIC_API_BASE_URL: string; API_BASE_URL_INTERNAL: string };

let cachedServer: ServerEnv | null = null;
let cachedClient: ClientEnv | null = null;

function format(error: z.ZodError) {
  return error.errors
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
}

export function getEnv(): ServerEnv | ClientEnv {
  if (typeof window === "undefined") {
    if (!cachedServer) {
      const parsed = ServerEnvSchema.safeParse({
        API_BASE_URL_INTERNAL: process.env.API_BASE_URL_INTERNAL,
        NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
        NODE_ENV: process.env.NODE_ENV,
      });
      if (!parsed.success) {
        throw new Error(`Invalid server environment variables — ${format(parsed.error)}`);
      }
      cachedServer = parsed.data;
    }
    return cachedServer;
  }

  if (!cachedClient) {
    const parsed = ClientEnvSchema.safeParse({
      NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    });
    if (!parsed.success) {
      throw new Error(`Invalid client environment variables — ${format(parsed.error)}`);
    }
    cachedClient = {
      NEXT_PUBLIC_API_BASE_URL: parsed.data.NEXT_PUBLIC_API_BASE_URL,
      API_BASE_URL_INTERNAL: parsed.data.NEXT_PUBLIC_API_BASE_URL,
    };
  }
  return cachedClient;
}
