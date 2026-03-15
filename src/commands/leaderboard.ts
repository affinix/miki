import { MessageFlags, SeparatorSpacingSize } from "discord-api-types/v10";
import { ThumbnailBuilder } from "@discordjs/builders";
import { SectionBuilder, SeparatorBuilder } from "@discordjs/builders";
import { ContainerBuilder, TextDisplayBuilder } from "@discordjs/builders";

import { countUsers, findUser, getLeaderboard } from "../db/querys.ts";
import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";
import { getLevelInfo } from "../util/level.ts";
import {
    MessagePage,
    sendPaginatedMessage,
} from "../generators/paginatedMessage.ts";
import config from "../config.ts";
import { happyKaomoji } from "../util/kaomoji.ts";
import { getRankText } from "../generators/RankCardBuilder.ts";

const PAGE_LENGTH = 6;

const LeaderboardCommand: ICommand = {
    commandName: "leaderboard",
    category: CommandCategory.RANK,
    desc: "Check the server EXP leaderboard.",
    longDesc:
        "Displays a leaderboard for the server, ranking members by exp/level.",
    admin: false,
    args: [],

    exec: async (client, message) => {
        const generateLeaderboardPage = async (
            page: number,
        ): Promise<MessagePage> => {
            const displayPage: ContainerBuilder =
                generateBlankLeaderboardPage();

            const leaderboard = await getLeaderboard(client, page, PAGE_LENGTH);
            for (const [j, user] of leaderboard.entries()) {
                const guildUser = await client.users.fetch(user.id);
                const { exp, level, levelUpExp } = getLevelInfo(user.exp);
                const rank = page * PAGE_LENGTH + j + 1;

                const userTitle = new TextDisplayBuilder()
                    .setContent(
                        `## ${getRankText(rank)}⠀⌁⠀<@${guildUser.id}>\n`,
                    );
                const userInfo = new TextDisplayBuilder()
                    .setContent(
                        `⠀⠀↪⠀**EXP:**⠀\`${exp}/${levelUpExp}\`\n` +
                            `⠀⠀↪⠀**Level:**⠀\`${level}\`\n`,
                    );
                const pfpThumb = new ThumbnailBuilder().setURL(
                    guildUser.displayAvatarURL(),
                );
                const infoContainer = new SectionBuilder()
                    .addTextDisplayComponents(userTitle, userInfo)
                    .setThumbnailAccessory(pfpThumb);

                displayPage.addSectionComponents(infoContainer);
            }

            const footerText = new TextDisplayBuilder()
                .setContent(
                    `-# ⋆˙⟡⠀you are **rank ${rank + 1}**⠀//⠀${happyKaomoji()}`,
                );
            displayPage.addTextDisplayComponents(footerText);

            return {
                flags: MessageFlags.IsComponentsV2,
                components: [displayPage],
            };
        };

        if ("sendTyping" in message.channel) message.channel.sendTyping();

        const pagesNo = Math.ceil((await countUsers(client)) / PAGE_LENGTH);

        const userData = await findUser(client, message.author.id);
        const userCount = await countUsers(client);
        const leaderboard = await getLeaderboard(client, 0, userCount);

        if (!userData) return;
        const rank = leaderboard.findIndex((user) => user.id === userData.id);

        sendPaginatedMessage(message, pagesNo, generateLeaderboardPage);
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

export default LeaderboardCommand;
