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
        validate: () => null,
    }],
    exec: async (client, message, userMention) => {
        const user = await findUser(client, message.author.id);
        if (!user) {
            return client.logger.error(
                `Could not find user ${message.author.id} in database!`,
            );
        }

        message.reply(
            `Exp: ${user.exp}\nCooldown: ${
                client.expCooldown.get(message.author.id) - Date.now()
            }`,
        );
    },
};

export default RankCommand;
