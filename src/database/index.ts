import { Client, createClient, InStatement, ResultSet } from "@libsql/client";
import { IDatabase } from "./types";

class Database implements IDatabase {
  private client: Client;

  constructor() {
    this.client = createClient({
      url: "file:src/database/aer_exercise_db.sqlite",
    });
  }

  async run(statement: string) {
    await this.client.executeMultiple(statement);
  }

  async read(statement: InStatement): Promise<ResultSet> {
    return this.client.execute(statement);
  }

  async insertBatch(statements: InStatement[]): Promise<ResultSet[]> {
    return this.client.batch(statements, "write");
  }

  async isPopulated(): Promise<boolean> {
    const statement = "SELECT name FROM sqlite_master WHERE type='table'";
    const result = await this.read(statement);
    const requiredTables = ["company", "employee"];
    const tables = result.rows.map((row) => row["name"]);
    if (tables.length != requiredTables.length) {
      return false;
    }

    for (let i = 0; i < requiredTables.length; i++) {
      if (!tables.includes(requiredTables[i])) {
        return false;
      }
    }
    return true;
  }
}

const database = new Database();

export default database;
