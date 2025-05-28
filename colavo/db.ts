import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Edge runtime doesn't support dotenv config or filesystem
// Environment variables need to be pre-loaded via Next.js config
const sql = neon(process.env.DATABASE_URL!);

// Create the database instance with schema for Better Auth compatibility
export const db = drizzle(sql, { schema });
