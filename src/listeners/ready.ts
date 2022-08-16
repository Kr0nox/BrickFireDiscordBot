import { Client, PresenceData } from "discord.js";
import { Commands } from "../CommandCollection";
import printToConsole from "../Bot";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        await client.application.commands.set(Commands);

        printToConsole(`${client.user.username} is online`);
    });
};