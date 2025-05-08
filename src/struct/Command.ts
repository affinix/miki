import { Message } from "discord.js";
import Miki from "./Miki.ts";

interface ICommand {
    commandName: string;
    category: string;
    desc: string;
    longDesc: string;
    args: ICommandArg[];
    exec: (client: Miki, message: Message, ...args: string[]) => void;
}

interface ICommandArg {
    name: string;
    description: string;
    required: boolean;
    validate: (arg: string) => string | null;
}

export { type ICommand, type ICommandArg };
