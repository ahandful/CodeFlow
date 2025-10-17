import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export class Database {
  private static db: sqlite3.Database;

  static initialize() {
    this.db = new sqlite3.Database('./database.sqlite');
    this.createTables();
  }

  private static createTables() {
    const createRepositoriesTable = `
      CREATE TABLE IF NOT EXISTS repositories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        url TEXT NOT NULL UNIQUE,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createReviewsTable = `
      CREATE TABLE IF NOT EXISTS reviews (
        id TEXT PRIMARY KEY,
        repository_id TEXT NOT NULL,
        start_date TEXT NOT NULL,
        end_date TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (repository_id) REFERENCES repositories (id)
      )
    `;

    const createReviewReportsTable = `
      CREATE TABLE IF NOT EXISTS review_reports (
        id TEXT PRIMARY KEY,
        review_id TEXT NOT NULL,
        total_commits INTEGER DEFAULT 0,
        total_files_changed INTEGER DEFAULT 0,
        total_lines_added INTEGER DEFAULT 0,
        total_lines_deleted INTEGER DEFAULT 0,
        report_data TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES reviews (id)
      )
    `;

    this.db.run(createRepositoriesTable);
    this.db.run(createReviewsTable);
    this.db.run(createReviewReportsTable);
  }

  static getDb(): sqlite3.Database {
    return this.db;
  }

  static async run(sql: string, params: any[] = []): Promise<sqlite3.RunResult> {
    const run = promisify(this.db.run.bind(this.db));
    return run(sql, params);
  }

  static async get(sql: string, params: any[] = []): Promise<any> {
    const get = promisify(this.db.get.bind(this.db));
    return get(sql, params);
  }

  static async all(sql: string, params: any[] = []): Promise<any[]> {
    const all = promisify(this.db.all.bind(this.db));
    return all(sql, params);
  }

  static close() {
    if (this.db) {
      this.db.close();
    }
  }
}
