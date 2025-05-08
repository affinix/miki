import { ClientEvents } from "discord.js";
import Miki from "./Miki.ts";

interface IEvent {
    eventName: keyof ClientEvents;
    exec(client: Miki, ...args: any): any;
}

export default IEvent;
