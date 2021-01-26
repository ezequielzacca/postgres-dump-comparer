import { backupPostgresFunctions, backupPostgresTables } from "./commands"
import { config } from "dotenv"
import ora from "ora"
import inquirer from "inquirer"
config()
const executeProgram = async () => {
  const answer = await inquirer.prompt([{
    name: "choices",
    type: "checkbox",
    message: "Select the objects that you want to dump",
    choices: [
      {
        name: "Functions",
        checked: true,
      },
      {
        name: "Tables",
        checked: false
      }
    ], validate: function (answer) {
      if (answer.length < 1) {
        return 'You must choose at least one.';
      }
      return true;
    },
  }])
  const promisesToResolve: Promise<any>[] = []
  const spinner = ora('Dumping selected objects...').start()
  const dumpProdFunctions = backupPostgresFunctions(
    process.env.CONNECTION_STRING_PROD as string,
    "prod"
  )
  const dumpDevFunctions = backupPostgresFunctions(
    process.env.CONNECTION_STRING_DEV as string,
    "dev"
  )
  const dumpProdTables = backupPostgresTables(
    process.env.CONNECTION_STRING_PROD as string,
    "prod"
  )
  const dumpDevTables = backupPostgresTables(
    process.env.CONNECTION_STRING_DEV as string,
    "dev"
  )
  if (answer.choices.includes("Functions")) {
    promisesToResolve.push(dumpProdFunctions)
    promisesToResolve.push(dumpDevFunctions)
  }
  if (answer.choices.includes("Tables")) {
    promisesToResolve.push(dumpProdTables)
    promisesToResolve.push(dumpDevTables)
  }
  await Promise.all(promisesToResolve)
  spinner.stop()
}
executeProgram().then(() => console.log("finished")).catch(console.log);