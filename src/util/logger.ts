import dayjs from "dayjs";
import chalk from "chalk";

const logger = {
    log: (content: string): void => {
        console.log(`${time()} ⌁ ${chalk.bold.bgBlue("LOG")} ${content}`);
    },

    error: (content: string): void => {
        console.log(`${time()} ⌁ ${chalk.bold.bgRed("ERR")} ${content}`);
    },

    subLog: (content: string): void => {
        console.log(chalk.gray(`${time()}     ${content}`));
    },
};

const time = (): string => {
    return chalk.dim(`[${dayjs().format("YYYY-MM-DD HH:mm:ss")}]`);
};

export default logger;
