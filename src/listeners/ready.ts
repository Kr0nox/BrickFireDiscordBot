import { Client, PresenceData } from "discord.js";
import { Commands } from "../CommandCollection";
import printToConsole from "../Bot";
import {manageAppointments} from "../appointments/appointmentManager";

export default (client: Client): void => {
    client.on("ready", async () => {
        if (!client.user || !client.application) {
            return;
        }

        await client.application.commands.set(Commands);

        printToConsole(`${client.user.username} is online`);

        manageAppointments(client).then(() => setInterval(function (){manageAppointments(client)}, 3600000));
    });
};