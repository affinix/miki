import { ICommand } from "../struct/Command.ts";
import config from "../config.js";

export const commandUsage = (command: ICommand): string => {
    const argsList = command.args.reduce<string>(
        (acc, arg) => acc += `[${arg.name}]`,
        "",
    );

    let out = `${config.prefix}${command.commandName} ${argsList}\n`;

    command.args.forEach((arg) => {
        out += `\n> ${arg.name} ${arg.required ? "(required)" : ""}`;
        out += `\n   ${arg.description}`;
    });

    return `\`\`\`md\n${out}\n\`\`\``;
};
