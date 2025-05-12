import { ICommand } from "../struct/Command.ts";
import CommandCategory from "../struct/CommandCategory.ts";

const LeaderboardCommand: ICommand = {
    commandName: "leaderboard",
    category: CommandCategory.RANK,
    desc: "Check the server EXP leaderboard.",
    longDesc:
        "Displays a leaderboard for the server, ranking members by exp/level.",
    args: [],

    exec: async (client, message) => {
    },
};

export default LeaderboardCommand;
