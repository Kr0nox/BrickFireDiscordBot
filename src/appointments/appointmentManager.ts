import {Appointment, jsonToAppointment} from "./Appointment";
import {readFileSync, writeFileSync} from "fs";
import {Day} from "./Day";
import {ButtonComponent, ButtonInteraction} from "discord.js";

let appointments : Appointment[] = [];
const path = "data/appointments.json";

export function readAppointments() {
    appointments = []
    let json = readFileSync(path).toString()
    for (let j of JSON.parse(json)) {
        appointments.push(jsonToAppointment(JSON.stringify(j)))
    }
}

export function addAppointment(a : Appointment): void {
    appointments.push(a)
    saveAppointments()
}

export function deleteAppointment(date:Day): void {
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