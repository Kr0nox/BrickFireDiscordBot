import {Client} from "discord.js";


export default (client: Client): void => {
    process.on('SIGINT', () => {
        client.destroy();
    });
};