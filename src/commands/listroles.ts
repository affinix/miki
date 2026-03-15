import { getGuildRoles } from "../db/querys.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";

const PingCommand: ICommand = {
    commandName: "listroles",
    category: CommandCategory.RANK,
    desc: "Lists all roles avaliable.",
    longDesc:
        "List all roles avaliable on the server, as well as what level is required to unlock it.",
    admin: false,
    args: [],

    exec: async (client, message) => {
        if (!message.guild) return;

        const roles = await getGuildRoles(client, message.guild.id);

        let msg = "";
        roles.forEach((role) => {
            msg += `### Level ${role.level}⠀⌁⠀<@&${role.id}>\n`;
        });

        const embed = client.embeds.replyEmbed("Roles for anime@UTS:", msg);
        return message.reply({ embeds: [embed] });
    },
};

export default PingCommand;
