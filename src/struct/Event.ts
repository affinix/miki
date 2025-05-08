import { ClientEvents } from "discord.js";
import { Events } from "discord.js";
import Miki from "./Miki.ts";

type EventKey = `${Events}` & keyof ClientEvents;

interface IEvent<E extends EventKey> {
    eventName: keyof ClientEvents;
    exec: (client: Miki, ...args: ClientEvents[E]) => void;
}

export default IEvent;
