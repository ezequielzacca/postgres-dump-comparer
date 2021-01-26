import { writeFileSync, writeSync } from "fs";
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
    writeFileSync(path.join(process.cwd(), "output", `${filename}.sql`), text)
  } catch (e) {
    console.log("Error: ", e)
  }

};
