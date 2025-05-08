import { Client, Collection } from "discord.js";
import { GatewayIntentBits } from "discord-api-types/v10";
import config from "../config.js";

class Miki extends Client {
    public config = config;
    private commands = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }

    start(): void {
        this.login(Deno.env.get("TOKEN"));
    }
}

export default Miki;
