import {Appointment, jsonToAppointment} from "./Appointment";
import {readFileSync, writeFileSync} from "fs";
import {Day} from "./Day";
import {ButtonComponent, ButtonInteraction, ButtonStyle, Client, Message, TextBasedChannel} from "discord.js";
import {Time} from "./Time";
import NullAppointment from "./NullAppointment";
import {start} from "repl";

let appointments : Appointment[] = [];
const path = "data/appointments.json";

export function readAppointments() {
    appointments = []
    let json = readFileSync(path).toString()
    for (let j of JSON.parse(json)) {
        appointments.push(jsonToAppointment(JSON.stringify(j)))
    }
}

export async function manageAppointments(client:Client) {
    let d = new Date();
    const day = new Day(d.getDate(), d.getMonth() + 1, d.getFullYear());
    for (let a of appointments) {
        if (day.isAfter(a.date)) {
            await client.channels.fetch(a.channel).then(() => {


            let c = client.channels.cache.get(a.channel)
            if (c != undefined) {
                let channel = c as TextBasedChannel
                deleteAppointment(a.date, channel);
                if (a.repeat) {
                    let repeat = new Appointment(
                        a.mention,
                        a.date.nextWeek(),
                        a.start,
                        a.end,
                        a.description,
                        true,
                        a.channel
                    );
                    addAppointment(repeat, channel);
                }
            }
        });}
    }
}

export async function addAppointment(a:Appointment, c:TextBasedChannel) {
    appointments.push(a)
    saveAppointments()

    c.send({content:a.toString(), /*embeds:[a.getEmbed()],*/ components:[
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
                    }
                ]
            }
        ]});
}

export async function deleteAppointment(date:Day, channel:TextBasedChannel) {
    await findMessages(channel, date).then(messages => {
        messages.forEach(function (m) {
            m.delete();
            });
        }
    );

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

export async function editAppointment(channel:TextBasedChannel, date:Day, removeReactions: boolean, newStart?:Time, newEnd?:Time,
                                      newDescription?:string, newRepeat?: boolean) {
    let count = 0;
    let appointment : Appointment;
    for (let a of appointments) {
        if (a.date.toString() == date.toString()) {
            count = count + 1;
            appointment = a;
        }
    }
    if (count != 1) {
        return;
    }

    await findMessages(channel, date).then(messages => {
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
            messages[0].edit({content: appointment.toString()})
            if (removeReactions) {
                messages[0].edit({embeds: []})
            }
        }
    });

    saveAppointments();
}

function saveAppointments() : void {
    writeFileSync(path, JSON.stringify(appointments))
}

export async function buttonClick(interaction : ButtonInteraction) : Promise<void> {
    const replyMap = new Map<string, string>([
        ["there", "Du hast zugesagt"],
        ["notThere", "Du hast abgesagt"],
        ["discord", "Du bist über Discord dabei"]
    ]);
    const intID = interaction.customId

    await interaction.reply({ephemeral: true, content: replyMap.get(intID)})

    let a = findAppointmentByMessage(interaction.message)

    if (interaction.member != null) {
        // @ts-ignore
        const name: string = interaction.member.nickname.split(" | ")[0];
        if (intID == "there") {
            a.addThere(name)
        } else if (intID == "notThere") {
            a.addNotThere(name)
        } else if (intID == "discord") {
            a.addOnline(name)
        }
        await interaction.message.edit({embeds: [a.getEmbed()]})
    }

    saveAppointments();
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
                    let messageDate : string = dateLineSplits[1];
                    if (messageDate === date.toString()) {
                        //message.delete();
                        arr.push(message);
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