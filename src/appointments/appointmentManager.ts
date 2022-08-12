import {Appointment, jsonToAppointment} from "./Appointment";
import {readFileSync, writeFileSync} from "fs";
import {Day} from "./Day";
import {ButtonComponent, ButtonInteraction, ButtonStyle, Client, TextBasedChannel} from "discord.js";

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
    channel.messages.fetch({ limit: 20 }).then(messages => {
        //Iterate through the messages here with the variable "messages".
        messages.forEach(message => {
                let lines = message.content.split("\n");
                let dateLine = "";
                if (lines.length >= 1 && lines[0].at(0) != '<' && lines[0].at(0) != '@') {
                    dateLine = lines[0];
                } else if (lines.length >= 2) {
                    dateLine = lines[1]
                }
                let messageDate : string = dateLine.substring(0, 6);
                const dateRegEx = new RegExp("\\d\\d\\.\\d\\d\\.")
                if (messageDate.match(dateRegEx) && messageDate === date.toString()) {
                    message.delete();
                }
            }

        )
    })

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

    await interaction.reply({ephemeral:true, content:replyMap.get(intID)})

    const messageContent = interaction.message.content;
    for (let a of appointments) {
        if (a.toString() === messageContent) {;

            if (interaction.member != null) {
                // @ts-ignore
                const name : string = interaction.member.nickname.split(" | ")[0];
                if (intID == "there") {
                    a.isThere(name)
                } else if (intID == "notThere") {
                    a.isNotThere(name)
                } else if (intID == "discord") {
                    a.isOnline(name)
                }
                await interaction.message.edit({embeds:[a.getEmbed()]})
            }

            break;
        }
    }

    saveAppointments();
}