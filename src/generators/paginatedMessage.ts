import { ButtonInteraction, Message, MessageCreateOptions } from "discord.js";
import { ButtonStyle } from "discord-api-types/v10";
import {
    ActionRowBuilder,
    AnyComponentBuilder,
    ButtonBuilder,
    TextDisplayBuilder,
} from "@discordjs/builders";

const EMBED_TIMEOUT = 1000 * 20;

type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };
export type MessagePage = DeepWriteable<MessageCreateOptions>;

enum ButtonTypes {
    FIRST,
    PREV,
    NEXT,
    LAST,
    __LENGTH,
}

export const sendPaginatedMessage = async (
    message: Message,
    pages: MessagePage[],
): Promise<void> => {
    let index = 0;
    const timeSent = Date.now();

    const render = (ended: boolean = false): MessagePage => {
        return {
            ...pages[index],
            components: [
                ...pages[index].components,
                ended ? null : generateButtons(index, pages.length),
                generateFooter(index, pages.length, timeSent),
            ].filter((c) => c != null),
        };
    };

    const curPage = await message.reply(render());

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

        await i.update(render());
    });

    collector.on("end", () => {
        curPage.edit(render(true));
    });
};

const generateButtons = (
    index: number,
    pagesNo: number,
): ActionRowBuilder<AnyComponentBuilder> => {
    const buttons = [
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

    return new ActionRowBuilder().addComponents(
        ...buttons,
    );
};

const generateFooter = (
    index: number,
    pages: number,
    time: number,
): TextDisplayBuilder => {
    return new TextDisplayBuilder().setContent(
        `-# page ${index + 1} of ${pages} • <t:${Math.floor(time / 1000)}:R>`,
    );
};
