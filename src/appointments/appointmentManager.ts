import {Appointment, jsonToAppointment} from "./Appointment";
import {readFileSync, writeFileSync} from "fs";
import {Day} from "./Day";
import {
    Client,
    APIInteractionGuildMember,
    GuildMember,
    ButtonInteraction,
    ButtonStyle,
    Message,
    TextBasedChannel,
    Interaction,
    User,
    MessageReaction,
    PartialUser,
    Emoji,
    ActionRow,
    ActionRowBuilder,
    ButtonBuilder
} from "discord.js";
import {Time} from "./Time";
import NullAppointment from "./NullAppointment";
import {DEFAULT_SETTINGS} from "../Bot";

let appointments : Appointment[] = [];
const path = "data/appointments.json";
let thereEmoji : Emoji;
let notThereEmoji;
let onlineEmoji;
let unsureEmoji;

export async function manageAppointments(client:Client) {
    let d = new Date();
    const day = new Day(d.getDate(), d.getMonth() + 1, d.getFullYear());
    const time = new Time(d.getHours(), d.getMinutes())
    const guild = await client.guilds.cache.at(0);
    for (let a of appointments) {
        if (day.compare(a.date) == 1 || (day.compare(a.date) == 0 &&
                (a.end != null ? time.compare(a.end) == 1: time.compare(a.start) == 1))) {
            // delete old appointment
            await client.channels.fetch(a.channel).then(() => {
                let c = client.channels.cache.get(a.channel)
                if (c != undefined) {
                    let channel = c as TextBasedChannel
                    deleteAppointment(channel, a.date, a.start);
                    // add new if repeated
                    if (a.repeat) {
                        let repeat = new Appointment(
                            a.mention,
                            a.date.nextWeek(),
                            a.start,
                            a.end,
                            a.description,
                            true,
                            a.channel,
                            a.doPrivateMention
                        );
                        addAppointment(repeat, channel);
                    }
                }
        });}
        else if (a.doPrivateMention && !a.mentionWasSend
                && new Date(a.date.year, a.date.month - 1, a.date.day, a.start.hour, a. start.minute).getTime()
                - new Date().getTime() < DEFAULT_SETTINGS.privateMentionTime * 3600000
                && guild != undefined && a.mention.charAt(0) == '<') {
            // all reactions
            const reacted = a.there.concat(a.notThere, a.online);
            // all server members
            const members = await guild.members.list();
            for (let m of members.values()) {
                if (reacted.indexOf(getName(m)) >= 0) {
                    continue;
                }
                // check for correct role
                for (let r of m.roles.cache.values()) {
                    if (r.toString() == a.mention) {
                        // create message link
                        let link = await guild.channels.fetch().then(() => {
                            let c  = guild.channels.cache.get(a.channel)
                            if (c != undefined) {
                                let channel = c as TextBasedChannel
                                return findMessages(channel, a.date, a.start).then(m => {
                                    return m.length == 1 ? m[0].url:null;
                                })
                            }
                            return null;
                        })
                        // send private message
                        await m.send({content: a.toString(true)
                            + (link != null ? "\n Melde dich hier an/ab: \n" + link:"")})
                    }
                }
            }
            a.mentionWasSend = true;
        }
    }
    saveAppointments()
    getEmojis(client)
}

export async function addAppointment(a:Appointment, c:TextBasedChannel) {
    appointments.push(a)
    saveAppointments()
    const thereLabel = thereEmoji.toString()
    c.send({content:a.toString(), components:[
            {
                type: 1,
                components: [
                    {
                        type: 2,
                        label: 'Ich bin da',
                        style: ButtonStyle.Success,
                        custom_id: 'there'
                    },
                    {
                        type: 2,
                        label: 'Ich bin NICHT da',
                        style: ButtonStyle.Danger,
                        custom_id: 'notThere'
                    },
                    {
                        type: 2,
                        label: 'Ich bin ONLINE da',
                        style: ButtonStyle.Primary,
                        custom_id: 'discord'
                    }/*,
                    {
                        type: 2,
                        label: 'Unsicher',
                        style: ButtonStyle.Secondary,
                        custom_id: 'unsure',
                    }*/
                ]
            }
        ]});
}

export async function deleteAppointment(channel:TextBasedChannel, date:Day, start?:Time) {
    // Delete message in channel
    await findMessages(channel, date, start).then(messages => {
        messages.forEach(function (m) {
            m.delete();
            });
        }
    );

    // remove appointment from list
    let newAppointments : Appointment[] = []
    while (appointments.length > 0) {
        let a = appointments.pop();
        if (a == undefined) {
            continue;
        }
        if (a.date.toString() !== date.toString()) {
            newAppointments.push(a)
        }
    }
    appointments = newAppointments

    saveAppointments()
}

