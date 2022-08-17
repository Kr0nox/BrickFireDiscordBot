import {Client, Partials, IntentsBitField } from 'discord.js';
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import reactionAdd from "./listeners/reactionAdd";
import {readFileSync} from "fs";
import {readAppointments} from "./appointments/appointmentManager";
import Settings from "./Settings";
import processEnd from "./listeners/processEnd";

printToConsole("Bot is starting...");
export const DEFAULT_SETTINGS = new Settings("data/defaultSettings.json")

const client = new Client({
    intents: [
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMembers,
        IntentsBitField.Flags.GuildMessageReactions
    ],
    partials: [
        Partials.User,
        Partials.Reaction,
        Partials.Message,
        Partials.GuildMember
    ]
});


ready(client);
interactionCreate(client);
reactionAdd(client);
processEnd(client)
readAppointments();


client.login(readFileSync("data/token.env").toString());

export default function printToConsole(s: any) : void {
    console.log(new Date().toLocaleString('de-AT', {timeZone: 'Europe/Berlin'}) + " > "+ s)
}