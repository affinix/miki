import { MessageFlags } from "discord-api-types/v10";
import { sendPaginatedMessage } from "../generators/paginatedMessage.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";
import { commandUsage, listCommands } from "../util/commandInfo.ts";
import { saluteKaomoji } from "../util/kaomoji.ts";
import { TextDisplayBuilder } from "@discordjs/builders";

const PingCommand: ICommand = {
    commandName: "help",
    category: CommandCategory.SYS,
    desc: "Displays all commands.",
    longDesc:
        "Lists all the commands I have. I'll show you all the things that I can do! ᕙ[⎚◡⎚]ᕗ",
    args: [{
        name: "command",
        description: "The command you want more info on!",
        required: false,
        validate: (arg, client) => {
            if (!client.commands.has(arg)) {
                return `${arg} is not a valid command!`;
            }

            return null;
        },
    }],

    exec: (client, message, command) => {
        if (command) {
            const cmd = client.commands.get(command);
            if (!cmd) {
                return client.logger.error(
                    `Error while using help command: Could not find command '${command}'.`,
                );
            }

            const embed = client.embeds.replyEmbed(
                `here's how you use ${client.config.prefix}${cmd?.commandName} ᕙ(  •̀ ᗜ •́  )ᕗ`,
            ).addFields({
                name: "Description:",
                value: cmd.longDesc,
            }, {
                name: "Usage:",
                value: commandUsage(cmd),
            });

            return message.reply({ embeds: [embed] });
        }

        const embed = client.embeds.replyEmbed(
            `miki's at your service! ${saluteKaomoji()}`,
            listCommands([...client.commands.values()]),
        );

        message.reply({ embeds: [embed] });
    },
};

export default PingCommand;
