import { Message } from "discord.js";
import Miki from "./Miki.ts";
import CommandCategory from "./CommandCategory.ts";

interface ICommand {
    commandName: string;
    category: CommandCategory;
    desc: string;
    longDesc: string;
    admin: boolean;
    args: ICommandArg[];
    exec: (client: Miki, message: Message, ...args: string[]) => void;
}

interface ICommandArg {
    name: string;
    description: string;
    required: boolean;
    validate: (arg: string, client: Miki) => string | null;
}

export { type ICommand, type ICommandArg };
