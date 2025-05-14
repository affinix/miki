import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";

const RoleCommand: ICommand = {
    commandName: "role",
    category: CommandCategory.RANK,
    desc: "View & set your role.",
    longDesc:
        "List out your avaliable roles and allows you to set your role. Avaliable roles are based on your level, with more roles unlocking as you reach higher levels.",
    admin: false,
    args: [],

    exec: async (client, message) => {
    },
};

export default RoleCommand;
