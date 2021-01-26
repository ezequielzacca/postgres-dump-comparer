import { backupPostgresFunctions } from "./commands"
import { config } from "dotenv"
config()
const executeProgram = async () => {
  console.log()
  await backupPostgresFunctions(
    process.env.CONNECTION_STRING_PROD as string,
    "prod"
  )
  await backupPostgresFunctions(
    process.env.CONNECTION_STRING_DEV as string,
    "dev"
  )
}
executeProgram().then(() => console.log("finished")).catch(console.log);