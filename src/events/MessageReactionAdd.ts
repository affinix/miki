import { ImageManipulator } from "canvacord";
import { incrementReaction } from "../db/querys/reactionQuery.ts";
import { createUser, findUser } from "../db/querys/userQuery.ts";
import { IEvent } from "../struct/Event.ts";
import { Events } from "discord.js";

const MessageReactionAddEvent: IEvent<Events.MessageReactionAdd> = {
    eventName: Events.MessageReactionAdd,
    exec: async (client, reaction, user) => {
        if (!reaction.message.author) return;
        // if (reaction.message.author.id == user.id) return;

        let from = await findUser(client, user.id);
        if (!from) from = await createUser(client, user.id);

        let to = await findUser(client, reaction.message.author.id);
        if (!to) to = await createUser(client, reaction.message.author.id);

        let emoji = reaction.emoji.toString();
        if (reaction.emoji.imageURL()) {
            if (reaction.emoji.animated) {
                emoji =
                    `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.gif`;
            } else {
                emoji =
                    `https://cdn.discordapp.com/emojis/${reaction.emoji.id}.png`;
            }
        }

        await incrementReaction(
            client,
            from.id,
            to.id,
            emoji,
        );
    },
};

export default MessageReactionAddEvent;
