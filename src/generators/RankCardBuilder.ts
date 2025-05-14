// I am so sorry future me, this might be the most unmaintainable code I've written.
// If only jsx would actually work :(

import { Element } from "canvacord";
import { Builder, JSX, loadImage } from "canvacord";
import dayjs, { PluginFunc } from "dayjs";
import advancedFormat from "https://cdn.skypack.dev/dayjs/plugin/advancedFormat";
import Miki from "../struct/Miki.ts";

const RANK_CARD_WIDTH = 1000;
const RANK_CARD_HEIGHT = 600;

interface RankCardProps {
    client: Miki;
    level: number;
    exp: number;
    rankUpExp: number;
    rank: number;
    name: string;
    pfpURL: string;
    memberSince: Date;
}

class RankCardBuilder extends Builder<RankCardProps> {
    constructor(opt: RankCardProps) {
        super(RANK_CARD_WIDTH, RANK_CARD_HEIGHT);

        this.bootstrap(opt);
    }

    override async render() {
        const templateImage = this.options.get("client").images.get(
            "rank-card-template",
        ) ?? "";

        const pfpImage = (await loadImage(this.options.get("pfpURL")))
            .toDataURL();

        return JSX.createElement(
            "div",
            {
                style: {
                    display: "flex",
                    width: "100%",
                    height: "100%",
                },
            },
            // Background template image
            JSX.createElement("img", {
                src: templateImage,
                style: { position: "absolute" },
            }),
            // pfp image
            JSX.createElement("img", {
                src: pfpImage,
                style: {
                    position: "absolute",
                    top: "343px",
                    left: "725.6px",
                    width: "215.3px",
                    height: "215.3px",
                    borderRadius: "15px",
                },
            }),
            // level text
            JSX.createElement("p", {
                style: {
                    position: "absolute",
                    top: "201.5px",
                    left: "231px",
                    fontFamily: "phonk",
                    fontSize: "28px",
                    margin: "0px",
                    lineHeight: "0.85",
                    color: "white",
                },
            }, "level" as unknown as Element),
            JSX.createElement("p", {
                style: {
                    position: "absolute",
                    top: "208px",
                    left: "320.5px",
                    fontFamily: "swiss721",
                    fontSize: "28px",
                    margin: "0px",
                    lineHeight: "0.35",
                    color: "white",
                },
            }, ":" as unknown as Element),
            JSX.createElement(
                "p",
                {
                    style: {
                        position: "absolute",
                        top: "201.5px",
                        left: "359.6px",
                        fontFamily: "phonk",
                        fontSize: "28px",
                        margin: "0px",
                        lineHeight: "0.85",
                        color: "white",
                    },
                },
                String(this.options.get("level"))
                    .padStart(3, "0") as unknown as Element,
            ),
            // Rank Text
            JSX.createElement("p", {
                style: {
                    position: "absolute",
                    top: "237.1px",
                    left: "231px",
                    fontFamily: "phonk",
                    fontSize: "28px",
                    margin: "0px",
                    lineHeight: "0.85",
                    color: "white",
                },
            }, "rank" as unknown as Element),
            JSX.createElement("p", {
                style: {
                    position: "absolute",
                    top: "244px",
                    left: "317.5px",
                    fontFamily: "swiss721",
                    fontSize: "28px",
                    margin: "0px",
                    lineHeight: "0.35",
                    color: "white",
                },
            }, ":" as unknown as Element),
            JSX.createElement(
                "p",
                {
                    style: {
                        position: "absolute",
                        top: "237.1px",
                        left: "359.6px",
                        fontFamily: "phonk",
                        fontSize: "28px",
                        margin: "0px",
                        lineHeight: "0.85",
                        color: "white",
                    },
                },
                `${
                    getRankText(this.options.get("rank"))
                }` as unknown as Element,
            ),
            // Exp text
            JSX.createElement("p", {
                style: {
                    position: "absolute",
                    top: "271.7px",
                    left: "231px",
                    fontFamily: "phonk",
                    fontSize: "28px",
                    margin: "0px",
                    lineHeight: "0.85",
                    color: "white",
                },
            }, "exp" as unknown as Element),
            JSX.createElement("p", {
                style: {
                    position: "absolute",
                    top: "278.6px",
                    left: "303px",
                    fontFamily: "swiss721",
                    fontSize: "28px",
                    margin: "0px",
                    lineHeight: "0.35",
                    color: "white",
                },
            }, ":" as unknown as Element),
            JSX.createElement(
                "div",
                {
                    style: {
                        display: "flex",
                        position: "absolute",
                        top: "271.7px",
                        left: "359.6px",
                        gap: "10px",
                    },
                },
                JSX.createElement("p", {
                    style: {
                        fontFamily: "phonk",
                        fontSize: "28px",
                        margin: "0px",
                        lineHeight: "0.85",
                        color: "white",
                    },
                }, `${this.options.get("exp")}` as unknown as Element),
                JSX.createElement("p", {
                    style: {
                        fontFamily: "swiss721",
                        fontSize: "28px",
                        margin: "0px",
                        lineHeight: "0.8",
                        color: "white",
                    },
                }, ` / ` as unknown as Element),
                JSX.createElement("p", {
                    style: {
                        fontFamily: "phonk",
                        fontSize: "28px",
                        margin: "0px",
                        lineHeight: "0.85",
                        color: "white",
                    },
                }, `${this.options.get("rankUpExp")}` as unknown as Element),
            ),
            // Exp progress bar
            JSX.createElement("div", {
                style: {
                    display: "flex",
                    backgroundImage:
                        "linear-gradient(to right, #248CDE, #7165EA)",
                    position: "absolute",
                    top: "324px",
                    left: "232.9px",
                    width: `${
                        341 *
                        (this.options.get("exp") /
                            this.options.get("rankUpExp"))
                    }px`,
                    height: "14.9px",
                    transform: "skewX(-18deg)",
                },
            }),
            JSX.createElement("div", {
                style: {
                    display: "flex",
                    border: "4px solid white",
                    position: "absolute",
                    top: "324px",
                    left: "232.9px",
                    width: "341px",
                    height: "14.9px",
                    transform: "skewX(-18deg)",
                },
            }),
            // nametag
            JSX.createElement(
                "div",
                {
                    style: {
                        display: "flex",
                        position: "absolute",
                        top: "63.3px",
                        left: "0px",
                        width: "944.9px",
                        justifyContent: "flex-end",
                        alignItems: "flex-end",
                        gap: "2px",
                    },
                },
                JSX.createElement("p", {
                    style: {
                        fontFamily: "lilita-one",
                        fontSize: "54px",
                        margin: "0px",
                        lineHeight: "0.85",
                        color: "#626262",
                    },
                }, "@" as unknown as Element),
                JSX.createElement("p", {
                    style: {
                        fontFamily: "lilita-one",
                        fontSize: "74px",
                        margin: "0px",
                        lineHeight: "0.7",
                        color: "white",
                    },
                }, `${this.options.get("name")}` as unknown as Element),
            ),
            // join date
            JSX.createElement(
                "div",
                {
                    style: {
                        display: "flex",
                        position: "absolute",
                        top: "132px",
                        left: "0px",
                        width: "944.9px",
                        justifyContent: "flex-end",
                    },
                },
                JSX.createElement(
                    "p",
                    {
                        style: {
                            fontFamily: "lilita-one",
                            fontSize: "24px",
                            margin: "0px",
                            lineHeight: "0.7",
                            color: "#F6A53C",
                        },
                    },
                    `${
                        getJoinDateText(this.options.get("memberSince"))
                            .toLowerCase()
                    }` as unknown as Element,
                ),
            ),
        );
    }
}

const getRankText = (rank: number): string => {
    const suffix = ["th", "st", "nd", "rd"].fill("th", 4, 9);

    return `${rank}${suffix[rank % 10]}`;
};

const getJoinDateText = (joinDate: Date): string => {
    dayjs.extend(advancedFormat as unknown as PluginFunc<unknown>);
    return "member since " + dayjs(joinDate).format("MMM Do YYYY");
};

export default RankCardBuilder;
