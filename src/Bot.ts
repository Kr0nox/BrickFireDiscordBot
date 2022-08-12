import {Client, Partials, IntentsBitField } from 'discord.js';
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import reactionAdd from "./listeners/reactionAdd";
import {readFileSync} from "fs";
import {readAppointments, manageAppointments} from "./appointments/appointmentManager";
import Settings from "./Settings";

console.log("Bot is starting...");
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
readAppointments();

process.on('SIGINT', () => {
    client.destroy();
});

client.login(readFileSync("data/token.env").toString()).then(() => {
    manageAppointments(client).then(() => setInterval(function (){manageAppointments(client)}, 360000))
});