export async function editAppointment(channel:TextBasedChannel, date:Day, removeReactions: boolean, oldStart? : Time,
                                      newStart?:Time, newEnd?:Time, newDescription?:string, newRepeat?: boolean,
                                      newMentionPrivat? : boolean) {
    // Check for only one appointment object
    let count = 0;
    let appointment : Appointment;
    for (let a of appointments) {
        if (a.date.toString() == date.toString() && (oldStart == undefined || a.start.toString() == oldStart.toString())) {
            count = count + 1;
            appointment = a;
        }
    }
    if (count != 1) {
        return;
    }

    // modify object and message
    await findMessages(channel, date, oldStart).then(messages => {
        if (messages.length == 1) {
            if (newStart != undefined) {
                appointment.start = newStart;
            }
            if (newEnd != undefined) {
                appointment.end = newEnd;
            }
            if (newDescription != undefined) {
                appointment.description = newDescription;
            }
            if (newRepeat != undefined) {
                appointment.repeat = newRepeat;
            }
            if (newMentionPrivat != undefined) {
                appointment.doPrivateMention = newMentionPrivat
            }
            messages[0].edit({content: appointment.toString()});

            if (removeReactions) {
                messages[0].edit({embeds: []})
            }
        }
    });

    saveAppointments();
}

export async function buttonClick(interaction : ButtonInteraction) : Promise<void> {
    const replyMap = new Map<string, string>([
        ["there", "Du hast zugesagt"],
        ["notThere", "Du hast abgesagt"],
        ["discord", "Du bist über Discord dabei"],
        ["unsure", "Du bist dir unsicher"]
    ]);
    const intID = interaction.customId


    await interaction.reply({ephemeral: true, content: replyMap.get(intID)})

    if (interaction.member != null) {
        await setStatus(intID, getName(interaction.member), interaction.message)
    }
}

export async function reacted(reaction : MessageReaction, user : GuildMember) {
    const emojiMap = new Map<string, string>([
        ["anwesend", "there"],
        ["abwesend", "notThere"],
        ["discord", "discord"]
    ]);

    const status = emojiMap.get(reaction.emoji.name != null ? reaction.emoji.name : "")
    if (status != undefined) {
        let message;
        if (reaction.message.partial) {
            await reaction.message.fetch().then(m => setStatus(status, !user.partial ? getName(user) :"", m))
        } else {
            await setStatus(status, !user.partial ? getName(user) :"", reaction.message)
        }
    }
}

async function setStatus(status:string, name:string, message:Message) {
    let a = findAppointmentByMessage(message)

    if (status == "there") {
        a.addThere(name)
    } else if (status == "notThere") {
        a.addNotThere(name)
    } else if (status == "discord") {
        a.addOnline(name)
    }

    await message.edit({embeds: [a.getEmbed()]})

    saveAppointments();
}


export function readAppointments() {
    appointments = []
    let json = readFileSync(path).toString()
    for (let j of JSON.parse(json)) {
        appointments.push(jsonToAppointment(JSON.stringify(j)))
    }
}

function saveAppointments() : void {
    writeFileSync(path, JSON.stringify(appointments))
}

async function findMessages(channel : TextBasedChannel, date? : Day, start? : Time) : Promise<Message[]> {

    return await channel.messages.fetch({ limit: 20 }).then(messages => {
        //Iterate through the messages here with the variable "messages".
        let arr : Message[] = []
        messages.forEach(message => {
            if (date != undefined) {
                let lines = message.content.split("\n");
                let dateLine = "";
                if (lines.length >= 1 && lines[0].at(0) != '<' && lines[0].at(0) != '@') {
                    dateLine = lines[0];
                } else if (lines.length >= 2) {
                    dateLine = lines[1]
                }
                let dateLineSplits = dateLine.split(" ");
                if (dateLineSplits.length >= 2) {
                    let offset = new RegExp("\\d\\d\\.\\d\\d\\.").test(dateLineSplits[0]) ? 0:1;
                    if (dateLineSplits[offset] === date.toString()) {
                        if (start == undefined || (dateLineSplits.length >= 4 && dateLineSplits[2 + offset] == start.toString())) {
                            arr.push(message);
                        }
                    }
                }
            } else {
                arr.push(message);
            }
        });
        return arr;
    });
}

function findAppointmentByMessage(m : Message) : Appointment {
    const mContent = m.content;

    for (let a of appointments) {
        if (a.toString() === mContent) {
            return a
        }
    }
    return new NullAppointment()
}

function getName(user: GuildMember | APIInteractionGuildMember) : string {
    // @ts-ignore
    return user.nickname.split(" | ")[0];
}

function getEmojis(client : Client) {
    const emojis = client.emojis.cache.values();
    for (let emoji of emojis) {
        if (emoji.name == "Quad") {
            thereEmoji = emoji;
        }
    }
}