import Miki from "./Miki.ts";

interface ICommand {
    commandName: string;
    category: string;
    desc: string;
    longDesc: string;
    args: ICommandArg[];
    exec: (client: Miki, ...args: any) => void;
}

interface ICommandArg {
    name: string;
    description: string;
    required: boolean;
    validate: (arg: string) => boolean;
}

export { type ICommand, type ICommandArg };
