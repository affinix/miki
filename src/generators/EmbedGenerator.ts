import { EmbedBuilder } from "@discordjs/builders";
import { happyKaomoji, sadKaomoji, shockKaomoji } from "../util/kaomoji.ts";
import config from "../config.ts";
import Miki from "../struct/Miki.ts";

class EmbedGenerator {
    private client: Miki;
    constructor(client: Miki) {
        this.client = client;
    }

    errorEmbed(message: string): EmbedBuilder {
        return new EmbedBuilder()
            .setAuthor({
                name: `there was an error! ${shockKaomoji()}`,
                iconURL: `${this.client.user?.avatarURL()}`,
            })
            .setDescription(message)
            .setColor(config.errorColor)
            .setFooter({ text: sadKaomoji() })
            .setTimestamp();
    }

    replyEmbed(title: string, message?: string): EmbedBuilder {
        return new EmbedBuilder()
            .setAuthor({
                name: title,
                iconURL: `${this.client.user?.avatarURL()}`,
            })
            .setDescription(message ? message : null)
            .setColor(config.primaryColor)
            .setFooter({ text: happyKaomoji() })
            .setTimestamp();
    }
}

export default EmbedGenerator;
