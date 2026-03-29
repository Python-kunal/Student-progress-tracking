import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import os from "os";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORIGINAL_DB_PATH = path.join(__dirname, "..", "data", "db.json");

// On Vercel (production), use /tmp directory which is writable
const isVercel = process.env.VERCEL || process.env.NODE_ENV === "production";
const DB_PATH = isVercel ? path.join(os.tmpdir(), "db.json") : ORIGINAL_DB_PATH;

// Used as a fallback if /tmp file isn't created yet
let inMemoryDB = null;

export async function loadDB() {
  try {
    const raw = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    if (isVercel) {
      if (inMemoryDB) return inMemoryDB;
      // Copy initial DB to /tmp or memory
      try {
        const rawInitial = await fs.readFile(ORIGINAL_DB_PATH, "utf-8");
        inMemoryDB = JSON.parse(rawInitial);
        return inMemoryDB;
      } catch (innerErr) {
        return { learners: [], tasks: [], feedback: [], reminders: [] };
      }
    }
    throw err;
  }
}

export async function saveDB(db) {
  if (isVercel) {
    inMemoryDB = db; // keep in memory for faster access across the same lambda
  }
  await fs.writeFile(DB_PATH, `${JSON.stringify(db, null, 2)}\n`, "utf-8").catch(err => {
    console.error("Failed to write to DB_PATH", err);
  });
}
