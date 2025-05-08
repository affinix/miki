import { ICommand } from "../struct/Command.ts";
import config from "../config.ts";

export const commandUsage = (command: ICommand): string => {
    const argsList = command.args.reduce<string>(
        (acc, arg) => acc += `[${arg.name}]`,
        "",
    );

    let out = `${config.prefix}${command.commandName} ${argsList}\n`;

    command.args.forEach((arg) => {
        out += `\n> [${arg.name}] ${arg.required ? "(required)" : ""}`;
        out += `\n    ↪ ${arg.description}`;
    });

    return `\`\`\`md\n${out}\n\`\`\``;
};

export const listCommands = (commands: ICommand[]): string => {
    const prefix = config.prefix;
    let out = `> Use ${prefix}help [command] for more details\n`;
    let currentCategory = "";

    const longestCommand = commands.reduce(
        (len, str) => Math.max(len, str.commandName.length),
        0,
    );
    const sortedCommands = commands.sort((p, c) => {
        return (p.category > c.category
            ? 1
            : (p.commandName > c.commandName && p.category === c.category
                ? 1
                : -1));
    });

    sortedCommands.forEach((cmd) => {
        const category = cmd.category;
        if (currentCategory != category) {
            out += `\n> ${category}:\n`;
            currentCategory = category;
        }

        const cmdDesc = `${
            " ".repeat(longestCommand - cmd.commandName.length)
        } : ${cmd.desc}`;
        out += `   ${prefix}${cmd.commandName}${cmdDesc}\n`;
    });

    return `\`\`\`md\n${out}\n\`\`\``;
};
