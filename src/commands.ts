import { exec, spawn } from "child_process";
import { writeFileSync } from "fs";
import path from "path"
import pg from "pg"
import { Promesify } from "js-promesify"
import { parse } from "pg-connection-string"
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
    writeFileSync(path.join(process.cwd(), "output", `functions-${filename}.sql`), text)
  } catch (e) {
    console.log("Error: ", e)
  }

};

const wait = (time: number) => new Promise((resolve) => {
  setTimeout(resolve, time * 1000)
})

export const backupPostgresTables = async (
  connectionString: string,
  filename: string
) => {
  try {
    const query = `
    SELECT table_name FROM information_schema.tables WHERE table_schema='public';
    `
    const client = new pg.Client({
      connectionString
    })
    await client.connect()
    const connectionParams = parse(connectionString)

    const { rows } = await client.query<{ table_name: string }>(query)
    const tables = rows.map(row => row.table_name)
    const destinationFilePath = path.join(process.cwd(), "output", `tables-${filename}.sql`)
    const extraEnv ={
      "PGPASSWORD": connectionParams.password!,
      "PGSSLMODE": "require"
    }
    
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
    
        //spawnedCmd.stdin.write(`${text}\r\n`);
        spawnedCmd.on("exit", () => {
          resolve()

    });
  });
};


