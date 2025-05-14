import { MessageFlags, SeparatorSpacingSize } from "discord-api-types/v10";
import { ThumbnailBuilder } from "@discordjs/builders";
import { SectionBuilder, SeparatorBuilder } from "@discordjs/builders";
import { ContainerBuilder, TextDisplayBuilder } from "@discordjs/builders";

import { countUsers, getLeaderboard } from "../db/querys.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";
import Miki from "../struct/Miki.ts";
import { getLevelInfo } from "../util/level.ts";
import {
    MessagePage,
    sendPaginatedMessage,
} from "../generators/paginatedMessage.ts";
import config from "../config.ts";
import { happyKaomoji } from "../util/kaomoji.ts";

const PAGE_LENGTH = 8;

const LeaderboardCommand: ICommand = {
    commandName: "leaderboard",
    category: CommandCategory.RANK,
    desc: "Check the server EXP leaderboard.",
    longDesc:
        "Displays a leaderboard for the server, ranking members by exp/level.",
    admin: false,
    args: [],

    exec: async (client, message) => {
        const pageNo = Math.ceil((await countUsers(client)) / PAGE_LENGTH);
        const leaderboardPages = await generateLeaderboardPages(
            client,
            pageNo,
            1,
        );

        sendPaginatedMessage(message, leaderboardPages);
    },
};

const generateBlankLeaderboardPage = (): ContainerBuilder => {
    const title = new TextDisplayBuilder()
        .setContent("## ⠀⟢⠀anime@UTS leaderboard⠀⠀");
    const separator = new SeparatorBuilder()
        .setSpacing(SeparatorSpacingSize.Large);

    return new ContainerBuilder()
        .addTextDisplayComponents(title)
        .addSeparatorComponents(separator)
        .setAccentColor(config.primaryColor);
};

const generateLeaderboardPages = async (
    client: Miki,
    pageNo: number,
    userRank: number,
): Promise<MessagePage[]> => {
    const pages: MessagePage[] = [];
    for (let i = 0; i <= pageNo; i++) {
        const page: ContainerBuilder = generateBlankLeaderboardPage();

        const leaderboard = await getLeaderboard(client, i, PAGE_LENGTH);
        for (const [j, user] of leaderboard.entries()) {
            const guildUser = await client.users.fetch(user.id);
            const { exp, level, levelUpExp } = getLevelInfo(user.exp);

            const userTitle = new TextDisplayBuilder()
                .setContent(
                    `## \\#${i * PAGE_LENGTH + j + 1}⠀⌁⠀<@${guildUser.id}>\n`,
                );
            const userInfo = new TextDisplayBuilder()
                .setContent(
                    `⠀⠀↪⠀**EXP:**⠀\`${exp}/${levelUpExp}\`\n` +
                        `⠀⠀↪⠀**Level:**⠀\`${level}\`\n`,
                );
            const pfpThumb = new ThumbnailBuilder().setURL(
                guildUser.avatarURL() ?? "",
            );
            const infoContainer = new SectionBuilder()
                .addTextDisplayComponents(userTitle, userInfo)
                .setThumbnailAccessory(pfpThumb);

            page.addSectionComponents(infoContainer);
        }

        const footerText = new TextDisplayBuilder()
            .setContent(
                `-# ⋆˙⟡⠀you are **rank ${userRank}**⠀//⠀${happyKaomoji()}`,
            );
        page.addTextDisplayComponents(footerText);

        pages.push({
            flags: MessageFlags.IsComponentsV2,
            components: [page],
        });
    }

    return pages;
};

export default LeaderboardCommand;
