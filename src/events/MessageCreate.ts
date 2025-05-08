import { Events } from "discord.js";
import IEvent from "../struct/Event.ts";

const ReadyEvent: IEvent<Events.MessageCreate> = {
    eventName: "messageCreate",
    exec: (_client, message) => {
        console.log(message.content);
    },
};

export default ReadyEvent;
