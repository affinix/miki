import { EmbedBuilder } from "@discordjs/builders";
import config from "../config.js";
import Miki from "../struct/Miki.ts";

class MikiEmbeds {
    private client: Miki;
    constructor(client: Miki) {
        this.client = client;
    }

    errorEmbed(message: string): EmbedBuilder {
        return new EmbedBuilder()
            .setAuthor({
                name: "there was an error! Σ(°△°|||)",
                iconURL: this.client.user?.avatarURL(),
            })
            .setDescription(message)
            .setColor(config.errorColor)
            .setFooter({ text: "(╥﹏╥)" })
            .setTimestamp();
    }

    replyEmbed(title: string, message?: string): EmbedBuilder {
        return new EmbedBuilder()
            .setAuthor({
                name: title,
                iconURL: this.client.user?.avatarURL(),
            })
            .setDescription(message ? message : null)
            .setColor(config.primaryColor)
            .setFooter({ text: "( ◡‿◡ *)" })
            .setTimestamp();
    }
}

export default MikiEmbeds;
