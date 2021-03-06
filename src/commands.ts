import { exec } from "child_process";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import path from "path"
import pg from "pg"
export const backupPostgresFunctions = async (
  connectionString: string,
  filename: string
) => {
  try {
    const query = `
      SELECT pg_get_functiondef(f.oid) as function_text 
      FROM pg_catalog.pg_proc f 
      INNER JOIN pg_catalog.pg_namespace n 
      ON (f.pronamespace = n.oid) 
      WHERE n.nspname = 'public'
      order by pg_get_functiondef(f.oid);
    `
    const client = new pg.Client({
      connectionString
    })
    await client.connect()
    const { rows } = await client.query<{ function_text: string }>(query)
    const text = rows.map(row => row.function_text).join("\r\n\r\n")
    createDirectoryIfNotExists(path.join(process.cwd(), "output"))
    writeFileSync(path.join(process.cwd(), "output", `functions-${filename}.sql`), text)
  } catch (e) {
    console.log("Error: ", e)
  }
};

export const backupPostgresTables = async (
  connectionString: string,
  filename: string
) => {
  try {
    const query = `
    SELECT table_name FROM information_schema.tables WHERE table_schema='public' order by table_name;
    `
    const client = new pg.Client({
      connectionString
    })
    await client.connect()
    const { rows } = await client.query<{ table_name: string }>(query)
    const tables = rows.map(row => row.table_name)
    createDirectoryIfNotExists(path.join(process.cwd(), "output"))
    const destinationFilePath = path.join(process.cwd(), "output", `tables-${filename}.sql`)
    const args = [
      connectionString,
      ...tables.map(t => `-t '\"${t}\"'`),
      `--schema-only`,
      `-f ${destinationFilePath}`
    ]
    await executeCommand("pg_dump", args)
  } catch (e) {
    console.log("Error: ", e)
  }
};

export const executeCommand = (
  command: string,
  args: string[]
): Promise<void> => {
  return new Promise<void>((resolve, reject) => {
    const spawnedCmd = exec(`${command} ${args.join(" ")}`);
    spawnedCmd.on("exit", () => {
      resolve()
    });
  });
};

export const createDirectoryIfNotExists = (dir: string) => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}


