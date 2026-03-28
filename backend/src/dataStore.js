import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "..", "data", "db.json");

export async function loadDB() {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function saveDB(db) {
  await fs.writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf-8");
}
