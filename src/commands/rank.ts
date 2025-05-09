import { findUser } from "../db/querys.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";

const RankCommand: ICommand = {
    commandName: "rank",
    category: CommandCategory.RANK,
    desc: "Check your exp & level.",
    longDesc:
        "Displays your current exp and level, or the exp and level of the person you mention.",
    args: [{
        name: "user",
        description: "Mention of the user you want to check!",
        required: false,
        validate: (arg) => {
            if (!arg.match(/<@!*&*[0-9]+>/g)) {
                return `${arg} is not a valid mention!`;
            }

            return null;
        },
    }],
    exec: async (client, message, userMention) => {
        let user = message.author;
        if (userMention && message.mentions.members) {
            user = message.mentions.members?.first();
        }

        const userData = await findUser(client, user.id);
        if (!userData) {
            const embed = client.embeds.errorEmbed(
                `Could not find ${userMention}'s exp!`,
            );
            return message.reply({ embeds: [embed] });
        }

        message.reply(
            `Exp: ${userData.exp}\nCooldown: ${
                (client.expCooldown.get(user.id) - Date.now()) / 1000
            }`,
        );
    },
};

export default RankCommand;
