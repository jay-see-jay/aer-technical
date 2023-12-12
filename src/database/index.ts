import { Client, createClient, ResultSet } from "@libsql/client";

export type BatchStatement = {
  sql: string;
  args: (number | string | null)[];
};

class Database {
  private client: Client;

  constructor() {
    this.client = createClient({
      url: "file:src/database/aer_exercise_db.sqlite",
    });
  }

  async run(statement: string) {
    await this.client.executeMultiple(statement);
  }

  async read(statement: string): Promise<ResultSet> {
    return this.client.execute(statement);
  }

  async insertBatch(statements: BatchStatement[]): Promise<ResultSet[]> {
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
