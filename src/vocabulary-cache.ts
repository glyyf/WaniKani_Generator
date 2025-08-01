import Database from 'better-sqlite3';
import { VocabularyItem } from './wanikani-api.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class VocabularyCache {
  private db: Database.Database;

  constructor() {
    const dbPath = path.join(__dirname, '..', 'vocabulary.db');
    this.db = new Database(dbPath);
    this.initializeDatabase();
  }

  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS vocabulary (
        id INTEGER PRIMARY KEY,
        characters TEXT NOT NULL,
        meanings TEXT NOT NULL,
        readings TEXT NOT NULL,
        level INTEGER NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS cache_metadata (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  isStale(): boolean {
    const lastUpdate = this.db
      .prepare('SELECT value FROM cache_metadata WHERE key = ?')
      .get('last_update');

    if (!lastUpdate) return true;

    const lastUpdateTime = new Date(lastUpdate.value);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdateTime.getTime()) / (1000 * 60 * 60);

    return hoursSinceUpdate >= 24; // Stale after 24 hours
  }

  getCachedVocabulary(): VocabularyItem[] {
    const rows = this.db
      .prepare('SELECT * FROM vocabulary ORDER BY level, characters')
      .all();

    return rows.map((row: any) => ({
      id: row.id,
      characters: row.characters,
      meanings: JSON.parse(row.meanings),
      readings: JSON.parse(row.readings),
      level: row.level
    }));
  }

  updateCache(vocabulary: VocabularyItem[]): void {
    console.log('Updating vocabulary cache...');
    
    // Begin transaction
    const insertVocab = this.db.prepare(`
      INSERT OR REPLACE INTO vocabulary (id, characters, meanings, readings, level)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    const updateMetadata = this.db.prepare(`
      INSERT OR REPLACE INTO cache_metadata (key, value, updated_at)
      VALUES (?, ?, CURRENT_TIMESTAMP)
    `);

    this.db.transaction(() => {
      // Clear existing vocabulary
      this.db.prepare('DELETE FROM vocabulary').run();
      
      // Insert new vocabulary
      for (const item of vocabulary) {
        insertVocab.run(
          item.id,
          item.characters,
          JSON.stringify(item.meanings),
          JSON.stringify(item.readings),
          item.level
        );
      }
      
      // Update last update timestamp
      updateMetadata.run('last_update', new Date().toISOString());
    })();

    console.log(`Cached ${vocabulary.length} vocabulary items`);
  }

  getCacheInfo(): { count: number; lastUpdate: string | null } {
    const count = this.db.prepare('SELECT COUNT(*) as count FROM vocabulary').get() as { count: number };
    
    const lastUpdate = this.db
      .prepare('SELECT value FROM cache_metadata WHERE key = ?')
      .get('last_update');

    return {
      count: count.count,
      lastUpdate: lastUpdate ? lastUpdate.value : null
    };
  }

  close(): void {
    this.db.close();
  }
}