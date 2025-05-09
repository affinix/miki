import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";

const PingCommand: ICommand = {
    commandName: "ping",
    category: CommandCategory.MISC,
    desc: "Check message ping.",
    longDesc: "Pong! Checks how long it takes for me to send a message.",
    args: [],

    exec: async (client, message) => {
        const msg = await message.reply("Pinging...");
        const embed = client.embeds.replyEmbed(
            "( >o<)🏓ミ¯`·.¸.·´¯`°¤ Pong!",
            `Latency is ${msg.createdTimestamp - message.createdTimestamp}ms.`,
        );

        msg.edit({ content: "", embeds: [embed] });
    },
};

export default PingCommand;
