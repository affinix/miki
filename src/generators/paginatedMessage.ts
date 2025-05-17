import type { DeepWritable } from "ts-essentials";
import { ButtonInteraction, Message, MessageCreateOptions } from "discord.js";
import { ButtonStyle } from "discord-api-types/v10";
import {
    ActionRowBuilder,
    AnyComponentBuilder,
    ButtonBuilder,
    TextDisplayBuilder,
} from "@discordjs/builders";
import config from "../config.ts";

export type MessagePage = DeepWritable<MessageCreateOptions>;

enum ButtonTypes {
    FIRST,
    PREV,
    NEXT,
    LAST,
    __LENGTH,
}

export const sendPaginatedMessage = async (
    message: Message,
    pagesNo: number,
    generatePage: (page: number) => Promise<MessagePage>,
): Promise<void> => {
    let index = 0;
    const timeSent = Date.now();

    const render = async (ended: boolean = false): Promise<MessagePage> => {
        const generatedPage = await generatePage(index);
        return {
            ...generatedPage,
            components: [
                ...generatedPage.components,
                ended ? null : generateButtons(index, pagesNo),
                generateFooter(index, pagesNo, timeSent),
            ].filter((c) => c != null),
        };
    };

    if (pagesNo === 1) {
        message.reply(await render(true));
        return;
    }

    const curPage = await message.reply(await render());
    const collector = curPage.createMessageComponentCollector({
        filter: (i: ButtonInteraction) => {
            const id = parseInt(i.customId);
            return id >= 0 && id < ButtonTypes.__LENGTH;
        },
        time: config.collectorTimeout,
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
                index = pagesNo - 1;
                break;
        }

        collector.resetTimer();
        await i.update(await render());
    });

    collector.on("end", async () => {
        curPage.edit(await render(true));
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
        `-# page ${index + 1} of ${pages}⠀•⠀<t:${Math.floor(time / 1000)}:R>`,
    );
};
