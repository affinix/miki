import { EmbedBuilder } from "@discordjs/builders";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";

const PingCommand: ICommand = {
    commandName: "ping",
    category: CommandCategory.MISC,
    desc: "Check message ping.",
    longDesc: "Pong! Checks how long it takes for me to send a message.",
    args: [{
        name: "test",
        description: "test",
        required: true,
        validate: (arg) => {
            if (arg === "test") {
                return null;
            } else {
                return "arg must be test";
            }
        },
    }],
    exec: async (_client, message) => {
        const msg = await message.reply("Pinging...");
        const embed = new EmbedBuilder()
            .addFields({
                name: "Pong!",
                value: `Latency is ${
                    msg.createdTimestamp - message.createdTimestamp
                }ms.`,
            })
            .setColor(0xFF_FF_FF);

        msg.edit({ content: "", embeds: [embed] });
    },
};

export default PingCommand;
