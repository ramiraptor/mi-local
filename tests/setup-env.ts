import { config } from "dotenv";
import path from "node:path";

// Carga .env.local (entorno local de Supabase) para las pruebas de integración
config({ path: path.resolve(__dirname, "..", ".env.local") });
