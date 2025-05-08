import dayjs from "dayjs";
import chalk from "chalk";

class Logger {
    // Get the current time formatted
    time(): string {
        return chalk.dim(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}] ⌁`);
    }

    log(content: string): void {
        console.log(`${this.time()} ${chalk.bold.bgBlue("LOG")} ${content}`);
    }

    error(content: string): void {
        console.log(`${this.time()} ${chalk.bold.bgRed("ERR")} ${content}`);
    }
}

export default Logger;
