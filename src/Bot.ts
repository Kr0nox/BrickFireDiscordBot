import {Client, Partials, IntentsBitField } from 'discord.js';
import ready from "./listeners/ready";
import interactionCreate from "./listeners/interactionCreate";
import reactionAdd from "./listeners/reactionAdd";
import {readFileSync} from "fs";
import {readAppointments} from "./appointments/appointmentManager";

console.log("Bot is starting...");

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

client.login(readFileSync("data/token.env").toString());
