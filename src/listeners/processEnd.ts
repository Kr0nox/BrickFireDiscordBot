import {Client} from "discord.js";
import printToConsole from "../Bot";


export default (client: Client): void => {
    process.on('SIGINT', () => {
        client.destroy();
        printToConsole("Client destroyed");
    });
};