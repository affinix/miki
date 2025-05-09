import { ButtonInteraction, Message } from "discord.js";
import { ButtonStyle } from "discord-api-types/v10";
import {
    ActionRowBuilder,
    ButtonBuilder,
    EmbedBuilder,
} from "@discordjs/builders";

const EMBED_TIMEOUT = 1000 * 30;

enum ButtonTypes {
    FIRST,
    PREV,
    NEXT,
    LAST,
    __LENGTH,
}

export const sendPaginationEmbed = async (
    message: Message,
    pages: EmbedBuilder[],
): Promise<void> => {
    let index = 0;

    const curPage = await message.reply({
        embeds: [appendFooter(pages[index], index, pages.length)],
        components: [
            new ActionRowBuilder().addComponents(
                ...generateButtons(index, pages.length),
            ),
        ],
    });

    const collector = curPage.createMessageComponentCollector({
        filter: (i: ButtonInteraction) => {
            const id = parseInt(i.customId);
            return id >= 0 && id < ButtonTypes.__LENGTH;
        },
        time: EMBED_TIMEOUT,
    });

    collector.on("collect", async (i: ButtonInteraction) => {
        const btnType = parseInt(i.customId) as ButtonTypes;
        switch (btnType) {
            case ButtonTypes.FIRST:
                index = 0;
                break;
            case ButtonTypes.PREV:
                index -= 1;
                break;
            case ButtonTypes.NEXT:
                index += 1;
                break;
            case ButtonTypes.LAST:
                index = pages.length - 1;
                break;
        }

        await i.update({
            embeds: [appendFooter(pages[index], index, pages.length)],
            components: [
                new ActionRowBuilder().addComponents(
                    ...generateButtons(index, pages.length),
                ),
            ],
        });
    });

    collector.on("end", () => {
        curPage.edit({
            components: [],
        });
    });
};

const generateButtons = (index: number, pagesNo: number): ButtonBuilder[] => [
    new ButtonBuilder()
        .setCustomId(`${ButtonTypes.FIRST}`)
        .setLabel("«")
        .setDisabled(index === 0)
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`${ButtonTypes.PREV}`)
        .setLabel("‹")
        .setDisabled(index === 0)
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`${ButtonTypes.NEXT}`)
        .setLabel("›")
        .setDisabled(index === pagesNo - 1)
        .setStyle(ButtonStyle.Secondary),
    new ButtonBuilder()
        .setCustomId(`${ButtonTypes.LAST}`)
        .setLabel("»")
        .setDisabled(index === pagesNo - 1)
        .setStyle(ButtonStyle.Secondary),
];

const appendFooter = (
    embed: EmbedBuilder,
    index: number,
    pages: number,
): EmbedBuilder => {
    const footerText = embed.data.footer?.text;
    return new EmbedBuilder(embed.data).setFooter({
        text: `page ${index + 1} of ${pages} // ${footerText}`,
    });
};
